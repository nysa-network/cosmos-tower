import axios from "axios";

import { bech32 } from "bech32";

import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { Tendermint34Client } from "@cosmjs/tendermint-rpc";
import {
  QueryClient,
  setupGovExtension,
  GasPrice,
  SigningStargateClient,
  calculateFee,
} from "@cosmjs/stargate";

import {
  ProposalStatus,
  TextProposal,
  Proposal,
  Vote,
  VoteOption,
} from "cosmjs-types/cosmos/gov/v1beta1/gov";
import * as gov_v1beta1tx from "cosmjs-types/cosmos/gov/v1beta1/tx";
import * as authztx from "cosmjs-types/cosmos/authz/v1beta1/tx";

import { Any } from "cosmjs-types/google/protobuf/any";

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
    const { proposals, pagination } = await qclient.gov.proposals(
      ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD,
      "",
      ""
    );

    return proposals.map((proposal: Proposal) => ({
      ...proposal,
      content: TextProposal.decode(proposal.content!.value) as any,
    }));
  }

  // @vote
  async vote(proposalId: Long, vote: VoteOption) {
    const MNEMONIC =
      "blast acquire powder bullet atom easily pipe bone exact nuclear august crystal segment abstract subway public chunk quote monster robust bundle own friend crime";
    const addr = "stars13lxkjj7959yda7xqrlrf07zenmgrezheypxzvs";

    const signer = await DirectSecp256k1HdWallet.fromMnemonic(MNEMONIC, {
      prefix: this.prefix,
    });

    // const accounts = await signer.getAccounts()
    // console.log("accounts ", accounts)

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
      option: VoteOption.VOTE_OPTION_YES,
    });

    const msg = {
      typeUrl: "/cosmos.authz.v1beta1.MsgExec",
      value: {
        grantee: addr,
        msgs: [
          {
            typeUrl: "/cosmos.gov.v1beta1.MsgVote",
            value: gov_v1beta1tx.MsgVote.encode(msgVote).finish(),
          },
        ],
      },
    };

    const resp = await client.signAndBroadcast(
      addr,
      [msg as any],
      "auto",
      `Voted using https://github.com/nysa-network/cosmos-tower`
    );
    return resp;
  }
}
