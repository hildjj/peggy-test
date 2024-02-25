import * as fsb from "fs";
import * as path from "path";
import * as util from "util";
import { parse } from "./test_md.js";
import peggy from "../vendor/peggy.min.cjs";
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

async function endStream(stream, contents) {
  await util.promisify(stream.end.bind(stream))(contents);
  return stream;
}

function tempStream(dir, suffix, contents) {
  const s = temp.createWriteStream({
    dir,
    suffix,
  });
  return new Promise((resolve, reject) => {
    s.on("ready", () => resolve(s));
    s.on("error", reject);
  }).then(s => (contents ? endStream(s, contents) : s));
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

function runSection(section, sectionTest, parser, opts, updateStream) {
  if (updateStream) {
    updateStream.write(`${section.title[0]}${section.title[1]}\n`);
  }

  for (const graf of section.grafs) {
    if (updateStream) {
      if (typeof graf === "string") {
        updateStream.write(graf);
        continue;
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
    if (opts.only && !graf.input.tags.only) {
      // We're in only mode, and this test isn't one of the only.
      if (graf.output && updateStream) {
        updateStream.write("Output:\n");
        outputCodeBlock(updateStream, graf.output);
      }
      continue;
    }

    const grammarSource = new peggy.GrammarLocation(
      graf.input.codeLocation.source,
      graf.input.codeLocation.start
    );
    const src = graf.input.src;
    const ruleName = graf.input.rule || "default";

    // If we are forced and not updating, don't skip.
    // If we are force-updating, still don't run skipped tests.
    if (graf.input.tags.skip && (!opts.force || updateStream)) {
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
      } else if (opts.defaultRule) {
        parseOpts.startRule = opts.defaultRule;
      } // Else don't set it

      const parseResult = parser.parse(src, parseOpts);
      output.src = util.inspect(parseResult, {
        depth: Infinity,
        color: false,
        maxArrayLength: Infinity,
        maxStringLength: Infinity,
        compact: false,
        sorted: true,
        numericSeparator: false,
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
      updateStream.write("Output:\n");
      if (!opts.force && graf.output) {
        outputCodeBlock(updateStream, graf.output);
        sectionTest.equal(output.src, graf.output.src, ruleName, {
          at: `${graf.input.codeLocation.source}:${graf.input.codeLocation.start.line}:${graf.input.codeLocation.start.column}`,
        });
      } else {
        if (output.src.includes("```")) {
          output.marks = "~~~";
        }
        outputCodeBlock(updateStream, output);
        sectionTest.pass(`wrote: ${output}`);
      }
    } else if (graf.output) {
      sectionTest.equal(output.src, graf.output.src, ruleName, {
        at: `${graf.input.codeLocation.source}:${graf.input.codeLocation.start.line}:${graf.input.codeLocation.start.column}`,
      });
    } else {
      sectionTest.todo(ruleName);
      sectionTest.comment(output.src);
    }
  }
}

function runTests(suite, parser, opts, updateStream) {
  let secNum = 0;

  let sections = 0;
  let only = 0;

  for (const section of suite.sections) {
    section.numTests = 0;
    section.numOnly = 0;
    for (const graf of section.grafs) {
      if (typeof graf === "object") {
        if (section.numTests++ === 0) {
          sections++;
        }
        if (graf.input.tags.only) {
          if (section.numOnly++ === 0) {
            only++;
          }
        }
      }
    }
  }
  opts.only = only > 0;
  tap.plan(opts.only ? only : sections);

  if (suite.meta.updated) {
    tap.comment(`Updated: ${suite.meta.updated}`);
  }

  for (const section of suite.sections) {
    secNum++;

    if ((opts.only && (section.numOnly > 0))
        || (!opts.only && (section.numTests > 0))) {
      tap.test(
        (section.title[1] || `Section ${secNum}`).trim(),
        sectionTest => {
          sectionTest.plan((only > 0) ? section.numOnly : section.numTests);
          runSection(
            section,
            sectionTest,
            parser,
            opts,
            updateStream
          );
          sectionTest.end();
        }
      );
    } else if (updateStream) {
      runSection(
        section,
        null,
        parser,
        opts,
        updateStream
      );
    }
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
    const tmp = await tempStream(
      opts.outDir,
      ".mjs", // Force module loading, since we're using "es" above
      grammar
    );

    const instrumented = await import("file://" + path.resolve(process.cwd(), tmp.path));
    let updateStream = null;
    if (opts.update) {
      suite.meta = suite.meta || {};
      suite.meta.updated = new Date().toISOString();

      updateStream = await tempStream(testDir, path.extname(opts.testFile));
      updateStream.write("---\n");
      for (const [key, value] of Object.entries(suite.meta)) {
        updateStream.write(`${key}: ${value}\n`);
      }
      updateStream.write("---\n\n");

      for (const i of suite.intro) {
        updateStream.write(i);
      }
    }
    const error = runTests(suite, instrumented, opts, updateStream);
    if (updateStream) {
      await endStream(updateStream);
      if (error === 0) {
        await fs.rename(updateStream.path, opts.testFile);
      }
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
  try {
    await fs.stat(opts.testFile);
    if (!opts.force) {
      console.error(`File "${opts.testFile}" already exists.  Use --force to overwrite.`);
      return 1;
    }
  } catch (ignored) {
    // Ignored
  }

  const grammarSource = opts.generate;
  const src = await fs.readFile(grammarSource, "utf8");
  try {
    const ast = peggy.parser.parse(src, {
      grammarSource,
    });

    const updateStream = await tempStream(
      path.dirname(opts.testFile),
      path.extname(opts.testFile)
    );

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

    await endStream(updateStream);
    await fs.rename(updateStream.path, opts.testFile);

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
