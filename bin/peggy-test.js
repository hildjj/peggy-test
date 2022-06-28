#!/usr/bin/env node

import { Command, Option } from "commander";
import { generateFile, testFile } from "../lib/index.js";

const program = new Command();
const opts = program
  .argument("<testFile>", "The file to test")
  .allowExcessArguments(false)
  .option("-f, --force", "With --update, updates all tests, not just ones without output already specified.  With --generate, overwrites a file if it already exists.  With neither, un-skips all skipped tests.")
  .addOption(new Option(
    "-g, --generate <sourceGrammar>",
    "Generate a new test file from a grammar"
  ).conflicts("update"))
  .option("-q, --quiet", "Output as liitle info as possible")
  .option("-u, --update", "Update the test file with the current test outputs")
  .parse()
  .opts();

opts.testFile = program.args[0];
const prom = opts.generate ? generateFile(opts) : testFile(opts);

prom.catch(er => {
  console.error(er);
  process.exit(2);
});
