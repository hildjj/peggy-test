top
  = foo
  / bar

foo
  = _ @"a"
  / _ @"b"

bar
  = n:$[0-9]+ { return BigInt(n); }

_ = [ \t]*
