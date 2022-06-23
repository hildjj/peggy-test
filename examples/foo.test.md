---
title: Foo
source: foo.peggy
outDir: .
defaultRule: foo
updated: 2022-06-22T22:29:32.239Z
---

Some intro expository text might go here.

There might be many paragraphs, including longer
things that wrap.

# Positive

Input:
```
a
```

Output:
```js
'a'
```

This is why there are paragraphs.  To **explain** things.  There might be lots
of lines that all go together.

Input to rule `foo`:
```
b
```

Output:
```js
'b'
```

# Other rules

Input to rule `bar`: (trace)
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
```
Error: Expected "a" or "b" but "c" found.
 --> Errors__Test_1:1:1
  |
1 | cde
  | ^
```

# Skipping

Input: (skip)
```
bad
```

Input: (skip)
```
Not working yet
```

# Code Blocks

Input:
~~~
~~~
