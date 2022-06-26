# Unit test peggy grammars

You've written a complex [Peggy](https://peggyjs.org) grammar, and would like
to test individual rules in it to make sure that they work correctly.  You'd
probably like to be able to see the code coverage of those tests as well.

## Installation

Note: this won't work until the package is published for the first time:

```bash
npm install peggy-test
```

Further note: I'm working on this in a personal repo, but if it's interesting
to the Peggy community, I'll move it to the Peggy organization on GitHub.
We'll make that call before we publish the first time, so we don't have to
change owners.

## Basic Approach

A test file is a **very** constrained subset of Markdown that contains sample
inputs and expected matching outputs for your grammar.  You can specify the
start rule for any given input.  For example, imagine this grammar, saved in a
file named `foo.peggy`:

```peg.js
top = foo / bar
foo = "a" / "b"
bar = n:$[0-9]+ { return BigInt(n); }
```

You might write a `foo.test.md` file that looks like:

````markdown
---
source: foo.peggy
---

# Positive tests

This tests the default rule, which is the first rule (`top`) if not specified
in the metadata above.

Input:
```
a
```

Output:
```js
'a'
```

This test has tracing turned on.

Input to rule `bar`: (trace)
```
120
```

Output:
```js
120n
```
````

When you run this with `peggy-test foo.test.md`, you will see
[TAP](https://testanything.org/) output.
[c8](https://github.com/bcoe/c8#readme) can be used to generate coverage
metrics of the grammar with `c8 peggy-test foo.test.md`, which takes advantage
of the source-code mapping that Peggy produces.

## Creating empty tests

Test stubs can be created from your grammar:

```bash
peggy-test -g <grammar file> <test file>
```

This currently overwrites everything in the test file, if it exists, with one
blank and skipped test for each rule in your grammar.

## Updating test output

It is tedious to calculate the expected output for each test input.  Instead,
you can update all of the output blocks in a test file with the current output
of the grammar:

```bash
peggy-test -u <test file>
```

## Command Line

```
Usage: peggy-test [options] <testFile>

Arguments:
  testFile                        The file to test

Options:
  -u, --update                    Update the test file with the current test
                                  outputs
  -g, --generate <sourceGrammar>  Generate a new test file from a grammar
  -h, --help                      display help for command
```

## Test file format

Most markdown is not yet supported.  More may be added over time.

### Meta-data

The test file MUST start with a
[YAML Metadata](https://github.blog/2013-09-27-viewing-yaml-metadata-in-your-documents/)
block, which may contain any fields you like.  However, these fields have
special meaning:

| Field |  Meaning | Default |
| ----- | -------- | ------- |
| source | Grammar file name, relative to the test file location. | [required] |
| outDir | The directory where a compiled version of the grammar will be temporarily stored. |  The directory where the grammar is found. |
| defaultRule | If a rule name is not specified in a test, this rule is used. | The first rule in the grammar. |
| updated | ISO8601 date string of the last time the test file was updated mechanically. | [None] |

Example:

```markdown
---
source: ../src/test_md.peggy
outDir: ../lib
defaultRule: start
updated: 2022-06-21T16:59:46.221Z
---
```

### Sections

Following the metadata, there may be one or more sections.  Each section
consists of a description (a line starting with `#`), followed by one or more
tests.  Each test may specify a start rule, zero or more tags, an input, and
may have an expected output.  You may have paragraphs of markdown text before
or after tests to describe them.

### Tests

Tests MAY include a rule name, which will be used as the start rule for
processing the input.  These tests start with ``Input to rule `<rule name>`:``
like this:

````markdown
Input to rule `field`:
```
Something-Here: There

```

Output:
```js
[
  'Something-Here',
  'There'
]
```
````

Tests may also use the default rule:

````markdown
Input:
```
This input text uses the default rule
```
````

A test MUST be followed by an input code block, and MAY be followed by an
output code block.

### Output

Output sections are not required.  A non-skipped test without an output
section will be marked as "TODO" in the TAP output.  When present, the output
code block is preceded with a line containing "Output:".

````markdown
Output:
```js
{
  skip: true,
  trace: true
}
```
````

### Code blocks

Code blocks are used for input and output.  They MUST be surrounded by three
backticks (`` ``` ``) or three tildes `~~~`, which have to match.  If there
are no lines between the markers, the block will be interpreted as `null`.
The newline at the end of the last line will be discarded, so if you want to test
something that contains a newline, you must leave an extra blank line.  For
example, corresponds to the empty string (`""`) :

```markdown
~~~

~~~
```

And this will use a single "\n" as input:

```markdown
~~~


~~~
```

And this will use `null` as the the input:

```markdown
~~~
~~~
```

The initial set of backticks or tildes can be followed by a lanugage
identifier.  If you are processing a language that your markdown system knows
about, you might want to specify that language on an input code block, but
this is unlikely to be satisfying for the small snippets of subrules that you
will be testing. Specifying `js` as the language of the output block is most
usual for non-errors, since it will be formatting the output of
[util.inspect](https://nodejs.org/dist/latest-v18.x/docs/api/util.html#utilinspectobject-options).

### Tags

Tags modify the processing of a test.  They are words in parentheses after the
colon on the input line.  Tags may not be duplicated on a given test.  They
only apply to a single test at a time.  For example:

```markdown
Input: (skip)
```

Here are the currently supported tags:

| Name | Meaning |
|----- | ------- |
| (skip) | Skip this test. |
| (trace) | Turn on tracing for this test.  It is sometimes useful to trace-debug a single test at a time. |

[![Tests](https://github.com/hildjj/peggy-test/actions/workflows/node.js.yml/badge.svg)](https://github.com/hildjj/peggy-test/actions/workflows/node.js.yml)
