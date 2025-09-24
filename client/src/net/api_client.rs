use anyhow::Result;
use reqwest::{Client, StatusCode};
use std::time::Duration;
use tokio::time::MissedTickBehavior;
use tokio::time::interval;

use crate::models::api_response::ApiResponse;
use crate::models::config::Config;

pub struct ApiClient {
    http: Client,
    config: Config,
}

impl ApiClient {
    pub fn new(cfg: &Config) -> Result<Self> {
        let http: Client = Client::builder()
            .danger_accept_invalid_certs(true)
            .build()?;
        Ok(Self {
            http,
            config: cfg.clone(),
        })
    }

    pub async fn send_payload(&mut self) -> Result<()> {
        let path = format!("{}/api/ddns/sync", self.config.server);

        let Ok(res) = self
            .http
            .post(path)
            .bearer_auth(&self.config.token)
            .json(&self.config.payload)
            .send()
            .await
        else {
            println!("Connecting...");
            return Ok(());
        };
            
        match res.status() {
            StatusCode::OK => {
                let body: ApiResponse = res.json().await?;
                println!("{:?}", body);
                self.config.payload.sync_session = Some(body.data.sync_session);
                let sync_session = self.config.payload.sync_session.as_ref().unwrap();
                println!("New sync_session: {}", sync_session);
            }
            _ => {
                println!("{}", res.status());
            }
        }
        Ok(())
    }

    pub async fn start(&mut self) {
        println!("started");

        let mut ticker = interval(Duration::from_secs(5));
        ticker.set_missed_tick_behavior(MissedTickBehavior::Skip);

        loop {
            ticker.tick().await;
            let _ = self.send_payload().await;
        }
    }
}
