mod models;
mod net;

use crate::models::config::Config;
use crate::net::api_client::ApiClient;

const CONFIG_PATH: &str = "/etc/ddns/config.toml";
// const DEFAULT_INTERVAL_SECS: u64 = 60;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let cfg = Config::load_from(CONFIG_PATH).unwrap();

    println!("Load config:\n");
    println!("{:?}", cfg.server);

    let mut ddns_client = ApiClient::new(&cfg).unwrap();
    ddns_client.start().await;
    Ok(())
}
