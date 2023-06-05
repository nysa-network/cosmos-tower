export interface Config {
  database: string;
  discord: {
    channel_id: string;
    token: string;
  };
  // discord_webhook: string;
  // discord_token: string;
  grantee_mnemonic: string;
  chains: Chain[];
}

export interface Chain {
  name: string;
  chain_id: string;
  rpc: string;
  voter_address: string;
  gas: string;
}
