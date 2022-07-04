---
source: ./bar.peggy
updated: 2022-06-30T22:16:34.921Z
---

# Tests marked "(only)" will run to the exclusion of other tests not so marked

Input:
```
bad input
```

Output:
```
not matched
```

Input: (only)
```
b
```

Output:
```js
'b'
```

# A section with no only

Input:
```
bad input
```

Output:
```
not matched
```

