---
title: Foo
source: foo.peggy
outDir: .
defaultRule: foo
updated: 2022-06-20T22:24:36.188Z
---

# Positive

Input:
```
a
```

Output:
```js
'a'
```

Input to rule `foo`:
```
b
```

Output:
```js
'b'
```

# Other rules

Input to rule `bar`:
```
120
```

Output:
```js
120n
```

# Errors

Input:
```
cde
```

Output:
```js
Error: Expected "a" or "b" but "c" found.
 --> Errors__Test_1:1:1
  |
1 | cde
  | ^
```

# Skipping

Input: (skipped)
```
bad
```

Input: (skip)
```
Not working yet
```
