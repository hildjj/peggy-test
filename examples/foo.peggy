top "default rule"
  = foo
  / bar
  / ticks
  / except

foo
  = _ @"a"
  / _ @"b"

bar
  = n:$[0-9]+ { return BigInt(n); }

ticks = "```"

except = "except" { throw new Error("boop"); }

_ = [ \t]*
