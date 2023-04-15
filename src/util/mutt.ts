// MUTT - Micro Unit Testing Tool (for browsers)

let _testDepth = 0

interface Context {
  count: number
  failed: number
}

export function test(name: string, suite: (assertions: Assertions) => void) {
  // if (import.meta.env.MODE === 'test') return
  // if (process.env.NODE_ENV === "test") return

  const title = `🐶 ${name}`
  const ctx = {
    count: 0,
    failed: 0
  }

  _testDepth++

  if (_testDepth > 1) console.group(title)
  else console.groupCollapsed(title)

  try {
    suite(createAssertions(ctx))
  } catch (err) {
    console.error("Error running tests:", err)
  }

  if (ctx.count > 0) {
    if (ctx.failed === 0) console.log(`✅ ${ctx.count} of ${ctx.count} succeeded.`)
    else console.log(`💥 ${ctx.failed} of ${ctx.count} failed.`)
  }

  //@ts-ignore
  console.groupEnd(title)

  if (ctx.failed > 0) console.log(`🚨 ${name}: ${ctx.failed} Failure(s)`)

  _testDepth--
}

export function isDeeplyEqual(a: any, b: any) {
  if (typeof a !== typeof b) {
    return false
  }
  if (a instanceof Function) {
    return a.toString() === b.toString()
  }
  if (a === b || a.valueOf() === b.valueOf()) {
    return true
  }
  if (!(a instanceof Object)) {
    return false
  }
  var ka = Object.keys(a)
  if (ka.length !== Object.keys(b).length) {
    return false
  }
  for (var i in b) {
    if (!b.hasOwnProperty(i)) {
      continue
    }
    if (ka.indexOf(i) === -1) {
      return false
    }
    if (!isDeeplyEqual(a[i], b[i])) {
      return false
    }
  }
  return true
}

export function spy<T extends Function = (...params: any[]) => any>(fn?: T): T & { called: any[], thrown: (Error | undefined)[] } {
  const wrapped: any = function () {
    var result
    if (fn) {
      try {
        result = fn.apply((fn as any).this, arguments)
        wrapped.thrown.push(undefined)
      } catch (e) {
        wrapped.thrown.push(e)
      }
    }
    wrapped.called.push(arguments)
    return result
  }
  wrapped.called = []
  wrapped.thrown = []
  return wrapped
}

function assertException(ctx: Context, block: () => void, message?: string, expectsThrow = true) {
  let threw = false
  try {
    block()
  } catch (err) {
    threw = true
  }
  assert(ctx, threw === expectsThrow, message)
}

function assert(ctx: Context, assertion: any, message?: string) {
  ctx.count++
  console.assert(assertion, message)
  if (!assertion) ctx.failed++
  else console.info(message)
}

export default test

function createAssertions(ctx: Context) {
  return {
    spy,
    equalDeep(actual: any, expected: any, message?: string) {
      assert(ctx, isDeeplyEqual(actual, expected), message)
    },
    notEqualDeep(actual: any, expected: any, message?: string) {
      assert(ctx, !isDeeplyEqual(actual, expected), message)
    },
    equal(actual: any, expected: any, message?: string) {
      // eslint-disable-next-line eqeqeq
      assert(ctx, actual == expected, message)
    },
    notEqual(actual: any, expected: any, message?: string) {
      // eslint-disable-next-line eqeqeq
      assert(ctx, actual != expected, message)
    },
    fail(message: string) {
      assert(ctx, false, message)
    },
    ok(actual: any, message?: string) {
      assert(ctx, actual, message)
    },
    notOk(actual: any, message?: string) {
      assert(ctx, !actual, message)
    },
    is(actual: any, expected: any, message?: string) {
      assert(ctx, actual === expected, message + `  (${expected} == ${actual})`)
    },
    isNot(actual: any, expected: any, message?: string) {
      assert(ctx, actual !== expected, message + `  (${expected} != ${actual})`)
    },
    throws(block: () => void, message?: string) {
      assertException(ctx, block, message, true)
    },
    doesNotThrow(block: () => void, message?: string) {
      assertException(ctx, block, message, false)
    }
  }
}

type Assertions = ReturnType<typeof createAssertions>

// Quick self-test
test("Woof!", (t) => {
  test("Setup", () => {
    const methods = Object.keys(t).sort().join(",")
    t.equal(
      methods,
      "doesNotThrow,equal,equalDeep,fail,is,isNot,notEqual,notEqualDeep,notOk,ok,spy,throws",
      "Provides all assertion methods."
    )
  })

  test("Assertions", () => {
    t.ok(true, "ok(true)")
    t.notOk(false, "notOk(false)")
    t.equal(1, 1, "equal(1,1)")
    t.equal(1, "1", "equal(1,'1')")
    t.notEqual(1, 2, "notEqual(1,2)")
    t.equalDeep([1], [1], "equal(1,1)")
    t.notEqualDeep([1], [2], "notEqual(1,2)")
    t.notEqualDeep([1], ["1"], "notEqual(1,2)")
    t.is(1, 1, "is(1,1)")
    t.isNot(1, 2, "isNot(1,2)")
    t.isNot(1, "1", "isNot(1,'1')")
    t.doesNotThrow(() => { }, "doesNotThrow(() => {})")
    t.throws(() => {
      throw new Error("There was an error.")
    }, "throws(() => {})")
    // t.fail("Force a failure.");
  })
})