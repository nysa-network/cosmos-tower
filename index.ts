#!/usr/bin/env node

import yargs from "yargs";

const argv = yargs(process.argv.slice(2))
  .commandDir("cmds", {
    extensions: ["js", "ts"],
  })
  .demandCommand()
  .help().argv;

