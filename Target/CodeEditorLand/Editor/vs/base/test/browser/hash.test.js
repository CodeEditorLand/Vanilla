var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { sha1Hex } from "../../browser/hash.js";
import { hash, StringSHA1 } from "../../common/hash.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../common/utils.js";
suite("Hash", () => {
  test("string", () => {
    assert.strictEqual(hash("hello"), hash("hello"));
    assert.notStrictEqual(hash("hello"), hash("world"));
    assert.notStrictEqual(hash("hello"), hash("olleh"));
    assert.notStrictEqual(hash("hello"), hash("Hello"));
    assert.notStrictEqual(hash("hello"), hash("Hello "));
    assert.notStrictEqual(hash("h"), hash("H"));
    assert.notStrictEqual(hash("-"), hash("_"));
  });
  test("number", () => {
    assert.strictEqual(hash(1), hash(1));
    assert.notStrictEqual(hash(0), hash(1));
    assert.notStrictEqual(hash(1), hash(-1));
    assert.notStrictEqual(hash(305419896), hash(4886718345));
  });
  test("boolean", () => {
    assert.strictEqual(hash(true), hash(true));
    assert.notStrictEqual(hash(true), hash(false));
  });
  test("array", () => {
    assert.strictEqual(hash([1, 2, 3]), hash([1, 2, 3]));
    assert.strictEqual(hash(["foo", "bar"]), hash(["foo", "bar"]));
    assert.strictEqual(hash([]), hash([]));
    assert.strictEqual(hash([]), hash(new Array()));
    assert.notStrictEqual(hash(["foo", "bar"]), hash(["bar", "foo"]));
    assert.notStrictEqual(hash(["foo", "bar"]), hash(["bar", "foo", null]));
    assert.notStrictEqual(hash(["foo", "bar", null]), hash(["bar", "foo", null]));
    assert.notStrictEqual(hash(["foo", "bar"]), hash(["bar", "foo", void 0]));
    assert.notStrictEqual(hash(["foo", "bar", void 0]), hash(["bar", "foo", void 0]));
    assert.notStrictEqual(hash(["foo", "bar", null]), hash(["foo", "bar", void 0]));
  });
  test("object", () => {
    assert.strictEqual(hash({}), hash({}));
    assert.strictEqual(hash({}), hash(/* @__PURE__ */ Object.create(null)));
    assert.strictEqual(hash({ "foo": "bar" }), hash({ "foo": "bar" }));
    assert.strictEqual(hash({ "foo": "bar", "foo2": void 0 }), hash({ "foo2": void 0, "foo": "bar" }));
    assert.notStrictEqual(hash({ "foo": "bar" }), hash({ "foo": "bar2" }));
    assert.notStrictEqual(hash({}), hash([]));
  });
  test("array - unexpected collision", function() {
    const a = hash([void 0, void 0, void 0, void 0, void 0]);
    const b = hash([void 0, void 0, "HHHHHH", [{ line: 0, character: 0 }, { line: 0, character: 0 }], void 0]);
    assert.notStrictEqual(a, b);
  });
  test("all different", () => {
    const candidates = [
      null,
      void 0,
      {},
      [],
      0,
      false,
      true,
      "",
      " ",
      [null],
      [void 0],
      [void 0, void 0],
      { "": void 0 },
      { [" "]: void 0 },
      "ab",
      "ba",
      ["ab"]
    ];
    const hashes = candidates.map(hash);
    for (let i = 0; i < hashes.length; i++) {
      assert.strictEqual(hashes[i], hash(candidates[i]));
      for (let k = i + 1; k < hashes.length; k++) {
        assert.notStrictEqual(hashes[i], hashes[k], `Same hash ${hashes[i]} for ${JSON.stringify(candidates[i])} and ${JSON.stringify(candidates[k])}`);
      }
    }
  });
  async function checkSHA1(str, expected) {
    const hash2 = new StringSHA1();
    hash2.update(str);
    let actual = hash2.digest();
    assert.strictEqual(actual, expected);
    actual = await sha1Hex(str);
    assert.strictEqual(actual, expected);
  }
  __name(checkSHA1, "checkSHA1");
  test("sha1-1", () => {
    return checkSHA1("\uDD56", "9bdb77276c1852e1fb067820472812fcf6084024");
  });
  test("sha1-2", () => {
    return checkSHA1("\uDB52", "9bdb77276c1852e1fb067820472812fcf6084024");
  });
  test("sha1-3", () => {
    return checkSHA1("\uDA02\uA44D", "9b483a471f22fe7e09d83f221871a987244bbd3f");
  });
  test("sha1-4", () => {
    return checkSHA1("hello", "aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d");
  });
  ensureNoDisposablesAreLeakedInTestSuite();
});
//# sourceMappingURL=hash.test.js.map
