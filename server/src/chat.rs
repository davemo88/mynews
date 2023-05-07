use lazy_static::lazy_static;
use serde::{Deserialize, Serialize};

lazy_static! {
    static ref OPENAI_API_KEY: String = std::env::var("OPENAI_API_KEY").unwrap();
}

#[derive(Serialize, Deserialize, Debug)]
enum Model {
    #[serde(rename="gpt-3.5-turbo", alias="gpt-3.5-turbo-0301")]
    GPT35Turbo,
}

#[derive(Serialize)]
struct ChatRequestBody<'a> {
    model: Model,
    messages: &'a[Message],
    temperature: f32,
}

#[derive(Clone, Serialize, Deserialize, Debug)]
pub struct Message {
    role: Role,
    pub content: String,
}

impl Message {
    pub fn as_user(content: String) -> Self {
        Self {
            content,
            role: Role::User,
        }
    }
}

#[derive(Clone, Serialize, Deserialize, Debug)]
enum Role {
    #[serde(rename="user")]
    User,
    #[serde(rename="assistant")]
    Assistant,
}

const OPENAI_API_URL: &str = "https://api.openai.com/v1/chat/completions";

pub async fn chat(message: Message, _messages: &mut Vec<Message>) -> Message {
    let reply = reqwest::Client::new()
        .post(OPENAI_API_URL)
            .header("Authorization", format!("Bearer {}", OPENAI_API_KEY.as_str()))
            .json(&ChatRequestBody {
                model: Model::GPT35Turbo,
                temperature: 0.7,
                messages: &[message],
            })
        .send()
        .await
        .unwrap()
        .json::<ChatResponse>()
        .await
        .unwrap()
        .choices
        .first()
        .unwrap()
        .message
        .clone();
    println!("{}",reply.content);
    reply
}

#[derive(Deserialize, Debug)]
struct ChatResponse {
    pub choices: Vec<Choice>,
}

#[derive(Deserialize, Debug)]
#[serde(rename="choices")]
struct Choice {
    pub message: Message,
}
