#!/usr/bin/env node

import { generateFile, testFile } from "../lib/index.js";
import { Command } from "commander";

const program = new Command();
const opts = program
  .argument("<testFile>", "The file to test")
  .allowExcessArguments(false)
  .option("-u, --update", "Update the test file with the current test outputs")
  .option("-g, --generate <sourceGrammar>", "Generate a new test file from a grammar")
  .option("-q, --quiet", "Output as liitle info as possible")
  .parse()
  .opts();

opts.testFile = program.args[0];
const prom = opts.generate ? generateFile(opts) : testFile(opts);

prom.catch(er => {
  console.error(er);
  process.exit(2);
});
