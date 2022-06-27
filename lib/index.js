import * as fsb from "fs";
import * as os from "os";
import * as path from "path";
import * as util from "util";
import { parse } from "./test_md.js";
import peggy from "peggy";
import tap from "libtap";
import temp from "temp";

const fs = fsb.promises;
temp.track();

/**
 * Take trace events from Peggy and log them as test comments.
 */
class CommentTracer {
  constructor(test) {
    this.test = test;
    this.indent = 0;
  }

  log(event) {
    this.test.comment(
      `${event.location.start.line}:${event.location.start.column} ${event.type.padEnd(10)} ${"".padEnd(this.indent)}${event.rule}`
    );
  }

  trace(event) {
    switch (event.type) {
      case "rule.enter":
        this.log(event); // Note: *before* indent */
        this.indent++;
        break;

      case "rule.match":
        this.indent--;
        this.log(event);
        break;

      case "rule.fail":
        this.indent--;
        this.log(event);
        break;

      /* c8 ignore next 2 */
      default:
        throw new Error(`Invalid event type: "${event.type}".`);
    }
  }
}

// Only exported for testing
export function outputCodeBlock(updateStream, block) {
  const lim = (block && block.marks) || "```";
  if (block && block.src && block.src.includes(lim)) {
    throw new Error(`Invalid nesting.  "${block.src}" includes "${lim}"`);
  }
  updateStream.write(lim);
  if (block && typeof block.lang === "string") {
    updateStream.write(block.lang);
  }
  updateStream.write("\n");
  if (block && (typeof block.src === "string")) {
    updateStream.write(block.src);
    updateStream.write("\n");
  }
  updateStream.write(lim);
  updateStream.write("\n\n");
}

function runTests(suite, parser, defaultRule, updateStream) {
  let secNum = 0;
  let testNum = 0;
  tap.plan(suite.sections.length);

  if (suite.meta.updated) {
    tap.comment(`Updated: ${suite.meta.updated}`);
  }

  for (const section of suite.sections) {
    secNum++;
    const sectionTitle = (section.title[1] || `Section ${secNum}`).trim();

    // eslint-disable-next-line no-loop-func
    tap.test(sectionTitle, sectionTest => {
      sectionTest.plan(section.grafs.filter(t => typeof t === "object").length);

      if (updateStream) {
        updateStream.write(`${section.title[0]}${section.title[1]}\n`);
      }

      testNum = 0;
      for (const graf of section.grafs) {
        if (updateStream) {
          if (typeof graf === "string") {
            updateStream.write(graf);
          } else {
            const tags = Object
              .keys(graf.input.tags)
              .reduce((t, v) => t + ` (${v})`, "");
            if (graf.input.rule) {
              updateStream.write(`Input to rule \`${graf.input.rule}\`:${tags}\n`);
            } else {
              updateStream.write(`Input:${tags}\n`);
            }
            outputCodeBlock(updateStream, graf.input);
          }
        }
        if (typeof graf === "string") {
          continue;
        }

        testNum++;
        const grammarSource = `${sectionTitle}__Test_${testNum}`;
        const src = graf.input.src;
        const ruleName = graf.input.rule || "default";

        if (graf.input.tags.skip) {
          sectionTest.skip(ruleName);
          if (updateStream && graf.output) {
            updateStream.write("Output:\n");
            outputCodeBlock(updateStream, graf.output);
          }
          continue;
        }
        const output = {};
        try {
          const parseOpts = {
            grammarSource,
            tracer: graf.input.tags.trace
              ? new CommentTracer(sectionTest)
              : { trace: () => 0 },
          };
          if (graf.input.rule) {
            parseOpts.startRule = graf.input.rule;
          } else if (defaultRule) {
            parseOpts.startRule = defaultRule;
          } // Else don't set it

          const parseResult = parser.parse(src, parseOpts);
          output.src = util.inspect(parseResult, {
            depth: Infinity,
            color: false,
            maxArrayLength: Infinity,
            maxStringLength: Infinity,
            compact: false,
            sorted: true,
            numericSeparator: true,
          });
          output.lang = "js";
        } catch (e) {
          if (typeof e.format === "function") {
            output.src = e.format([{ source: grammarSource, text: src }]);
          } else {
            output.src = e.message;
          }
        }
        if (updateStream) {
          sectionTest.pass(`wrote: ${output.src}`);
          updateStream.write("Output:\n");
          if (output.src.includes("```")) {
            output.marks = "~~~";
          }
          outputCodeBlock(updateStream, output);
        } else if (graf.output) {
          const localSrc = output.src.split(/\r?\n/g).join(os.EOL);
          sectionTest.equal(localSrc, graf.output.src, ruleName, {
            at: `${graf.loc.source}:${graf.loc.start.line}:${graf.loc.start.column}`,
          });
        } else {
          sectionTest.todo(ruleName);
        }
      }
      sectionTest.end();
    });
  }

  tap.end();
  return tap.passing() ? 0 : 1;
}

export async function testFile(opts) {
  if (opts.quiet) {
    process.stdout.write = () => 0;
  }

  let grammarSource = opts.testFile;
  let src = await fs.readFile(grammarSource, "utf8");

  try {
    const testDir = path.dirname(grammarSource);
    const suite = parse(src, {
      grammarSource,
    });
    if (suite.meta) {
      opts = { ...suite.meta, ...opts };
      if (suite.meta.outDir) {
        opts.outDir = path.resolve(testDir, suite.meta.outDir);
      }
    }
    if (!opts.source) {
      throw new Error("source not specified");
    }

    const grammarFile = path.join(testDir, opts.source);
    if (!opts.outDir) {
      opts.outDir = path.dirname(grammarFile);
    }
    grammarSource = path.relative(opts.outDir, grammarFile);
    src = await fs.readFile(grammarFile, "utf8");
    const grammar = peggy.generate(src, {
      allowedStartRules: ["*"],
      format: "es",
      output: "source-with-inline-map",
      trace: true,
      grammarSource,
    });

    // Wite temp file with JS output, then import it.
    const tmp = await temp.createWriteStream({
      dir: opts.outDir,
      suffix: ".mjs", // Force module loading, since we're using "es" above
    });
    const end = util.promisify(tmp.end.bind(tmp));
    await end(grammar);

    const instrumented = await import("file://" + path.resolve(process.cwd(), tmp.path));
    let updateStream = null;
    if (opts.update) {
      suite.meta = suite.meta || {};
      suite.meta.updated = new Date().toISOString();

      updateStream = await temp.createWriteStream({
        dir: testDir,
        suffix: path.extname(opts.testFile),
      });
      updateStream.write("---\n");
      for (const [key, value] of Object.entries(suite.meta)) {
        updateStream.write(`${key}: ${value}\n`);
      }
      updateStream.write("---\n\n");

      for (const i of suite.intro) {
        updateStream.write(i);
      }
    }
    const error = runTests(suite, instrumented, opts.defaultRule, updateStream);
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

export async function generateFile(opts) {
  const grammarSource = opts.generate;
  const src = await fs.readFile(grammarSource, "utf8");
  try {
    const ast = peggy.parser.parse(src, {
      grammarSource,
    });
    // When Node 12 is dropped, rewrite this to use fs.promises
    const updateStream = await new Promise((resolve, reject) => {
      const s = fsb.createWriteStream(opts.testFile, "utf8");
      s.on("ready", () => resolve(s));
      s.on("error", reject);
    });

    const defaultRule = ast.rules[0].name;
    updateStream.write(`\
---
source: ${path.relative(path.dirname(opts.testFile), grammarSource)}
defaultRule: ${defaultRule}
updated: ${new Date().toISOString()}
---

# Tests for full grammar for ${grammarSource}

Use this section to test full inputs to the grammar.

Input: (skip)
\`\`\`

\`\`\`

## Tests for each rule
`);
    for (const rule of ast.rules) {
      if (rule.name === defaultRule) {
        continue;
      }
      updateStream.write(`
Input to rule \`${rule.name}\`: (skip)
\`\`\`

\`\`\`
`);
    }

    const uend = util.promisify(updateStream.end.bind(updateStream));
    await uend();

    return 0;
  } catch (e) {
    if (typeof e.format === "function") {
      console.log(e.format([{ source: grammarSource, text: src }]));
      return 2;
    } else {
      throw e;
    }
  }
}
