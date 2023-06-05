import * as fs from "fs";

export interface Chain {
  chain_id: string;
  proposals: number[];
}

export class TowerDB {
  db_file: string;
  chains: Chain[];

  constructor(db_file: string) {
    this.chains = [];
    this.db_file = db_file;
  }

  get_chain(chain_id: string): Chain {
    return this.chains.find((c: Chain) => c.chain_id === chain_id)!;
  }

  add_proposal(chain_id: string, proposal_id: number) {
    let chain = this.get_chain(chain_id)!;

    if (!chain) {
      chain = {
        chain_id: chain_id,
        proposals: [proposal_id],
      };
      this.chains.push(chain);
    } else if (chain.proposals.indexOf(proposal_id) === -1) {
      chain.proposals.push(proposal_id);
    }
    chain.proposals.sort();
  }

  contain(chain_id: string, proposal_id: number): boolean {
    let c = this.get_chain(chain_id);
    return c && c.proposals.indexOf(proposal_id) !== -1;
  }

  load() {
    if (!fs.existsSync(this.db_file)) {
      fs.writeFileSync(this.db_file, "[]", { flag: "w" });
      return;
    }
    const out = fs.readFileSync(this.db_file, "utf-8");
    let chains = JSON.parse(out) || [];
    this.chains = chains as Chain[];
  }

  store() {
    let content = JSON.stringify(this.chains);
    fs.writeFileSync(this.db_file, content);
  }
}
