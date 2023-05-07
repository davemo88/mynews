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
const ARTICLE_TEMPLATE_VARIABLE: &str = "ARTICLE";
const PREAMBLE_TEMPLATE: &str = "As a journalist, rewrite the following headline to appeal to a AUDIENCE audience: ARTICLE";

mod chat;
use chat::chat;

#[derive(Debug, Deserialize)]
struct MyNewsRequest {
    pub content: String,
    pub audience: String,
}

async fn mynews(Json(req): Json<MyNewsRequest>) -> impl IntoResponse {
    let mut messages = vec!();
    println!("request: {:?}", req);
    let message = PREAMBLE_TEMPLATE.replace(AUDIENCE_TEMPLATE_VARIABLE, &req.audience.to_string()).replace(ARTICLE_TEMPLATE_VARIABLE, &req.content); 
    let reply = chat(Message::as_user(message), &mut messages).await;
    (StatusCode::OK, Json(reply.content))
}
    
#[tokio::main]
async fn main() {
    let router = Router::new().route("/mynews", post(mynews))
        .layer(CorsLayer::new()
            .allow_methods([Method::POST])
            .allow_headers(Any)
            .allow_origin(Any));
    let addr = SocketAddr::from(([0, 0, 0, 0], 3000));
    let _ = tokio::spawn(axum::Server::bind(&addr).serve(router.into_make_service())).await.unwrap();
}
