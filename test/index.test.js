import * as fsb from "fs";
import { outputCodeBlock } from "../lib/index.js";
import path from "path";
import tap from "libtap";
import url from "url";

const fs = fsb.promises;
const node = process.execPath;

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const updatedRe = /^updated: [^\r\n]+\n/m;
function normalize(str) {
  return str.replace(updatedRe, "");
}

async function metaTest() {
  tap.throws(() => outputCodeBlock(null, {
    src: "```",
    marks: "```",
  }));

  tap.throws(() => outputCodeBlock(null, {
    src: "```",
  }));

  tap.throws(() => outputCodeBlock(null, {
    src: "~~~",
    marks: "~~~",
  }));

  const originalFoo = await fs.readFile(
    path.resolve(__dirname, "..", "examples", "foo.test.md"),
    "utf8"
  );
  const dir = tap.testdir({
    "foo.peggy": tap.fixture(
      "symlink",
      path.join("..", "..", "examples", "foo.peggy")
    ),
    "foo.test.md": originalFoo,
  });

  const testFile = path.join(dir, "foo-g.test.md");
  await tap.spawn(node, [
    "bin/peggy-test.js",
    "-g",
    path.join(dir, "foo.peggy"),
    testFile,
  ]);

  const testTxt = await fs.readFile(testFile, "utf8");
  tap.match(testTxt, /^---/, "wrote test file");

  // Can't overwite without force
  await tap.spawn(node, [
    "bin/peggy-test.js",
    "-g",
    path.join(dir, "foo.peggy"),
    testFile,
  ], { expectFail: true });

  await tap.spawn(node, [
    "bin/peggy-test.js",
    "--force",
    "-g",
    path.join(dir, "foo.peggy"),
    testFile,
  ]);

  await tap.spawn(node, [
    "bin/peggy-test.js",
    "test/test_md.test.md",
  ]);

  await tap.spawn(node, [
    "bin/peggy-test.js",
    "examples/foo.test.md",
  ]);

  await tap.spawn(node, [
    "bin/peggy-test.js",
    "test/todo.test.md",
  ]);

  await tap.spawn(node, [
    "bin/peggy-test.js",
    "-q",
    "test/error.test.md",
  ], { expectFail: true });

  await tap.spawn(node, [
    "bin/peggy-test.js",
    "test/noSource.test.md",
  ], { expectFail: true });

  await tap.spawn(node, [
    "bin/peggy-test.js",
    "test/badInput.test.md",
  ]);

  await tap.spawn(node, [
    "bin/peggy-test.js",
    "-g",
    "test/badGenerate.peggy",
    "test/badGenerate.test.md",
  ]);

  await tap.spawn(node, [
    "bin/peggy-test.js",
    "-g",
    path.join(dir, "foo.peggy"),
    "DOES__NOT___EXIST/badGenerate.test.md",
  ], { expectFail: true });

  const normOriginal = normalize(originalFoo);
  const updateFile = path.join(dir, "foo.test.md");

  await tap.spawn(node, [
    "bin/peggy-test.js",
    "-u",
    updateFile,
  ]);

  const updatedFoo = normalize(await fs.readFile(updateFile, "utf8"));
  tap.equal(
    updatedFoo,
    normOriginal,
    "Update doesn't change anything but date"
  );

  await tap.spawn(node, [
    "bin/peggy-test.js",
    "--force",
    "-u",
    updateFile,
  ]);

  const forceUpdatedFoo = normalize(await fs.readFile(updateFile, "utf8"));
  tap.equal(
    forceUpdatedFoo,
    normOriginal,
    "Force update doesn't change anything but date"
  );

  tap.end();
}

metaTest().catch(er => {
  console.error(er);
  process.exit(1);
});
