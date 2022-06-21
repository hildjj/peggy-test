foo
  = "a"
  / "b"

bar
  = n:$[0-9]+ { return BigInt(n); }
