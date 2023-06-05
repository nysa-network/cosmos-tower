import * as fs from "fs";
import YAML from "yaml";
import yargs from "yargs";

import { Config } from "../internal/config/Config";
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
};
