import { Client, Events, Interaction, TextChannel } from "discord.js";

export interface CosmosProposal {
  chain_id: string;
  chain_name: string;
  proposal_id: Long;
  title: string;
  description: string;
}

export class CosmosDiscord {
  client: Client;
  channel_id: string;
  token: string;

  constructor(channel_id: string, token: string) {
    this.channel_id = channel_id;
    this.token = token;

    this.client = new Client({
      intents: [],
    });
  }

  async start() {
    this.client.on(Events.InteractionCreate, this.onMsgResponse);

    await this.client.login(this.token);
  }

  async onMsgResponse(interaction: Interaction) {
    if (!interaction.isButton()) {
      return;
    }
    console.log("RECV ", interaction.customId);

    // console.log(interaction)

    await interaction.message.react("🆗");
    interaction.reply({ content: `Voted! see tx: ` });
  }

  // SendNewPropMessage
  async NewProposal(prop: CosmosProposal) {
    const prefix = `${prop.chain_id};${prop.proposal_id}`;
    let msg = {
      // "channel_id": `${context.params.event.channel_id}`,
      content: `[CHAIN] NEW PROPOSAL \`#${prop.proposal_id}\` - ${prop.title}\n\n${prop.description}`,
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
    const channel = (await this.client.channels.fetch(
      this.channel_id
    )) as TextChannel;
    channel.send(msg);
    console.log(channel);
    // const resp = await this.client.send(msg)
    // console.log(resp)
  }
}
