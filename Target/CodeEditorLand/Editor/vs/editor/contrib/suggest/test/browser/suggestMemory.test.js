import assert from "assert";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { createTextModel } from "../../../../test/common/testTextModel.js";
import {
  LRUMemory,
  Memory,
  NoMemory,
  PrefixMemory
} from "../../browser/suggestMemory.js";
import { createSuggestItem } from "./completionModel.test.js";
suite("SuggestMemories", () => {
  let pos;
  let buffer;
  let items;
  setup(() => {
    pos = { lineNumber: 1, column: 1 };
    buffer = createTextModel("This is some text.\nthis.\nfoo: ,");
    items = [createSuggestItem("foo", 0), createSuggestItem("bar", 0)];
  });
  teardown(() => {
    buffer.dispose();
  });
  ensureNoDisposablesAreLeakedInTestSuite();
  test("AbstractMemory, select", () => {
    const mem = new class extends Memory {
      constructor() {
        super("first");
      }
      memorize(model, pos2, item) {
        throw new Error("Method not implemented.");
      }
      toJSON() {
        throw new Error("Method not implemented.");
      }
      fromJSON(data) {
        throw new Error("Method not implemented.");
      }
    }();
    const item1 = createSuggestItem("fazz", 0);
    const item2 = createSuggestItem("bazz", 0);
    const item3 = createSuggestItem("bazz", 0);
    const item4 = createSuggestItem("bazz", 0);
    item1.completion.preselect = false;
    item2.completion.preselect = true;
    item3.completion.preselect = true;
    assert.strictEqual(
      mem.select(buffer, pos, [item1, item2, item3, item4]),
      1
    );
  });
  test("[No|Prefix|LRU]Memory honor selection boost", () => {
    const item1 = createSuggestItem("fazz", 0);
    const item2 = createSuggestItem("bazz", 0);
    const item3 = createSuggestItem("bazz", 0);
    const item4 = createSuggestItem("bazz", 0);
    item1.completion.preselect = false;
    item2.completion.preselect = true;
    item3.completion.preselect = true;
    const items2 = [item1, item2, item3, item4];
    assert.strictEqual(new NoMemory().select(buffer, pos, items2), 1);
    assert.strictEqual(new LRUMemory().select(buffer, pos, items2), 1);
    assert.strictEqual(new PrefixMemory().select(buffer, pos, items2), 1);
  });
  test("NoMemory", () => {
    const mem = new NoMemory();
    assert.strictEqual(mem.select(buffer, pos, items), 0);
    assert.strictEqual(mem.select(buffer, pos, []), 0);
    mem.memorize(buffer, pos, items[0]);
    mem.memorize(buffer, pos, null);
  });
  test("LRUMemory", () => {
    pos = { lineNumber: 2, column: 6 };
    const mem = new LRUMemory();
    mem.memorize(buffer, pos, items[1]);
    assert.strictEqual(mem.select(buffer, pos, items), 1);
    assert.strictEqual(
      mem.select(buffer, { lineNumber: 1, column: 3 }, items),
      0
    );
    mem.memorize(buffer, pos, items[0]);
    assert.strictEqual(mem.select(buffer, pos, items), 0);
    assert.strictEqual(
      mem.select(buffer, pos, [
        createSuggestItem("new", 0),
        createSuggestItem("bar", 0)
      ]),
      1
    );
    assert.strictEqual(
      mem.select(buffer, pos, [
        createSuggestItem("new1", 0),
        createSuggestItem("new2", 0)
      ]),
      0
    );
  });
  test('`"editor.suggestSelection": "recentlyUsed"` should be a little more sticky #78571', () => {
    const item1 = createSuggestItem("gamma", 0);
    const item2 = createSuggestItem("game", 0);
    items = [item1, item2];
    const mem = new LRUMemory();
    buffer.setValue("    foo.");
    mem.memorize(buffer, { lineNumber: 1, column: 1 }, item2);
    assert.strictEqual(
      mem.select(buffer, { lineNumber: 1, column: 2 }, items),
      0
    );
    mem.memorize(buffer, { lineNumber: 1, column: 9 }, item2);
    assert.strictEqual(
      mem.select(buffer, { lineNumber: 1, column: 9 }, items),
      1
    );
    buffer.setValue("    foo.g");
    assert.strictEqual(
      mem.select(buffer, { lineNumber: 1, column: 10 }, items),
      1
    );
    item1.score = [10, 0, 0];
    assert.strictEqual(
      mem.select(buffer, { lineNumber: 1, column: 10 }, items),
      0
    );
  });
  test("intellisense is not showing top options first #43429", () => {
    pos = { lineNumber: 2, column: 6 };
    const mem = new LRUMemory();
    mem.memorize(buffer, pos, items[1]);
    assert.strictEqual(mem.select(buffer, pos, items), 1);
    assert.strictEqual(
      mem.select(buffer, { lineNumber: 3, column: 5 }, items),
      0
    );
    assert.strictEqual(
      mem.select(buffer, { lineNumber: 3, column: 6 }, items),
      1
    );
  });
  test("PrefixMemory", () => {
    const mem = new PrefixMemory();
    buffer.setValue("constructor");
    const item0 = createSuggestItem("console", 0);
    const item1 = createSuggestItem("const", 0);
    const item2 = createSuggestItem("constructor", 0);
    const item3 = createSuggestItem("constant", 0);
    const items2 = [item0, item1, item2, item3];
    mem.memorize(buffer, { lineNumber: 1, column: 2 }, item1);
    mem.memorize(buffer, { lineNumber: 1, column: 3 }, item0);
    mem.memorize(buffer, { lineNumber: 1, column: 4 }, item2);
    assert.strictEqual(
      mem.select(buffer, { lineNumber: 1, column: 1 }, items2),
      0
    );
    assert.strictEqual(
      mem.select(buffer, { lineNumber: 1, column: 2 }, items2),
      1
    );
    assert.strictEqual(
      mem.select(buffer, { lineNumber: 1, column: 3 }, items2),
      0
    );
    assert.strictEqual(
      mem.select(buffer, { lineNumber: 1, column: 4 }, items2),
      2
    );
    assert.strictEqual(
      mem.select(buffer, { lineNumber: 1, column: 7 }, items2),
      2
    );
  });
});
