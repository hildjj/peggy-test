import * as fs from "fs/promises";
import * as path from "path";
import * as util from "util";
import peggy from "peggy";
import { parse } from "./test_md.js";
import temp from "temp";

temp.track();

function runTests(suite, parser, defaultRule, updateStream) {
  let secNum = 0;
  let testNum = 0;
  let error = 0;

  for (const section of suite.sections) {
    secNum++;
    console.log(section.title || `Section ${secNum}`);
    if (updateStream) {
      updateStream.write(`\n# ${section.title || `Section ${secNum}`}\n`);
    }

    testNum = 0;
    for (const test of section.tests) {
      testNum++;
      const grammarSource =
        (section.title || `section ${secNum}`) + `__Test_${testNum}`;
      const src = test.input.src;

      if (updateStream) {
        if (test.input.rule) {
          updateStream.write(`\nInput to rule \`${test.input.rule}\`:\n`);
        } else {
          updateStream.write(`\nInput:\n`);
        }
        updateStream.write("```\n");
        updateStream.write(src);
        updateStream.write("\n```\n");
      }
      let res = null;
      let str = null;
      try {
        res = parser.parse(src, {
          grammarSource,
          startRule: test.input.rule || defaultRule
        });
        str = util.inspect(res, {
          depth: Infinity,
          color: false,
          maxArrayLength: Infinity,
          maxStringLength: Infinity,
          compact: false,
          sorted: true,
          numericSeparator: true,
        });
      } catch (e) {
        if (typeof e.format === "function") {
          str = e.format([{ source: grammarSource, text: src }]);
        } else {
          str = e.message;
        }
      }
      if (updateStream) {
        updateStream.write("\nOutput:\n");
        updateStream.write("```js\n");
        updateStream.write(str);
        updateStream.write("\n```\n");
        console.log(`  ${testNum}: \u{270F}`);
      } else if (test.output) {
        if (str === test.output) {
          console.log(`  ${testNum}: \u{2714}`);
        } else {
          error = 1;
          console.log(`  ${testNum}: \u{2715} Actual: ${str}, Expected: ${test.output}`);
        }
      } else {
        console.log(`  ${testNum}: ${str}`);
      }
    }
  }

  return error;
}

export async function testFile(opts) {
  let grammarSource = opts.testFile;
  let src = await fs.readFile(grammarSource, "utf8");

  try {
    const testDir = path.dirname(grammarSource);
    const res = parse(src, {
      grammarSource
    });
    if (res.meta) {
      opts = {...res.meta, ...opts};
      if (res.meta.outDir) {
        opts.outDir = path.relative(testDir, res.meta.outDir);
      }
    }
    if (!opts.source) {
      throw new Error(`source not specified`);
    }
    if (!opts.outDir) {
      opts.outDir = testDir;
    }
    const grammarFile = path.join(testDir, opts.source);
    grammarSource = path.relative(opts.outDir, grammarSource)
    src = await fs.readFile(grammarFile, "utf8");
    const grammar = peggy.generate(src, {
      allowedStartRules: ['*'],
      format: "es",
      output: "source-with-inline-map",
      grammarSource,
    });

    // Wite temp file with JS output, then import it.
    const tmp = await temp.createWriteStream({
      dir: opts.outDir,
      suffix: ".mjs", // Force module loading, since we're using "es" above
    })
    const end = util.promisify(tmp.end.bind(tmp));
    await end(grammar);

    const instrumented = await import(path.resolve(process.cwd(), tmp.path));
    let updateStream = null
    if (opts.update) {
      res.meta = res.meta || {};
      res.meta.updated = new Date().toISOString();

      updateStream = await temp.createWriteStream({
        dir: testDir,
        suffix: path.extname(opts.testFile),
      });
      updateStream.write("---\n");
      for (const [key, value] of Object.entries(res.meta)) {
        updateStream.write(`${key}: ${value}\n`);
      }
      updateStream.write("---\n");
    }
    const error = runTests(res, instrumented, opts.defaultRule, updateStream);
    if (updateStream) {
      const uend = util.promisify(updateStream.end.bind(updateStream));
      await uend();
      await fs.rename(updateStream.path, opts.testFile);
    }
    return error;
  } catch (e) {
    if (typeof e.format === "function") {
      console.log(e.format([{ source: grammarSource, text: src }]));
      return 2;
    } else {
      throw e;
    }
  }
}
