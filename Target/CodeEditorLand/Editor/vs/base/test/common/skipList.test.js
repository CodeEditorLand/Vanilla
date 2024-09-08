import assert from "assert";
import { binarySearch } from "../../common/arrays.js";
import { SkipList } from "../../common/skipList.js";
import { StopWatch } from "../../common/stopwatch.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "./utils.js";
suite("SkipList", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  function assertValues(list, expected) {
    assert.strictEqual(list.size, expected.length);
    assert.deepStrictEqual([...list.values()], expected);
    const valuesFromEntries = [...list.entries()].map((entry) => entry[1]);
    assert.deepStrictEqual(valuesFromEntries, expected);
    const valuesFromIter = [...list].map((entry) => entry[1]);
    assert.deepStrictEqual(valuesFromIter, expected);
    let i = 0;
    list.forEach((value, _key, map) => {
      assert.ok(map === list);
      assert.deepStrictEqual(value, expected[i++]);
    });
  }
  function assertKeys(list, expected) {
    assert.strictEqual(list.size, expected.length);
    assert.deepStrictEqual([...list.keys()], expected);
    const keysFromEntries = [...list.entries()].map((entry) => entry[0]);
    assert.deepStrictEqual(keysFromEntries, expected);
    const keysFromIter = [...list].map((entry) => entry[0]);
    assert.deepStrictEqual(keysFromIter, expected);
    let i = 0;
    list.forEach((_value, key, map) => {
      assert.ok(map === list);
      assert.deepStrictEqual(key, expected[i++]);
    });
  }
  test("set/get/delete", () => {
    const list = new SkipList((a, b) => a - b);
    assert.strictEqual(list.get(3), void 0);
    list.set(3, 1);
    assert.strictEqual(list.get(3), 1);
    assertValues(list, [1]);
    list.set(3, 3);
    assertValues(list, [3]);
    list.set(1, 1);
    list.set(4, 4);
    assert.strictEqual(list.get(3), 3);
    assert.strictEqual(list.get(1), 1);
    assert.strictEqual(list.get(4), 4);
    assertValues(list, [1, 3, 4]);
    assert.strictEqual(list.delete(17), false);
    assert.strictEqual(list.delete(1), true);
    assert.strictEqual(list.get(1), void 0);
    assert.strictEqual(list.get(3), 3);
    assert.strictEqual(list.get(4), 4);
    assertValues(list, [3, 4]);
  });
  test("Figure 3", () => {
    const list = new SkipList((a, b) => a - b);
    list.set(3, true);
    list.set(6, true);
    list.set(7, true);
    list.set(9, true);
    list.set(12, true);
    list.set(19, true);
    list.set(21, true);
    list.set(25, true);
    assertKeys(list, [3, 6, 7, 9, 12, 19, 21, 25]);
    list.set(17, true);
    assert.deepStrictEqual(list.size, 9);
    assertKeys(list, [3, 6, 7, 9, 12, 17, 19, 21, 25]);
  });
  test("clear ( CPU pegged after some builds #194853)", () => {
    const list = new SkipList((a, b) => a - b);
    list.set(1, true);
    list.set(2, true);
    list.set(3, true);
    assert.strictEqual(list.size, 3);
    list.clear();
    assert.strictEqual(list.size, 0);
    assert.strictEqual(list.get(1), void 0);
    assert.strictEqual(list.get(2), void 0);
    assert.strictEqual(list.get(3), void 0);
  });
  test("capacity max", () => {
    const list = new SkipList((a, b) => a - b, 10);
    list.set(1, true);
    list.set(2, true);
    list.set(3, true);
    list.set(4, true);
    list.set(5, true);
    list.set(6, true);
    list.set(7, true);
    list.set(8, true);
    list.set(9, true);
    list.set(10, true);
    list.set(11, true);
    list.set(12, true);
    assertKeys(list, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });
  const cmp = (a, b) => {
    if (a < b) {
      return -1;
    } else if (a > b) {
      return 1;
    } else {
      return 0;
    }
  };
  function insertArraySorted(array, element) {
    let idx = binarySearch(array, element, cmp);
    if (idx >= 0) {
      array[idx] = element;
    } else {
      idx = ~idx;
      array.splice(idx, 0, element);
    }
    return array;
  }
  function delArraySorted(array, element) {
    const idx = binarySearch(array, element, cmp);
    if (idx >= 0) {
      array.splice(idx, 1);
    }
    return array;
  }
  test.skip("perf", () => {
    const max = 2 ** 16;
    const values = /* @__PURE__ */ new Set();
    for (let i = 0; i < max; i++) {
      const value = Math.floor(Math.random() * max);
      values.add(value);
    }
    console.log(values.size);
    const list = new SkipList(cmp, max);
    let sw = new StopWatch();
    values.forEach((value) => list.set(value, true));
    sw.stop();
    console.log(`[LIST] ${list.size} elements after ${sw.elapsed()}ms`);
    let array = [];
    sw = new StopWatch();
    values.forEach((value) => array = insertArraySorted(array, value));
    sw.stop();
    console.log(`[ARRAY] ${array.length} elements after ${sw.elapsed()}ms`);
    sw = new StopWatch();
    const someValues = [...values].slice(0, values.size / 4);
    someValues.forEach((key) => {
      const value = list.get(key);
      console.assert(value, "[LIST] must have " + key);
      list.get(-key);
    });
    sw.stop();
    console.log(
      `[LIST] retrieve ${sw.elapsed()}ms (${(sw.elapsed() / (someValues.length * 2)).toPrecision(4)}ms/op)`
    );
    sw = new StopWatch();
    someValues.forEach((key) => {
      const idx = binarySearch(array, key, cmp);
      console.assert(idx >= 0, "[ARRAY] must have " + key);
      binarySearch(array, -key, cmp);
    });
    sw.stop();
    console.log(
      `[ARRAY] retrieve ${sw.elapsed()}ms (${(sw.elapsed() / (someValues.length * 2)).toPrecision(4)}ms/op)`
    );
    sw = new StopWatch();
    someValues.forEach((key) => {
      list.set(-key, false);
    });
    sw.stop();
    console.log(
      `[LIST] insert ${sw.elapsed()}ms (${(sw.elapsed() / someValues.length).toPrecision(4)}ms/op)`
    );
    sw = new StopWatch();
    someValues.forEach((key) => {
      array = insertArraySorted(array, -key);
    });
    sw.stop();
    console.log(
      `[ARRAY] insert ${sw.elapsed()}ms (${(sw.elapsed() / someValues.length).toPrecision(4)}ms/op)`
    );
    sw = new StopWatch();
    someValues.forEach((key) => {
      list.delete(key);
      list.delete(-key);
    });
    sw.stop();
    console.log(
      `[LIST] delete ${sw.elapsed()}ms (${(sw.elapsed() / (someValues.length * 2)).toPrecision(4)}ms/op)`
    );
    sw = new StopWatch();
    someValues.forEach((key) => {
      array = delArraySorted(array, key);
      array = delArraySorted(array, -key);
    });
    sw.stop();
    console.log(
      `[ARRAY] delete ${sw.elapsed()}ms (${(sw.elapsed() / (someValues.length * 2)).toPrecision(4)}ms/op)`
    );
  });
});
