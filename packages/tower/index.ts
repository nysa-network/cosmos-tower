import { Config, Chain, CosmosProposal } from "./types";
import { CosmosChain } from "../cosmos";
import { CosmosDiscord } from "../discord";

import Long from "long";

import { TextProposal, VoteOption } from "cosmjs-types/cosmos/gov/v1beta1/gov";
import {
  Client as DiscordClient,
  Interaction,
  Events,
  TextChannel,
} from "discord.js";

let VoteMap = new Map<string, VoteOption>([
  ["VOTE_YES", VoteOption.VOTE_OPTION_YES],
  ["VOTE_NO", VoteOption.VOTE_OPTION_NO],
  ["VOTE_ABSTAIN", VoteOption.VOTE_OPTION_ABSTAIN],
  ["VOTE_NO_WITH_VETO", VoteOption.VOTE_OPTION_NO_WITH_VETO],
]);

export class Tower {
  config: Config;

  chains: CosmosChain[];
  discord: DiscordClient;

  constructor(cfg: Config) {
    this.config = cfg;
    this.chains = [];

    for (let chain of cfg.chains) {
      let c = new CosmosChain({
        name: chain.name,
        chain_id: chain.chain_id,
        rpc: chain.rpc,
        grantee_mnemonic: cfg.grantee_mnemonic,
        voter_address: chain.voter_address,
        gas: chain.gas,
      });
      this.chains.push(c);
    }

    this.discord = new DiscordClient({
      intents: [],
    });
  }

  async init() {
    this.discord.on(Events.InteractionCreate, this.onMsgResponse.bind(this));

    await this.discord.login(this.config.discord.token);
  }

  async onMsgResponse(interaction: Interaction) {
    if (!interaction.isButton()) {
      return;
    }
    // let [chain_id, prop_id, vote_str] = interaction.customId.split(";");
    let custom_ids: string[] = interaction.customId.split(";");
    const chain_id = custom_ids[0];
    const prop_id = Long.fromString(custom_ids[1]);
    const vote = VoteMap.get(custom_ids[2])!;

    const chain = this.chains.find((c: CosmosChain) => c.chain_id == chain_id);
    if (!chain) {
      interaction.reply({ content: `[ERROR] unknown chain` });
      return;
    }
    await interaction.deferReply();
    const resp = await chain.vote(prop_id as Long, vote);

    await interaction.message.react("🆗");

    await interaction.editReply({
      content: `Voted! see tx: ${resp.transactionHash}`,
    });

    // await interaction.reply({ content: `Voted! see tx: ` });
  }

  async start() {
    await this.init();

    for (const chain of this.chains) {
      const proposals = await chain.get_proposals();

      for (const p of proposals) {
        let content: TextProposal | undefined =
          p.content as any as TextProposal;
        console.log(`[PROPOSAL] #${p.proposalId} - ${content.title}`);
        // console.log(`[PROPOSAL] #${p.proposalId} - ${content.title}\n${content.description}`)

        await this.NewProposal({
          proposal_id: p.proposalId,
          chain_id: chain.chain_id,
          chain_name: chain.name,

          title: content?.title,
          description: content?.description,
        });
        // await c.vote(p.proposalId)
        break;
      }
    }
  }

  // NewProposal send a discord message for a proposal
  async NewProposal(prop: CosmosProposal) {
    const prefix = `${prop.chain_id};${prop.proposal_id}`;
    let msg = {
      // "channel_id": `${context.params.event.channel_id}`,
      content: `[${prop.chain_name}] NEW PROPOSAL \`#${prop.proposal_id}\` - ${prop.title}\n\n${prop.description}`,
      tts: false,
      components: [
        {
          type: 1,
          components: [
            {
              style: 1,
              label: `YES`,
              custom_id: `${prefix};VOTE_YES`,
              disabled: false,
              type: 2,
            },
            {
              style: 1,
              label: `ABSTAIN`,
              custom_id: `${prefix};VOTE_ABSTAIN`,
              disabled: false,
              type: 2,
            },
            {
              style: 1,
              label: `NO`,
              custom_id: `${prefix};VOTE_NO`,
              disabled: false,
              type: 2,
            },
            {
              style: 1,
              label: `NO WITH VETO`,
              custom_id: `${prefix};VOTE_NWV`,
              disabled: false,
              type: 2,
            },
          ],
        },
      ],
    };
    const channel = (await this.discord.channels.fetch(
      this.config.discord.channel_id
    )) as TextChannel;

    channel.send(msg);
    console.log(channel);
    // const resp = await this.client.send(msg)
    // console.log(resp)
  }
}
