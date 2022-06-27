---
title: Foo
source: foo.peggy
outDir: .
defaultRule: top
updated: 2022-06-26T20:31:42.549Z
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
```
Error: Expected default rule but "c" found.
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

