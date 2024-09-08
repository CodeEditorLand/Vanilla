import assert from "assert";
import * as types from "../../common/types.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "./utils.js";
suite("Types", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  test("isFunction", () => {
    assert(!types.isFunction(void 0));
    assert(!types.isFunction(null));
    assert(!types.isFunction("foo"));
    assert(!types.isFunction(5));
    assert(!types.isFunction(true));
    assert(!types.isFunction([]));
    assert(!types.isFunction([1, 2, "3"]));
    assert(!types.isFunction({}));
    assert(!types.isFunction({ foo: "bar" }));
    assert(!types.isFunction(/test/));
    assert(!types.isFunction(/(?:)/));
    assert(!types.isFunction(/* @__PURE__ */ new Date()));
    assert(types.isFunction(assert));
    assert(
      types.isFunction(function foo() {
      })
    );
  });
  test("areFunctions", () => {
    assert(!types.areFunctions());
    assert(!types.areFunctions(null));
    assert(!types.areFunctions("foo"));
    assert(!types.areFunctions(5));
    assert(!types.areFunctions(true));
    assert(!types.areFunctions([]));
    assert(!types.areFunctions([1, 2, "3"]));
    assert(!types.areFunctions({}));
    assert(!types.areFunctions({ foo: "bar" }));
    assert(!types.areFunctions(/test/));
    assert(!types.areFunctions(/(?:)/));
    assert(!types.areFunctions(/* @__PURE__ */ new Date()));
    assert(!types.areFunctions(assert, ""));
    assert(types.areFunctions(assert));
    assert(types.areFunctions(assert, assert));
    assert(
      types.areFunctions(function foo() {
      })
    );
  });
  test("isObject", () => {
    assert(!types.isObject(void 0));
    assert(!types.isObject(null));
    assert(!types.isObject("foo"));
    assert(!types.isObject(5));
    assert(!types.isObject(true));
    assert(!types.isObject([]));
    assert(!types.isObject([1, 2, "3"]));
    assert(!types.isObject(/test/));
    assert(!types.isObject(/(?:)/));
    assert(!types.isFunction(/* @__PURE__ */ new Date()));
    assert.strictEqual(types.isObject(assert), false);
    assert(!types.isObject(function foo() {
    }));
    assert(types.isObject({}));
    assert(types.isObject({ foo: "bar" }));
  });
  test("isEmptyObject", () => {
    assert(!types.isEmptyObject(void 0));
    assert(!types.isEmptyObject(null));
    assert(!types.isEmptyObject("foo"));
    assert(!types.isEmptyObject(5));
    assert(!types.isEmptyObject(true));
    assert(!types.isEmptyObject([]));
    assert(!types.isEmptyObject([1, 2, "3"]));
    assert(!types.isEmptyObject(/test/));
    assert(!types.isEmptyObject(/(?:)/));
    assert(!types.isEmptyObject(/* @__PURE__ */ new Date()));
    assert.strictEqual(types.isEmptyObject(assert), false);
    assert(
      !types.isEmptyObject(function foo() {
      })
    );
    assert(!types.isEmptyObject({ foo: "bar" }));
    assert(types.isEmptyObject({}));
  });
  test("isString", () => {
    assert(!types.isString(void 0));
    assert(!types.isString(null));
    assert(!types.isString(5));
    assert(!types.isString([]));
    assert(!types.isString([1, 2, "3"]));
    assert(!types.isString(true));
    assert(!types.isString({}));
    assert(!types.isString(/test/));
    assert(!types.isString(/(?:)/));
    assert(!types.isString(/* @__PURE__ */ new Date()));
    assert(!types.isString(assert));
    assert(
      !types.isString(function foo() {
      })
    );
    assert(!types.isString({ foo: "bar" }));
    assert(types.isString("foo"));
  });
  test("isNumber", () => {
    assert(!types.isNumber(void 0));
    assert(!types.isNumber(null));
    assert(!types.isNumber("foo"));
    assert(!types.isNumber([]));
    assert(!types.isNumber([1, 2, "3"]));
    assert(!types.isNumber(true));
    assert(!types.isNumber({}));
    assert(!types.isNumber(/test/));
    assert(!types.isNumber(/(?:)/));
    assert(!types.isNumber(/* @__PURE__ */ new Date()));
    assert(!types.isNumber(assert));
    assert(
      !types.isNumber(function foo() {
      })
    );
    assert(!types.isNumber({ foo: "bar" }));
    assert(!types.isNumber(Number.parseInt("A", 10)));
    assert(types.isNumber(5));
  });
  test("isUndefined", () => {
    assert(!types.isUndefined(null));
    assert(!types.isUndefined("foo"));
    assert(!types.isUndefined([]));
    assert(!types.isUndefined([1, 2, "3"]));
    assert(!types.isUndefined(true));
    assert(!types.isUndefined({}));
    assert(!types.isUndefined(/test/));
    assert(!types.isUndefined(/(?:)/));
    assert(!types.isUndefined(/* @__PURE__ */ new Date()));
    assert(!types.isUndefined(assert));
    assert(
      !types.isUndefined(function foo() {
      })
    );
    assert(!types.isUndefined({ foo: "bar" }));
    assert(types.isUndefined(void 0));
  });
  test("isUndefinedOrNull", () => {
    assert(!types.isUndefinedOrNull("foo"));
    assert(!types.isUndefinedOrNull([]));
    assert(!types.isUndefinedOrNull([1, 2, "3"]));
    assert(!types.isUndefinedOrNull(true));
    assert(!types.isUndefinedOrNull({}));
    assert(!types.isUndefinedOrNull(/test/));
    assert(!types.isUndefinedOrNull(/(?:)/));
    assert(!types.isUndefinedOrNull(/* @__PURE__ */ new Date()));
    assert(!types.isUndefinedOrNull(assert));
    assert(
      !types.isUndefinedOrNull(function foo() {
      })
    );
    assert(!types.isUndefinedOrNull({ foo: "bar" }));
    assert(types.isUndefinedOrNull(void 0));
    assert(types.isUndefinedOrNull(null));
  });
  test("assertIsDefined / assertAreDefined", () => {
    assert.throws(() => types.assertIsDefined(void 0));
    assert.throws(() => types.assertIsDefined(null));
    assert.throws(() => types.assertAllDefined(null, void 0));
    assert.throws(() => types.assertAllDefined(true, void 0));
    assert.throws(() => types.assertAllDefined(void 0, false));
    assert.strictEqual(types.assertIsDefined(true), true);
    assert.strictEqual(types.assertIsDefined(false), false);
    assert.strictEqual(types.assertIsDefined("Hello"), "Hello");
    assert.strictEqual(types.assertIsDefined(""), "");
    const res = types.assertAllDefined(1, true, "Hello");
    assert.strictEqual(res[0], 1);
    assert.strictEqual(res[1], true);
    assert.strictEqual(res[2], "Hello");
  });
  test("validateConstraints", () => {
    types.validateConstraints([1, "test", true], [Number, String, Boolean]);
    types.validateConstraints(
      [1, "test", true],
      ["number", "string", "boolean"]
    );
    types.validateConstraints([console.log], [Function]);
    types.validateConstraints([void 0], [types.isUndefined]);
    types.validateConstraints([1], [types.isNumber]);
    class Foo {
    }
    types.validateConstraints([new Foo()], [Foo]);
    function isFoo(f) {
    }
    assert.throws(() => types.validateConstraints([new Foo()], [isFoo]));
    function isFoo2(f) {
      return true;
    }
    types.validateConstraints([new Foo()], [isFoo2]);
    assert.throws(
      () => types.validateConstraints(
        [1, true],
        [types.isNumber, types.isString]
      )
    );
    assert.throws(() => types.validateConstraints(["2"], [types.isNumber]));
    assert.throws(
      () => types.validateConstraints(
        [1, "test", true],
        [Number, String, Number]
      )
    );
  });
});
