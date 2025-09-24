use anyhow::Result;
use serde::{Deserialize, Serialize};
use toml;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Payload {
    pub sync_session: Option<String>,
    pub username: String,
    pub domains: Vec<Domain>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Domain {
    pub name: String,
    pub proxy: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Config {
    pub server: String,
    pub token: String,
    pub payload: Payload,
}

impl Config {
    pub fn load_from(path: &str) -> Result<Config, anyhow::Error> {
        let raw = std::fs::read_to_string(path)?;
        let cfg: Config = toml::from_str(&raw).unwrap();
        Ok(cfg)
    }
}
