import { TextProposal } from "cosmjs-types/cosmos/gov/v1beta1/gov";
import { Interaction } from "discord.js";
import * as fs from "fs";
import YAML from "yaml";
import yargs from "yargs";

import { Config, Chain } from "../internal/config/Config";
// import { CosmosChain } from "../packages/cosmos";
// import { CosmosDiscord } from "../packages/discord";
import { Tower } from "../packages/tower";

export const command = "start";

export const describe = "start cosmos-tower";

export const builder = {
  config: {
    alias: "c",
    default: "./config.yml",
  },
};

export const handler = async function (argv: yargs.ArgumentsCamelCase) {
  let configFile = fs.readFileSync(argv.config as string, "utf-8").toString();
  let config: Config = YAML.parse(configFile);
  // console.log(config);

  let tower = new Tower(config);
  tower.start();

  // let discord = new CosmosDiscord(
  //   config.discord.channel_id,
  //   config.discord.token
  // );

  // let chains: CosmosChain[] = [];

  // for (let chain of config.chains) {
  //   let c = new CosmosChain({
  //     name: chain.name,
  //     rpc: chain.rpc,
  //     grantee_mnemonic: config.grantee_mnemonic,
  //     voter_address: chain.voter_address,
  //     gas: chain.gas,
  //   });
  //   chains.push(c);
  // }

  // for (let chain of config.chains) {
  //   let c = new CosmosChain({
  //     name: chain.name,
  //     rpc: chain.rpc,
  //     grantee_mnemonic: config.grantee_mnemonic,
  //     voter_address: chain.voter_address,
  //     gas: chain.gas,
  //   });

  //   console.log(chain);
  //   const proposals = await c.get_proposals();

  //   for (const p of proposals) {
  //     let content: TextProposal | undefined = p.content as any as TextProposal;
  //     console.log(`[PROPOSAL] #${p.proposalId} - ${content.title}`);
  //     // console.log(`[PROPOSAL] #${p.proposalId} - ${content.title}\n${content.description}`)

  //     await discord.NewProposal({
  //       proposal_id: p.proposalId,
  //       chain_id: chain.chain_id,
  //       chain_name: chain.name,

  //       title: content?.title,
  //       description: content?.description,
  //     });
  //     // await c.vote(p.proposalId)
  //     break;
  //   }
  // }
};
