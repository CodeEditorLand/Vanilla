var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
import assert from "assert";
import * as sinon from "sinon";
import { memoize, throttle } from "../../common/decorators.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "./utils.js";
suite("Decorators", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  test("memoize should memoize methods", () => {
    class Foo {
      constructor(_answer) {
        this._answer = _answer;
      }
      static {
        __name(this, "Foo");
      }
      count = 0;
      answer() {
        this.count++;
        return this._answer;
      }
    }
    __decorateClass([
      memoize
    ], Foo.prototype, "answer", 1);
    const foo = new Foo(42);
    assert.strictEqual(foo.count, 0);
    assert.strictEqual(foo.answer(), 42);
    assert.strictEqual(foo.count, 1);
    assert.strictEqual(foo.answer(), 42);
    assert.strictEqual(foo.count, 1);
    const foo2 = new Foo(1337);
    assert.strictEqual(foo2.count, 0);
    assert.strictEqual(foo2.answer(), 1337);
    assert.strictEqual(foo2.count, 1);
    assert.strictEqual(foo2.answer(), 1337);
    assert.strictEqual(foo2.count, 1);
    assert.strictEqual(foo.answer(), 42);
    assert.strictEqual(foo.count, 1);
    const foo3 = new Foo(null);
    assert.strictEqual(foo3.count, 0);
    assert.strictEqual(foo3.answer(), null);
    assert.strictEqual(foo3.count, 1);
    assert.strictEqual(foo3.answer(), null);
    assert.strictEqual(foo3.count, 1);
    const foo4 = new Foo(void 0);
    assert.strictEqual(foo4.count, 0);
    assert.strictEqual(foo4.answer(), void 0);
    assert.strictEqual(foo4.count, 1);
    assert.strictEqual(foo4.answer(), void 0);
    assert.strictEqual(foo4.count, 1);
  });
  test("memoize should memoize getters", () => {
    class Foo {
      constructor(_answer) {
        this._answer = _answer;
      }
      static {
        __name(this, "Foo");
      }
      count = 0;
      get answer() {
        this.count++;
        return this._answer;
      }
    }
    __decorateClass([
      memoize
    ], Foo.prototype, "answer", 1);
    const foo = new Foo(42);
    assert.strictEqual(foo.count, 0);
    assert.strictEqual(foo.answer, 42);
    assert.strictEqual(foo.count, 1);
    assert.strictEqual(foo.answer, 42);
    assert.strictEqual(foo.count, 1);
    const foo2 = new Foo(1337);
    assert.strictEqual(foo2.count, 0);
    assert.strictEqual(foo2.answer, 1337);
    assert.strictEqual(foo2.count, 1);
    assert.strictEqual(foo2.answer, 1337);
    assert.strictEqual(foo2.count, 1);
    assert.strictEqual(foo.answer, 42);
    assert.strictEqual(foo.count, 1);
    const foo3 = new Foo(null);
    assert.strictEqual(foo3.count, 0);
    assert.strictEqual(foo3.answer, null);
    assert.strictEqual(foo3.count, 1);
    assert.strictEqual(foo3.answer, null);
    assert.strictEqual(foo3.count, 1);
    const foo4 = new Foo(void 0);
    assert.strictEqual(foo4.count, 0);
    assert.strictEqual(foo4.answer, void 0);
    assert.strictEqual(foo4.count, 1);
    assert.strictEqual(foo4.answer, void 0);
    assert.strictEqual(foo4.count, 1);
  });
  test("memoized property should not be enumerable", () => {
    class Foo {
      static {
        __name(this, "Foo");
      }
      get answer() {
        return 42;
      }
    }
    __decorateClass([
      memoize
    ], Foo.prototype, "answer", 1);
    const foo = new Foo();
    assert.strictEqual(foo.answer, 42);
    assert(!Object.keys(foo).some((k) => /\$memoize\$/.test(k)));
  });
  test("memoized property should not be writable", () => {
    class Foo {
      static {
        __name(this, "Foo");
      }
      get answer() {
        return 42;
      }
    }
    __decorateClass([
      memoize
    ], Foo.prototype, "answer", 1);
    const foo = new Foo();
    assert.strictEqual(foo.answer, 42);
    try {
      foo["$memoize$answer"] = 1337;
      assert(false);
    } catch (e) {
      assert.strictEqual(foo.answer, 42);
    }
  });
  test("throttle", () => {
    const spy = sinon.spy();
    const clock = sinon.useFakeTimers();
    try {
      class ThrottleTest {
        static {
          __name(this, "ThrottleTest");
        }
        _handle;
        constructor(fn) {
          this._handle = fn;
        }
        report(p) {
          this._handle(p);
        }
      }
      __decorateClass([
        throttle(
          100,
          (a, b) => a + b,
          () => 0
        )
      ], ThrottleTest.prototype, "report", 1);
      const t = new ThrottleTest(spy);
      t.report(1);
      t.report(2);
      t.report(3);
      assert.deepStrictEqual(spy.args, [[1]]);
      clock.tick(200);
      assert.deepStrictEqual(spy.args, [[1], [5]]);
      spy.resetHistory();
      t.report(4);
      t.report(5);
      clock.tick(50);
      t.report(6);
      assert.deepStrictEqual(spy.args, [[4]]);
      clock.tick(60);
      assert.deepStrictEqual(spy.args, [[4], [11]]);
    } finally {
      clock.restore();
    }
  });
});
//# sourceMappingURL=decorators.test.js.map
