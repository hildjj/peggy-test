import * as fsb from "fs";
import peggy from "../vendor/peggy.min.cjs";
import path from "path";
import url from "url";

const fs = fsb.promises;

/*
We vendored peggy.js to prevent a circular dependency.  In the process, we
lost the command line.  This is just hard-coded to what we need to compile our
own markdown grammar.
*/

async function compile() {
  const __filename = url.fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const grammarSource = path.resolve(__dirname, "..", "src", "test_md.peggy");
  const grammarDest = path.resolve(__dirname, "..", "lib", "test_md.js");
  const src = await fs.readFile(grammarSource, "utf8");
  try {
    const js = peggy.generate(src, {
      format: "es",
      output: "source",
      grammarSource,
    });
    await fs.writeFile(grammarDest, js, "utf8");
  } catch (er) {
    if (typeof er.format === "function") {
      console.log(er.format([{ source: grammarSource, text: src }]));
      process.exit(1);
    } else {
      throw er;
    }
  }
}

compile().catch(er => {
  console.error(er);
  process.exit(1);
});
