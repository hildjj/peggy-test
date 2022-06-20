#!/usr/bin/env node

import { Command } from "commander";
import { testFile } from "../lib/index.js";

const program = new Command();
const opts = program
  .argument("<testFile>", "The file to test")
  .allowExcessArguments(false)
  .option("-u, --update", "Update the test file with the current test outputs")
  .parse()
  .opts();

testFile({
  ...opts,
  testFile: program.args[0],
}).catch(er => {
  console.error(er);
  process.exit(2);
});

