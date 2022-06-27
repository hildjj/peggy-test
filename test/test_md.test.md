---
source: ../src/test_md.peggy
outDir: ../lib
defaultRule: tests
updated: 2022-06-27T21:18:08.266Z
---

# Tests for the default rul

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
            lang: null,
            marks: '```',
            rule: null,
            src: 'foo',
            tags: {}
          },
          loc: {
            end: {
              column: 1,
              line: 15,
              offset: 81
            },
            source: 'Tests for the default rul__Test_1',
            start: {
              column: 1,
              line: 6,
              offset: 39
            }
          },
          output: {
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

Input to rule `tests`: (skip)
```

```

Input to rule `meta`: (skip)
```
```

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

Input to rule `section`: (skip)
```

```

Input to rule `title`: (skip)
```

```

Input to rule `test`: (skip)
```

```

Input to rule `input`: (skip)
```

```

Input to rule `rule`: (skip)
```

```

Input to rule `source`: (skip)
```

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
 --> Tests for each rule__Test_13:1:1
  |
1 | (skip) (trace) (skip)
  | ^^^^^^^^^^^^^^^^^^^^^
```

Input to rule `tag`: (skip)
```

```

Input to rule `skip`: (skip)
```

```

Input to rule `trace`: (skip)
```

```

Input to rule `output`: (skip)
```

```

Input to rule `code`:
```
~~~
~~~
```

Output:
```js
{
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
  lang: 'js',
  marks: '~~~',
  src: "'a'"
}
```

Input to rule `notSourceEnd`: (skip)
```

```

Input to rule `IdentifierName`: (skip)
```

```

Input to rule `IdentifierStart`: (skip)
```

```

Input to rule `IdentifierPart`: (skip)
```

```

Input to rule `UnicodeEscapeSequence`:
```
u263A
```

Output:
```js
'☺'
```

Input to rule `start`: (skip)
```

```

Input to rule `text`: (skip)
```

```

Input to rule `nl`: (skip)
```

```

Input to rule `_`: (skip)
```

```

Input to rule `__`: (skip)
```

```

Input to rule `HexDigit`: (skip)
```

```

Input to rule `UnicodeLetter`: (skip)
```

```

Input to rule `UnicodeCombiningMark`: (skip)
```

```

Input to rule `UnicodeDigit`: (skip)
```

```

Input to rule `UnicodeConnectorPunctuation`: (skip)
```

```

Input to rule `Ll`: (skip)
```

```

Input to rule `Lm`: (skip)
```

```

Input to rule `Lo`: (skip)
```

```

Input to rule `Lt`: (skip)
```

```

Input to rule `Lu`: (skip)
```

```

Input to rule `Mc`: (skip)
```

```

Input to rule `Mn`: (skip)
```

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

