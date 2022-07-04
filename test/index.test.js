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

// Run update, re-read the file, and make sure nothing has changed
// but the updated date.
async function checkUpdate(dir, name, originalText, ...args) {
  const normOriginal = normalize(originalText);

  await tap.spawn(node, [
    "../../bin/peggy-test.js",
    "-u",
    ...args,
    name,
  ], { cwd: dir });

  const normUpdated = normalize(await fs.readFile(path.join(dir, name), "utf8"));
  tap.equal(
    normUpdated,
    normOriginal,
    `${name}: Update doesn't change anything but date`
  );
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
  const originalOnly = await fs.readFile(
    path.resolve(__dirname, "..", "test", "only.test.md"),
    "utf8"
  );
  const dir = tap.testdir({
    examples: {
      "foo.peggy": tap.fixture(
        "symlink",
        path.join("..", "..", "..", "examples", "foo.peggy")
      ),
      "foo.test.md": originalFoo,
    },
    test: {
      "bar.peggy": tap.fixture(
        "symlink",
        path.join("..", "..", "bar.peggy")
      ),
      "only.test.md": originalOnly,
    },
  });

  const testFile = path.join("examples", "foo-g.test.md");
  await tap.spawn(node, [
    "../../bin/peggy-test.js",
    "-g",
    path.join("examples", "foo.peggy"),
    testFile,
  ], { cwd: dir });

  const testTxt = await fs.readFile(path.join(dir, testFile), "utf8");
  tap.match(testTxt, /^---/, "wrote test file");

  // Can't overwite without force
  await tap.spawn(node, [
    "../../bin/peggy-test.js",
    "-q",
    "-g",
    path.join("examples", "foo.peggy"),
    testFile,
  ], { cwd: dir, expectFail: true });

  await tap.spawn(node, [
    "../../bin/peggy-test.js",
    "--force",
    "-g",
    path.join("examples", "foo.peggy"),
    testFile,
  ], { cwd: dir });

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
    "test/only.test.md",
  ]);

  await tap.spawn(node, [
    "../../bin/peggy-test.js",
    "-g",
    path.join("examples", "foo.peggy"),
    "DOES__NOT___EXIST/badGenerate.test.md",
  ], { cwd: dir, expectFail: true });

  await checkUpdate(dir, "test/only.test.md", originalOnly);
  await checkUpdate(dir, "examples/foo.test.md", originalFoo);
  await checkUpdate(dir, "examples/foo.test.md", originalFoo, "--force");

  tap.end();
}

metaTest().catch(er => {
  console.error(er);
  process.exit(1);
});
