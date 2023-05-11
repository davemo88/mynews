use std::net::SocketAddr;
use reqwest::Method;
use tower_http::cors::{CorsLayer, Any};

use axum::{
    http::StatusCode, 
    response::IntoResponse, routing::post, Json, Router,
};
use chat::Message;
use serde::Deserialize;

const AUDIENCE_TEMPLATE_VARIABLE: &str = "AUDIENCE";
const HEADLINE_TEMPLATE_VARIABLE: &str = "HEADLINE";
const HEADLINE_PROMPT_TEMPLATE: &str = "As a journalist, rewrite the following headline to appeal to a AUDIENCE audience: HEADLINE";
const FRAGMENT_TEMPLATE_VARIABLE: &str = "FRAGMENT";
const FRAGMENT_PROMPT_TEMPLATE: &str = "As a journalist, rewrite the following part of a news article to appeal to a AUDIENCE audience: FRAGMENT";

mod chat;
use chat::chat;

#[derive(Debug, Deserialize)]
struct MyNewsRequest {
    pub content: String,
    pub audience: String,
}

async fn prompt(request: MyNewsRequest, prompt_template: &str, template_variable: &str) -> String {
    let mut messages = vec!();
    println!("prompt data: {:?}", request);
    let message = prompt_template.replace(AUDIENCE_TEMPLATE_VARIABLE, &request.audience.to_string()).replace(template_variable, &request.content); 
    let reply = chat(Message::as_user(message), &mut messages).await;
    reply.content
}

async fn headline(Json(request): Json<MyNewsRequest>) -> impl IntoResponse {
    (StatusCode::OK, Json(prompt(request, HEADLINE_PROMPT_TEMPLATE, HEADLINE_TEMPLATE_VARIABLE).await))
}

async fn fragment(Json(request): Json<MyNewsRequest>) -> impl IntoResponse {
    (StatusCode::OK, Json(prompt(request, FRAGMENT_PROMPT_TEMPLATE, FRAGMENT_TEMPLATE_VARIABLE).await))
}
    
#[tokio::main]
async fn main() {
    let router = Router::new()
        .route("/headline", post(headline))
        .route("/fragment", post(fragment))
        .layer(CorsLayer::new()
            .allow_methods([Method::POST])
            .allow_headers(Any)
            .allow_origin(Any));
    let addr = SocketAddr::from(([0, 0, 0, 0], 3000));
    let _ = tokio::spawn(axum::Server::bind(&addr).serve(router.into_make_service())).await.unwrap();
}
