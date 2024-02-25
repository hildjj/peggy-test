Top "default rule"
  = Foo
  / Bar
  / Ticks
  / Except

Foo
  = _ @"a"
  / _ @"b"

Bar
  = n:$[0-9]+ { return BigInt(n); }

Ticks
  = "```"

Except
  = "except" { throw new Error("boop"); }

_
  = [ \t]*
