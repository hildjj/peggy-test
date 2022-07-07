---
source: ../src/test_md.peggy
outDir: ../lib
defaultRule: tests
updated: 2022-07-07T17:07:44.199Z
---

# Tests for the default rule

Input:
~~~
---
title: simple
---
# A simple test

Input:
```
foo
```

Output:
```
'foo'
```

~~~

Output:
~~~js
{
  intro: [],
  meta: {
    title: 'simple'
  },
  sections: [
    {
      grafs: [
        '\n',
        {
          input: {
            codeLocation: {
              end: {
                column: 4,
                line: 8,
                offset: 53
              },
              source: GrammarLocation {
                source: 'test/test_md.test.md',
                start: {
                  column: 1,
                  line: 12,
                  offset: 147
                }
              },
              start: {
                column: 1,
                line: 8,
                offset: 50
              }
            },
            lang: null,
            marks: '```',
            rule: null,
            src: 'foo',
            tags: {}
          },
          output: {
            codeLocation: {
              end: {
                column: 6,
                line: 13,
                offset: 76
              },
              source: GrammarLocation {
                source: 'test/test_md.test.md',
                start: {
                  column: 1,
                  line: 12,
                  offset: 147
                }
              },
              start: {
                column: 1,
                line: 13,
                offset: 71
              }
            },
            lang: null,
            marks: '```',
            src: "'foo'"
          }
        }
      ],
      title: [
        '#',
        ' A simple test'
      ]
    }
  ]
}
~~~

# Tests for each rule

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

Input to rule `tags`:
```
(trace) (skip)
```

Output:
```js
{
  skip: true,
  trace: true
}
```

Input to rule `tags`:
```
(skip)
```

Output:
```js
{
  skip: true
}
```

Input to rule `tags`:
```
(trace)
```

Output:
```js
{
  trace: true
}
```

Input to rule `tags`:
```
(skip) (trace) (skip)
```

Output:
```
Error: Duplicate tag: (skip)
 --> test/test_md.test.md:159:1
    |
159 | (skip) (trace) (skip)
    | ^^^^^^^^^^^^^^^^^^^^^
```

Input to rule `code`:
```
~~~
~~~
```

Output:
```js
{
  codeLocation: {
    end: {
      column: 4,
      line: 2,
      offset: 7
    },
    source: GrammarLocation {
      source: 'test/test_md.test.md',
      start: {
        column: 1,
        line: 173,
        offset: 2337
      }
    },
    start: {
      column: 1,
      line: 1,
      offset: 0
    }
  },
  lang: null,
  marks: '~~~',
  src: null
}
```

Input to rule `code`:
~~~
```
```
~~~

Output:
~~~js
{
  codeLocation: {
    end: {
      column: 4,
      line: 2,
      offset: 7
    },
    source: GrammarLocation {
      source: 'test/test_md.test.md',
      start: {
        column: 1,
        line: 208,
        offset: 2754
      }
    },
    start: {
      column: 1,
      line: 1,
      offset: 0
    }
  },
  lang: null,
  marks: '```',
  src: null
}
~~~

Input to rule `code`:
```
~~~js
'a'
~~~
```

Output:
```js
{
  codeLocation: {
    end: {
      column: 4,
      line: 2,
      offset: 9
    },
    source: GrammarLocation {
      source: 'test/test_md.test.md',
      start: {
        column: 1,
        line: 243,
        offset: 3171
      }
    },
    start: {
      column: 1,
      line: 2,
      offset: 6
    }
  },
  lang: 'js',
  marks: '~~~',
  src: "'a'"
}
```

Input to rule `UnicodeEscapeSequence`:
```
u263A
```

Output:
```js
'☺'
```

Input to rule `Nd`:
```
٣
```

Output:
```js
'٣'
```

Input to rule `Nl`:
```
ᛮ
```

Output:
```js
'ᛮ'
```

Input to rule `Pc`:
```
_
```

Output:
```js
'_'
```

