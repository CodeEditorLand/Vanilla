import assert from "assert";
import * as objects from "../../common/objects.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "./utils.js";
const check = (one, other, msg) => {
  assert(objects.equals(one, other), msg);
  assert(objects.equals(other, one), "[reverse] " + msg);
};
const checkNot = (one, other, msg) => {
  assert(!objects.equals(one, other), msg);
  assert(!objects.equals(other, one), "[reverse] " + msg);
};
suite("Objects", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  test("equals", () => {
    check(null, null, "null");
    check(void 0, void 0, "undefined");
    check(1234, 1234, "numbers");
    check("", "", "empty strings");
    check("1234", "1234", "strings");
    check([], [], "empty arrays");
    check(
      [
        [1, 2, 3],
        [4, 5, 6]
      ],
      [
        [1, 2, 3],
        [4, 5, 6]
      ],
      "nested arrays"
    );
    check({}, {}, "empty objects");
    check({ a: 1, b: "123" }, { a: 1, b: "123" }, "objects");
    check({ a: 1, b: "123" }, { b: "123", a: 1 }, "objects (key order)");
    check(
      { a: { b: 1, c: 2 }, b: 3 },
      { a: { b: 1, c: 2 }, b: 3 },
      "nested objects"
    );
    checkNot(null, void 0, "null != undefined");
    checkNot(null, "", "null != empty string");
    checkNot(null, [], "null != empty array");
    checkNot(null, {}, "null != empty object");
    checkNot(null, 0, "null != zero");
    checkNot(void 0, "", "undefined != empty string");
    checkNot(void 0, [], "undefined != empty array");
    checkNot(void 0, {}, "undefined != empty object");
    checkNot(void 0, 0, "undefined != zero");
    checkNot("", [], "empty string != empty array");
    checkNot("", {}, "empty string != empty object");
    checkNot("", 0, "empty string != zero");
    checkNot([], {}, "empty array != empty object");
    checkNot([], 0, "empty array != zero");
    checkNot(0, [], "zero != empty array");
    checkNot("1234", 1234, "string !== number");
    checkNot(
      [
        [1, 2, 3],
        [4, 5, 6]
      ],
      [
        [1, 2, 3],
        [4, 5, 6e3]
      ],
      "arrays"
    );
    checkNot(
      { a: { b: 1, c: 2 }, b: 3 },
      { b: 3, a: { b: 9, c: 2 } },
      "objects"
    );
  });
  test("mixin - array", () => {
    const foo = {};
    objects.mixin(foo, { bar: [1, 2, 3] });
    assert(foo.bar);
    assert(Array.isArray(foo.bar));
    assert.strictEqual(foo.bar.length, 3);
    assert.strictEqual(foo.bar[0], 1);
    assert.strictEqual(foo.bar[1], 2);
    assert.strictEqual(foo.bar[2], 3);
  });
  test("mixin - no overwrite", () => {
    const foo = {
      bar: "123"
    };
    const bar = {
      bar: "456"
    };
    objects.mixin(foo, bar, false);
    assert.strictEqual(foo.bar, "123");
  });
  test("cloneAndChange", () => {
    const o1 = { something: "hello" };
    const o = {
      o1,
      o2: o1
    };
    assert.deepStrictEqual(
      objects.cloneAndChange(o, () => {
      }),
      o
    );
  });
  test("safeStringify", () => {
    const obj1 = {
      friend: null
    };
    const obj2 = {
      friend: null
    };
    obj1.friend = obj2;
    obj2.friend = obj1;
    const arr = [1];
    arr.push(arr);
    const circular = {
      a: 42,
      b: null,
      c: [obj1, obj2],
      d: null,
      e: BigInt(42)
    };
    arr.push(circular);
    circular.b = circular;
    circular.d = arr;
    const result = objects.safeStringify(circular);
    assert.deepStrictEqual(JSON.parse(result), {
      a: 42,
      b: "[Circular]",
      c: [
        {
          friend: {
            friend: "[Circular]"
          }
        },
        "[Circular]"
      ],
      d: [1, "[Circular]", "[Circular]"],
      e: "[BigInt 42]"
    });
  });
  test("distinct", () => {
    const base = {
      one: "one",
      two: 2,
      three: {
        3: true
      },
      four: false
    };
    let diff = objects.distinct(base, base);
    assert.strictEqual(Object.keys(diff).length, 0);
    let obj = {};
    diff = objects.distinct(base, obj);
    assert.strictEqual(Object.keys(diff).length, 0);
    obj = {
      one: "one",
      two: 2
    };
    diff = objects.distinct(base, obj);
    assert.strictEqual(Object.keys(diff).length, 0);
    obj = {
      three: {
        3: true
      },
      four: false
    };
    diff = objects.distinct(base, obj);
    assert.strictEqual(Object.keys(diff).length, 0);
    obj = {
      one: "two",
      two: 2,
      three: {
        3: true
      },
      four: true
    };
    diff = objects.distinct(base, obj);
    assert.strictEqual(Object.keys(diff).length, 2);
    assert.strictEqual(diff.one, "two");
    assert.strictEqual(diff.four, true);
    obj = {
      one: null,
      two: 2,
      three: {
        3: true
      },
      four: void 0
    };
    diff = objects.distinct(base, obj);
    assert.strictEqual(Object.keys(diff).length, 2);
    assert.strictEqual(diff.one, null);
    assert.strictEqual(diff.four, void 0);
    obj = {
      one: "two",
      two: 3,
      three: { 3: false },
      four: true
    };
    diff = objects.distinct(base, obj);
    assert.strictEqual(Object.keys(diff).length, 4);
    assert.strictEqual(diff.one, "two");
    assert.strictEqual(diff.two, 3);
    assert.strictEqual(diff.three?.["3"], false);
    assert.strictEqual(diff.four, true);
  });
  test("getCaseInsensitive", () => {
    const obj1 = {
      lowercase: 123,
      mIxEdCaSe: 456
    };
    assert.strictEqual(
      obj1.lowercase,
      objects.getCaseInsensitive(obj1, "lowercase")
    );
    assert.strictEqual(
      obj1.lowercase,
      objects.getCaseInsensitive(obj1, "lOwErCaSe")
    );
    assert.strictEqual(
      obj1.mIxEdCaSe,
      objects.getCaseInsensitive(obj1, "MIXEDCASE")
    );
    assert.strictEqual(
      obj1.mIxEdCaSe,
      objects.getCaseInsensitive(obj1, "mixedcase")
    );
  });
});
test("mapValues", () => {
  const obj = {
    a: 1,
    b: 2,
    c: 3
  };
  const result = objects.mapValues(
    obj,
    (value, key) => `${key}: ${value * 2}`
  );
  assert.deepStrictEqual(result, {
    a: "a: 2",
    b: "b: 4",
    c: "c: 6"
  });
});
