import * as fsb from "fs";
import path from "path";
import tap from "libtap";
import url from "url";

const fs = fsb.promises;

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function metaTest() {
  let originalFoo = await fs.readFile(
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
  await tap.spawn(process.argv0, [
    "bin/peggy-test.js",
    "-g",
    path.join(dir, "foo.peggy"),
    testFile,
  ]);

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

  const updateFile = path.join(dir, "foo.test.md");
  await tap.spawn(process.argv0, [
    "bin/peggy-test.js",
    "-u",
    updateFile,
  ]);

  let updatedFoo = await fs.readFile(
    updateFile,
    "utf8"
  );

  const eolRe = /\r?\n/g;
  const updatedRe = /^updated: [^\r\n]+\n/m;
  originalFoo = originalFoo.replace(eolRe, "\n");
  updatedFoo = updatedFoo.replace(eolRe, "\n");

  tap.equal(
    updatedFoo.replace(updatedRe, ""),
    originalFoo.replace(updatedRe, ""),
    "Update doesn't change anything but date"
  );

  tap.end();
}

metaTest().catch(er => {
  console.error(er);
  process.exit(1);
});
