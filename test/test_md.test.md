---
source: ../src/test_md.peggy
outDir: ../lib
defaultRule: tests
updated: 2022-06-27T21:18:08.266Z
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
            source: 'test_md.test.md:10, offset from test start',
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
 --> test_md.test.md:130, offset from test start:1:1
  |
1 | (skip) (trace) (skip)
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
