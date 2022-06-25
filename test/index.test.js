import * as fsb from "fs";
import { generateFile } from "../lib/index.js";
import path from "path";
import tap from "libtap";

const fs = fsb.promises;

async function metaTest() {
  const dir = tap.testdir({
    "foo.peggy": tap.fixture(
      "symlink",
      path.join("..", "..", "examples", "foo.peggy")
    ),
  });

  const testFile = path.join(dir, "foo.test.md");
  await generateFile({
    generate: path.join(dir, "foo.peggy"),
    testFile,
  });

  const testTxt = await fs.readFile(testFile, "utf8");
  tap.match(testTxt, /^---/, "wrote test file");

  await tap.spawn(process.argv0, [
    "bin/peggy-test.js",
    "test/test_md.test.md",
  ]);

  await tap.spawn(process.argv0, [
    "bin/peggy-test.js",
    "examples/foo.test.md",
  ]);

  tap.end();
}

metaTest().catch(er => {
  console.error(er);
  process.exit(1);
});
