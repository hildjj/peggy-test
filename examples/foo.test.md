---
title: Foo
source: foo.peggy
outDir: .
defaultRule: Top
updated: 2022-07-04T20:18:38.179Z
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

Start at the top to get backtracking in the trace.

Input: (trace)
```
120
```

Output:
```js
120n
```

This is why there are paragraphs.  To **explain** things.  There might be lots
of lines that all go together.

Input to rule `Foo`:
```
b
```

Output:
```js
'b'
```

# Other rules

Input to rule `Bar`:
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
Error: Expected default rule but "c" found.
 --> examples/foo.test.md:67:1
   |
67 | cde
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
```
~~~

Output:
~~~js
'```'
~~~

#
# Empty section
#

This test is skipped, and has output:

Input: (skip)
```
a
```

Output:
```js
'a'
```

A non-grammar exception:

Input:
```
except
```

Output:
```
boop
```

