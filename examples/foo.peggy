top "default rule"
  = foo
  / bar
  / ticks

foo
  = _ @"a"
  / _ @"b"

bar
  = n:$[0-9]+ { return BigInt(n); }

ticks = "```"

_ = [ \t]*
