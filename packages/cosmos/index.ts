import { bech32 } from "bech32";

import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { Tendermint34Client } from "@cosmjs/tendermint-rpc";
import {
  QueryClient,
  setupGovExtension,
  GasPrice,
  SigningStargateClient,
} from "@cosmjs/stargate";

import {
  ProposalStatus,
  TextProposal,
  Proposal,
  VoteOption,
} from "cosmjs-types/cosmos/gov/v1beta1/gov";
import * as gov_v1beta1tx from "cosmjs-types/cosmos/gov/v1beta1/tx";
import { AccountData } from "@cosmjs/launchpad";

export interface Config {
  name: string;
  chain_id: string;
  rpc: string;
  grantee_mnemonic: string;
  voter_address: string;
  gas: string;
}

export class CosmosChain {
  name: string;
  chain_id: string;
  rpc_endpoint: string;
  grantee_mnemonic: string;
  voter_address: string;
  prefix: string;
  gas: string;

  constructor(config: Config) {
    this.name = config.name;
    this.chain_id = config.chain_id;
    this.rpc_endpoint = config.rpc;
    this.grantee_mnemonic = config.grantee_mnemonic;
    this.voter_address = config.voter_address;
    this.gas = config.gas;

    const { prefix } = bech32.decode(config.voter_address);
    this.prefix = prefix;
  }

  // @get_proposals
  async get_proposals(): Promise<Proposal[]> {
    var tmClient = await Tendermint34Client.connect(this.rpc_endpoint);
    const qclient = QueryClient.withExtensions(tmClient, setupGovExtension);
    // @ts-ignore
    const { proposals, pagination } = await qclient.gov.proposals(
      ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD,
      "",
      ""
    );
    // TODO: iterate over pagination

    return proposals.map((proposal: Proposal) => ({
      ...proposal,
      content: TextProposal.decode(proposal.content!.value) as any,
    }));
  }

  // @vote
  async vote(proposalId: Long, vote: VoteOption) {
    // const addr = "stars13lxkjj7959yda7xqrlrf07zenmgrezheypxzvs";

    const signer = await DirectSecp256k1HdWallet.fromMnemonic(
      this.grantee_mnemonic,
      {
        prefix: this.prefix,
      }
    );

    // TODO: check if enough token to vote
    const accounts = await signer.getAccounts();
    const addr = accounts.find((acc: AccountData) =>
      acc.address.startsWith(this.prefix)
    )!;

    const client = await SigningStargateClient.connectWithSigner(
      this.rpc_endpoint,
      signer,
      {
        gasPrice: GasPrice.fromString(this.gas),
      }
    );

    let msgVote: gov_v1beta1tx.MsgVote = gov_v1beta1tx.MsgVote.fromPartial({
      proposalId: proposalId,
      voter: this.voter_address,
      option: vote,
    });

    const msg = {
      typeUrl: "/cosmos.authz.v1beta1.MsgExec",
      value: {
        grantee: addr.address,
        msgs: [
          {
            typeUrl: "/cosmos.gov.v1beta1.MsgVote",
            value: gov_v1beta1tx.MsgVote.encode(msgVote).finish(),
          },
        ],
      },
    };

    const resp = await client.signAndBroadcast(
      addr.address,
      [msg as any],
      "auto",
      `Voted using https://github.com/nysa-network/cosmos-tower`
    );
    return resp;
  }

  // @has_voted
  async has_voted(proposalId: Long): Promise<boolean> {
    var tmClient = await Tendermint34Client.connect(this.rpc_endpoint);
    const qclient = QueryClient.withExtensions(tmClient, setupGovExtension);

    try {
      await qclient.gov.vote(proposalId, this.voter_address);
      return true;
    } catch (err) {
      if (err.message.match(/.*voter: .*not found for proposal:.*/)) {
        return false;
      }
      throw err;
    }
  }
}
