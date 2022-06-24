---
source: ../src/test_md.peggy
outDir: ../lib
defaultRule: tests
updated: 2022-06-21T23:13:03.760Z
---

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
```js
Error: Duplicate tag: (skip)
 --> Tests for each rule__Test_12:1:1
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

Input to rule `jsSource`: (skip)
```

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
