import assert from "assert";
import { isFunction } from "../../../../base/common/types.js";
import { Registry } from "../../common/platform.js";
suite("Platform / Registry", () => {
  test("registry - api", () => {
    assert.ok(isFunction(Registry.add));
    assert.ok(isFunction(Registry.as));
    assert.ok(isFunction(Registry.knows));
  });
  test("registry - mixin", () => {
    Registry.add("foo", { bar: true });
    assert.ok(Registry.knows("foo"));
    assert.ok(Registry.as("foo").bar);
    assert.strictEqual(Registry.as("foo").bar, true);
  });
  test("registry - knows, as", () => {
    const ext = {};
    Registry.add("knows,as", ext);
    assert.ok(Registry.knows("knows,as"));
    assert.ok(!Registry.knows("knows,as1234"));
    assert.ok(Registry.as("knows,as") === ext);
    assert.ok(Registry.as("knows,as1234") === null);
  });
  test("registry - mixin, fails on duplicate ids", () => {
    Registry.add("foo-dup", { bar: true });
    try {
      Registry.add("foo-dup", { bar: false });
      assert.ok(false);
    } catch (e) {
      assert.ok(true);
    }
  });
});
