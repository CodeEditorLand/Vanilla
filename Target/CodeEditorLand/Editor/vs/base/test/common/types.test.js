var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
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
    assert(!types.isFunction(new RegExp("")));
    assert(!types.isFunction(/* @__PURE__ */ new Date()));
    assert(types.isFunction(assert));
    assert(types.isFunction(/* @__PURE__ */ __name(function foo() {
    }, "foo")));
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
    assert(!types.areFunctions(new RegExp("")));
    assert(!types.areFunctions(/* @__PURE__ */ new Date()));
    assert(!types.areFunctions(assert, ""));
    assert(types.areFunctions(assert));
    assert(types.areFunctions(assert, assert));
    assert(types.areFunctions(/* @__PURE__ */ __name(function foo() {
    }, "foo")));
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
    assert(!types.isObject(new RegExp("")));
    assert(!types.isFunction(/* @__PURE__ */ new Date()));
    assert.strictEqual(types.isObject(assert), false);
    assert(!types.isObject(/* @__PURE__ */ __name(function foo() {
    }, "foo")));
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
    assert(!types.isEmptyObject(new RegExp("")));
    assert(!types.isEmptyObject(/* @__PURE__ */ new Date()));
    assert.strictEqual(types.isEmptyObject(assert), false);
    assert(!types.isEmptyObject(/* @__PURE__ */ __name(function foo() {
    }, "foo")));
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
    assert(!types.isString(new RegExp("")));
    assert(!types.isString(/* @__PURE__ */ new Date()));
    assert(!types.isString(assert));
    assert(!types.isString(/* @__PURE__ */ __name(function foo() {
    }, "foo")));
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
    assert(!types.isNumber(new RegExp("")));
    assert(!types.isNumber(/* @__PURE__ */ new Date()));
    assert(!types.isNumber(assert));
    assert(!types.isNumber(/* @__PURE__ */ __name(function foo() {
    }, "foo")));
    assert(!types.isNumber({ foo: "bar" }));
    assert(!types.isNumber(parseInt("A", 10)));
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
    assert(!types.isUndefined(new RegExp("")));
    assert(!types.isUndefined(/* @__PURE__ */ new Date()));
    assert(!types.isUndefined(assert));
    assert(!types.isUndefined(/* @__PURE__ */ __name(function foo() {
    }, "foo")));
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
    assert(!types.isUndefinedOrNull(new RegExp("")));
    assert(!types.isUndefinedOrNull(/* @__PURE__ */ new Date()));
    assert(!types.isUndefinedOrNull(assert));
    assert(!types.isUndefinedOrNull(/* @__PURE__ */ __name(function foo() {
    }, "foo")));
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
    types.validateConstraints([1, "test", true], ["number", "string", "boolean"]);
    types.validateConstraints([console.log], [Function]);
    types.validateConstraints([void 0], [types.isUndefined]);
    types.validateConstraints([1], [types.isNumber]);
    class Foo {
      static {
        __name(this, "Foo");
      }
    }
    types.validateConstraints([new Foo()], [Foo]);
    function isFoo(f) {
    }
    __name(isFoo, "isFoo");
    assert.throws(() => types.validateConstraints([new Foo()], [isFoo]));
    function isFoo2(f) {
      return true;
    }
    __name(isFoo2, "isFoo2");
    types.validateConstraints([new Foo()], [isFoo2]);
    assert.throws(() => types.validateConstraints([1, true], [types.isNumber, types.isString]));
    assert.throws(() => types.validateConstraints(["2"], [types.isNumber]));
    assert.throws(() => types.validateConstraints([1, "test", true], [Number, String, Number]));
  });
});
//# sourceMappingURL=types.test.js.map
