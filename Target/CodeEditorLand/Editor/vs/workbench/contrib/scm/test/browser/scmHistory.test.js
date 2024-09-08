import * as assert from "assert";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import {
  colorRegistry,
  historyItemGroupBase,
  historyItemGroupLocal,
  historyItemGroupRemote,
  toISCMHistoryItemViewModelArray
} from "../../browser/scmHistory.js";
function toSCMHistoryItem(id, parentIds, labels) {
  return {
    id,
    parentIds,
    subject: "",
    message: "",
    labels
  };
}
suite("toISCMHistoryItemViewModelArray", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  test("empty graph", () => {
    const viewModels = toISCMHistoryItemViewModelArray([]);
    assert.strictEqual(viewModels.length, 0);
  });
  test("single commit", () => {
    const models = [toSCMHistoryItem("a", [])];
    const viewModels = toISCMHistoryItemViewModelArray(models);
    assert.strictEqual(viewModels.length, 1);
    assert.strictEqual(viewModels[0].inputSwimlanes.length, 0);
    assert.strictEqual(viewModels[0].outputSwimlanes.length, 0);
  });
  test("linear graph", () => {
    const models = [
      toSCMHistoryItem("a", ["b"]),
      toSCMHistoryItem("b", ["c"]),
      toSCMHistoryItem("c", ["d"]),
      toSCMHistoryItem("d", ["e"]),
      toSCMHistoryItem("e", [])
    ];
    const viewModels = toISCMHistoryItemViewModelArray(models);
    assert.strictEqual(viewModels.length, 5);
    assert.strictEqual(viewModels[0].inputSwimlanes.length, 0);
    assert.strictEqual(viewModels[0].outputSwimlanes.length, 1);
    assert.strictEqual(viewModels[0].outputSwimlanes[0].id, "b");
    assert.strictEqual(
      viewModels[0].outputSwimlanes[0].color,
      colorRegistry[0]
    );
    assert.strictEqual(viewModels[1].inputSwimlanes.length, 1);
    assert.strictEqual(viewModels[1].inputSwimlanes[0].id, "b");
    assert.strictEqual(
      viewModels[1].inputSwimlanes[0].color,
      colorRegistry[0]
    );
    assert.strictEqual(viewModels[1].outputSwimlanes.length, 1);
    assert.strictEqual(viewModels[1].outputSwimlanes[0].id, "c");
    assert.strictEqual(
      viewModels[1].outputSwimlanes[0].color,
      colorRegistry[0]
    );
    assert.strictEqual(viewModels[2].inputSwimlanes.length, 1);
    assert.strictEqual(viewModels[2].inputSwimlanes[0].id, "c");
    assert.strictEqual(
      viewModels[2].inputSwimlanes[0].color,
      colorRegistry[0]
    );
    assert.strictEqual(viewModels[2].outputSwimlanes.length, 1);
    assert.strictEqual(viewModels[2].outputSwimlanes[0].id, "d");
    assert.strictEqual(
      viewModels[2].outputSwimlanes[0].color,
      colorRegistry[0]
    );
    assert.strictEqual(viewModels[3].inputSwimlanes.length, 1);
    assert.strictEqual(viewModels[3].inputSwimlanes[0].id, "d");
    assert.strictEqual(
      viewModels[3].inputSwimlanes[0].color,
      colorRegistry[0]
    );
    assert.strictEqual(viewModels[3].outputSwimlanes.length, 1);
    assert.strictEqual(viewModels[3].outputSwimlanes[0].id, "e");
    assert.strictEqual(
      viewModels[3].outputSwimlanes[0].color,
      colorRegistry[0]
    );
    assert.strictEqual(viewModels[4].inputSwimlanes.length, 1);
    assert.strictEqual(viewModels[4].inputSwimlanes[0].id, "e");
    assert.strictEqual(
      viewModels[4].inputSwimlanes[0].color,
      colorRegistry[0]
    );
    assert.strictEqual(viewModels[4].outputSwimlanes.length, 0);
  });
  test("merge commit (single commit in topic branch)", () => {
    const models = [
      toSCMHistoryItem("a", ["b"]),
      toSCMHistoryItem("b", ["c", "d"]),
      toSCMHistoryItem("d", ["c"]),
      toSCMHistoryItem("c", ["e"]),
      toSCMHistoryItem("e", ["f"])
    ];
    const viewModels = toISCMHistoryItemViewModelArray(models);
    assert.strictEqual(viewModels.length, 5);
    assert.strictEqual(viewModels[0].inputSwimlanes.length, 0);
    assert.strictEqual(viewModels[0].outputSwimlanes.length, 1);
    assert.strictEqual(viewModels[0].outputSwimlanes[0].id, "b");
    assert.strictEqual(
      viewModels[0].outputSwimlanes[0].color,
      colorRegistry[0]
    );
    assert.strictEqual(viewModels[1].inputSwimlanes.length, 1);
    assert.strictEqual(viewModels[1].inputSwimlanes[0].id, "b");
    assert.strictEqual(
      viewModels[1].inputSwimlanes[0].color,
      colorRegistry[0]
    );
    assert.strictEqual(viewModels[1].outputSwimlanes.length, 2);
    assert.strictEqual(viewModels[1].outputSwimlanes[0].id, "c");
    assert.strictEqual(
      viewModels[1].outputSwimlanes[0].color,
      colorRegistry[0]
    );
    assert.strictEqual(viewModels[1].outputSwimlanes[1].id, "d");
    assert.strictEqual(
      viewModels[1].outputSwimlanes[1].color,
      colorRegistry[1]
    );
    assert.strictEqual(viewModels[2].inputSwimlanes.length, 2);
    assert.strictEqual(viewModels[2].inputSwimlanes[0].id, "c");
    assert.strictEqual(
      viewModels[2].inputSwimlanes[0].color,
      colorRegistry[0]
    );
    assert.strictEqual(viewModels[2].inputSwimlanes[1].id, "d");
    assert.strictEqual(
      viewModels[2].inputSwimlanes[1].color,
      colorRegistry[1]
    );
    assert.strictEqual(viewModels[2].outputSwimlanes.length, 2);
    assert.strictEqual(viewModels[2].outputSwimlanes[0].id, "c");
    assert.strictEqual(
      viewModels[2].outputSwimlanes[0].color,
      colorRegistry[0]
    );
    assert.strictEqual(viewModels[2].outputSwimlanes[1].id, "c");
    assert.strictEqual(
      viewModels[2].outputSwimlanes[1].color,
      colorRegistry[1]
    );
    assert.strictEqual(viewModels[3].inputSwimlanes.length, 2);
    assert.strictEqual(viewModels[3].inputSwimlanes[0].id, "c");
    assert.strictEqual(
      viewModels[3].inputSwimlanes[0].color,
      colorRegistry[0]
    );
    assert.strictEqual(viewModels[3].inputSwimlanes[1].id, "c");
    assert.strictEqual(
      viewModels[3].inputSwimlanes[1].color,
      colorRegistry[1]
    );
    assert.strictEqual(viewModels[3].outputSwimlanes.length, 1);
    assert.strictEqual(viewModels[3].outputSwimlanes[0].id, "e");
    assert.strictEqual(
      viewModels[3].outputSwimlanes[0].color,
      colorRegistry[0]
    );
    assert.strictEqual(viewModels[4].inputSwimlanes.length, 1);
    assert.strictEqual(viewModels[4].inputSwimlanes[0].id, "e");
    assert.strictEqual(
      viewModels[4].inputSwimlanes[0].color,
      colorRegistry[0]
    );
    assert.strictEqual(viewModels[4].outputSwimlanes.length, 1);
    assert.strictEqual(viewModels[4].outputSwimlanes[0].id, "f");
    assert.strictEqual(
      viewModels[4].outputSwimlanes[0].color,
      colorRegistry[0]
    );
  });
  test("merge commit (multiple commits in topic branch)", () => {
    const models = [
      toSCMHistoryItem("a", ["b", "c"]),
      toSCMHistoryItem("c", ["d"]),
      toSCMHistoryItem("b", ["e"]),
      toSCMHistoryItem("e", ["f"]),
      toSCMHistoryItem("f", ["d"]),
      toSCMHistoryItem("d", ["g"])
    ];
    const viewModels = toISCMHistoryItemViewModelArray(models);
    assert.strictEqual(viewModels.length, 6);
    assert.strictEqual(viewModels[0].inputSwimlanes.length, 0);
    assert.strictEqual(viewModels[0].outputSwimlanes.length, 2);
    assert.strictEqual(viewModels[0].outputSwimlanes[0].id, "b");
    assert.strictEqual(
      viewModels[0].outputSwimlanes[0].color,
      colorRegistry[0]
    );
    assert.strictEqual(viewModels[0].outputSwimlanes[1].id, "c");
    assert.strictEqual(
      viewModels[0].outputSwimlanes[1].color,
      colorRegistry[1]
    );
    assert.strictEqual(viewModels[1].inputSwimlanes.length, 2);
    assert.strictEqual(viewModels[1].inputSwimlanes[0].id, "b");
    assert.strictEqual(
      viewModels[1].inputSwimlanes[0].color,
      colorRegistry[0]
    );
    assert.strictEqual(viewModels[1].inputSwimlanes[1].id, "c");
    assert.strictEqual(
      viewModels[1].inputSwimlanes[1].color,
      colorRegistry[1]
    );
    assert.strictEqual(viewModels[1].outputSwimlanes.length, 2);
    assert.strictEqual(viewModels[1].outputSwimlanes[0].id, "b");
    assert.strictEqual(
      viewModels[1].outputSwimlanes[0].color,
      colorRegistry[0]
    );
    assert.strictEqual(viewModels[1].outputSwimlanes[1].id, "d");
    assert.strictEqual(
      viewModels[1].outputSwimlanes[1].color,
      colorRegistry[1]
    );
    assert.strictEqual(viewModels[2].inputSwimlanes.length, 2);
    assert.strictEqual(viewModels[2].inputSwimlanes[0].id, "b");
    assert.strictEqual(
      viewModels[2].inputSwimlanes[0].color,
      colorRegistry[0]
    );
    assert.strictEqual(viewModels[2].inputSwimlanes[1].id, "d");
    assert.strictEqual(
      viewModels[2].inputSwimlanes[1].color,
      colorRegistry[1]
    );
    assert.strictEqual(viewModels[2].outputSwimlanes.length, 2);
    assert.strictEqual(viewModels[2].outputSwimlanes[0].id, "e");
    assert.strictEqual(
      viewModels[2].outputSwimlanes[0].color,
      colorRegistry[0]
    );
    assert.strictEqual(viewModels[2].outputSwimlanes[1].id, "d");
    assert.strictEqual(
      viewModels[2].outputSwimlanes[1].color,
      colorRegistry[1]
    );
    assert.strictEqual(viewModels[3].inputSwimlanes.length, 2);
    assert.strictEqual(viewModels[3].inputSwimlanes[0].id, "e");
    assert.strictEqual(
      viewModels[3].inputSwimlanes[0].color,
      colorRegistry[0]
    );
    assert.strictEqual(viewModels[3].inputSwimlanes[1].id, "d");
    assert.strictEqual(
      viewModels[3].inputSwimlanes[1].color,
      colorRegistry[1]
    );
    assert.strictEqual(viewModels[3].outputSwimlanes.length, 2);
    assert.strictEqual(viewModels[3].outputSwimlanes[0].id, "f");
    assert.strictEqual(
      viewModels[3].outputSwimlanes[0].color,
      colorRegistry[0]
    );
    assert.strictEqual(viewModels[3].outputSwimlanes[1].id, "d");
    assert.strictEqual(
      viewModels[3].outputSwimlanes[1].color,
      colorRegistry[1]
    );
    assert.strictEqual(viewModels[4].inputSwimlanes.length, 2);
    assert.strictEqual(viewModels[4].inputSwimlanes[0].id, "f");
    assert.strictEqual(
      viewModels[4].inputSwimlanes[0].color,
      colorRegistry[0]
    );
    assert.strictEqual(viewModels[4].inputSwimlanes[1].id, "d");
    assert.strictEqual(
      viewModels[4].inputSwimlanes[1].color,
      colorRegistry[1]
    );
    assert.strictEqual(viewModels[4].outputSwimlanes.length, 2);
    assert.strictEqual(viewModels[4].outputSwimlanes[0].id, "d");
    assert.strictEqual(
      viewModels[4].outputSwimlanes[0].color,
      colorRegistry[0]
    );
    assert.strictEqual(viewModels[4].outputSwimlanes[1].id, "d");
    assert.strictEqual(
      viewModels[4].outputSwimlanes[1].color,
      colorRegistry[1]
    );
    assert.strictEqual(viewModels[5].inputSwimlanes.length, 2);
    assert.strictEqual(viewModels[5].inputSwimlanes[0].id, "d");
    assert.strictEqual(
      viewModels[5].inputSwimlanes[0].color,
      colorRegistry[0]
    );
    assert.strictEqual(viewModels[5].inputSwimlanes[1].id, "d");
    assert.strictEqual(
      viewModels[5].inputSwimlanes[1].color,
      colorRegistry[1]
    );
    assert.strictEqual(viewModels[5].outputSwimlanes.length, 1);
    assert.strictEqual(viewModels[5].outputSwimlanes[0].id, "g");
    assert.strictEqual(
      viewModels[5].outputSwimlanes[0].color,
      colorRegistry[0]
    );
  });
  test("create brach from merge commit", () => {
    const models = [
      toSCMHistoryItem("a", ["b", "c"]),
      toSCMHistoryItem("c", ["b"]),
      toSCMHistoryItem("b", ["d", "e"]),
      toSCMHistoryItem("e", ["f"]),
      toSCMHistoryItem("f", ["g"]),
      toSCMHistoryItem("d", ["h"])
    ];
    const viewModels = toISCMHistoryItemViewModelArray(models);
    assert.strictEqual(viewModels.length, 6);
    assert.strictEqual(viewModels[0].inputSwimlanes.length, 0);
    assert.strictEqual(viewModels[0].outputSwimlanes.length, 2);
    assert.strictEqual(viewModels[0].outputSwimlanes[0].id, "b");
    assert.strictEqual(
      viewModels[0].outputSwimlanes[0].color,
      colorRegistry[0]
    );
    assert.strictEqual(viewModels[0].outputSwimlanes[1].id, "c");
    assert.strictEqual(
      viewModels[0].outputSwimlanes[1].color,
      colorRegistry[1]
    );
    assert.strictEqual(viewModels[1].inputSwimlanes.length, 2);
    assert.strictEqual(viewModels[1].inputSwimlanes[0].id, "b");
    assert.strictEqual(
      viewModels[1].inputSwimlanes[0].color,
      colorRegistry[0]
    );
    assert.strictEqual(viewModels[1].inputSwimlanes[1].id, "c");
    assert.strictEqual(
      viewModels[1].inputSwimlanes[1].color,
      colorRegistry[1]
    );
    assert.strictEqual(viewModels[1].outputSwimlanes.length, 2);
    assert.strictEqual(viewModels[1].outputSwimlanes[0].id, "b");
    assert.strictEqual(
      viewModels[1].outputSwimlanes[0].color,
      colorRegistry[0]
    );
    assert.strictEqual(viewModels[1].outputSwimlanes[1].id, "b");
    assert.strictEqual(
      viewModels[1].outputSwimlanes[1].color,
      colorRegistry[1]
    );
    assert.strictEqual(viewModels[2].inputSwimlanes.length, 2);
    assert.strictEqual(viewModels[2].inputSwimlanes[0].id, "b");
    assert.strictEqual(
      viewModels[2].inputSwimlanes[0].color,
      colorRegistry[0]
    );
    assert.strictEqual(viewModels[2].inputSwimlanes[1].id, "b");
    assert.strictEqual(
      viewModels[2].inputSwimlanes[1].color,
      colorRegistry[1]
    );
    assert.strictEqual(viewModels[2].outputSwimlanes.length, 2);
    assert.strictEqual(viewModels[2].outputSwimlanes[0].id, "d");
    assert.strictEqual(
      viewModels[2].outputSwimlanes[0].color,
      colorRegistry[0]
    );
    assert.strictEqual(viewModels[2].outputSwimlanes[1].id, "e");
    assert.strictEqual(
      viewModels[2].outputSwimlanes[1].color,
      colorRegistry[2]
    );
    assert.strictEqual(viewModels[3].inputSwimlanes.length, 2);
    assert.strictEqual(viewModels[3].inputSwimlanes[0].id, "d");
    assert.strictEqual(
      viewModels[3].inputSwimlanes[0].color,
      colorRegistry[0]
    );
    assert.strictEqual(viewModels[3].inputSwimlanes[1].id, "e");
    assert.strictEqual(
      viewModels[3].inputSwimlanes[1].color,
      colorRegistry[2]
    );
    assert.strictEqual(viewModels[3].outputSwimlanes.length, 2);
    assert.strictEqual(viewModels[3].outputSwimlanes[0].id, "d");
    assert.strictEqual(
      viewModels[3].outputSwimlanes[0].color,
      colorRegistry[0]
    );
    assert.strictEqual(viewModels[3].outputSwimlanes[1].id, "f");
    assert.strictEqual(
      viewModels[3].outputSwimlanes[1].color,
      colorRegistry[2]
    );
    assert.strictEqual(viewModels[4].inputSwimlanes.length, 2);
    assert.strictEqual(viewModels[4].inputSwimlanes[0].id, "d");
    assert.strictEqual(
      viewModels[4].inputSwimlanes[0].color,
      colorRegistry[0]
    );
    assert.strictEqual(viewModels[4].inputSwimlanes[1].id, "f");
    assert.strictEqual(
      viewModels[4].inputSwimlanes[1].color,
      colorRegistry[2]
    );
    assert.strictEqual(viewModels[4].outputSwimlanes.length, 2);
    assert.strictEqual(viewModels[4].outputSwimlanes[0].id, "d");
    assert.strictEqual(
      viewModels[4].outputSwimlanes[0].color,
      colorRegistry[0]
    );
    assert.strictEqual(viewModels[4].outputSwimlanes[1].id, "g");
    assert.strictEqual(
      viewModels[4].outputSwimlanes[1].color,
      colorRegistry[2]
    );
    assert.strictEqual(viewModels[5].inputSwimlanes.length, 2);
    assert.strictEqual(viewModels[5].inputSwimlanes[0].id, "d");
    assert.strictEqual(
      viewModels[5].inputSwimlanes[0].color,
      colorRegistry[0]
    );
    assert.strictEqual(viewModels[5].inputSwimlanes[1].id, "g");
    assert.strictEqual(
      viewModels[5].inputSwimlanes[1].color,
      colorRegistry[2]
    );
    assert.strictEqual(viewModels[5].outputSwimlanes.length, 2);
    assert.strictEqual(viewModels[5].outputSwimlanes[0].id, "h");
    assert.strictEqual(
      viewModels[5].outputSwimlanes[0].color,
      colorRegistry[0]
    );
    assert.strictEqual(viewModels[5].outputSwimlanes[1].id, "g");
    assert.strictEqual(
      viewModels[5].outputSwimlanes[1].color,
      colorRegistry[2]
    );
  });
  test("create multiple branches from a commit", () => {
    const models = [
      toSCMHistoryItem("a", ["b", "c"]),
      toSCMHistoryItem("c", ["d"]),
      toSCMHistoryItem("b", ["e", "f"]),
      toSCMHistoryItem("f", ["g"]),
      toSCMHistoryItem("e", ["g"]),
      toSCMHistoryItem("d", ["g"]),
      toSCMHistoryItem("g", ["h"])
    ];
    const viewModels = toISCMHistoryItemViewModelArray(models);
    assert.strictEqual(viewModels.length, 7);
    assert.strictEqual(viewModels[0].inputSwimlanes.length, 0);
    assert.strictEqual(viewModels[0].outputSwimlanes.length, 2);
    assert.strictEqual(viewModels[0].outputSwimlanes[0].id, "b");
    assert.strictEqual(
      viewModels[0].outputSwimlanes[0].color,
      colorRegistry[0]
    );
    assert.strictEqual(viewModels[0].outputSwimlanes[1].id, "c");
    assert.strictEqual(
      viewModels[0].outputSwimlanes[1].color,
      colorRegistry[1]
    );
    assert.strictEqual(viewModels[1].inputSwimlanes.length, 2);
    assert.strictEqual(viewModels[1].inputSwimlanes[0].id, "b");
    assert.strictEqual(
      viewModels[1].inputSwimlanes[0].color,
      colorRegistry[0]
    );
    assert.strictEqual(viewModels[1].inputSwimlanes[1].id, "c");
    assert.strictEqual(
      viewModels[1].inputSwimlanes[1].color,
      colorRegistry[1]
    );
    assert.strictEqual(viewModels[1].outputSwimlanes.length, 2);
    assert.strictEqual(viewModels[1].outputSwimlanes[0].id, "b");
    assert.strictEqual(
      viewModels[1].outputSwimlanes[0].color,
      colorRegistry[0]
    );
    assert.strictEqual(viewModels[1].outputSwimlanes[1].id, "d");
    assert.strictEqual(
      viewModels[1].outputSwimlanes[1].color,
      colorRegistry[1]
    );
    assert.strictEqual(viewModels[2].inputSwimlanes.length, 2);
    assert.strictEqual(viewModels[2].inputSwimlanes[0].id, "b");
    assert.strictEqual(
      viewModels[2].inputSwimlanes[0].color,
      colorRegistry[0]
    );
    assert.strictEqual(viewModels[2].inputSwimlanes[1].id, "d");
    assert.strictEqual(
      viewModels[2].inputSwimlanes[1].color,
      colorRegistry[1]
    );
    assert.strictEqual(viewModels[2].outputSwimlanes.length, 3);
    assert.strictEqual(viewModels[2].outputSwimlanes[0].id, "e");
    assert.strictEqual(
      viewModels[2].outputSwimlanes[0].color,
      colorRegistry[0]
    );
    assert.strictEqual(viewModels[2].outputSwimlanes[1].id, "d");
    assert.strictEqual(
      viewModels[2].outputSwimlanes[1].color,
      colorRegistry[1]
    );
    assert.strictEqual(viewModels[2].outputSwimlanes[2].id, "f");
    assert.strictEqual(
      viewModels[2].outputSwimlanes[2].color,
      colorRegistry[2]
    );
    assert.strictEqual(viewModels[3].inputSwimlanes.length, 3);
    assert.strictEqual(viewModels[3].inputSwimlanes[0].id, "e");
    assert.strictEqual(
      viewModels[3].inputSwimlanes[0].color,
      colorRegistry[0]
    );
    assert.strictEqual(viewModels[3].inputSwimlanes[1].id, "d");
    assert.strictEqual(
      viewModels[3].inputSwimlanes[1].color,
      colorRegistry[1]
    );
    assert.strictEqual(viewModels[3].inputSwimlanes[2].id, "f");
    assert.strictEqual(
      viewModels[3].inputSwimlanes[2].color,
      colorRegistry[2]
    );
    assert.strictEqual(viewModels[3].outputSwimlanes.length, 3);
    assert.strictEqual(viewModels[3].outputSwimlanes[0].id, "e");
    assert.strictEqual(
      viewModels[3].outputSwimlanes[0].color,
      colorRegistry[0]
    );
    assert.strictEqual(viewModels[3].outputSwimlanes[1].id, "d");
    assert.strictEqual(
      viewModels[3].outputSwimlanes[1].color,
      colorRegistry[1]
    );
    assert.strictEqual(viewModels[3].outputSwimlanes[2].id, "g");
    assert.strictEqual(
      viewModels[3].outputSwimlanes[2].color,
      colorRegistry[2]
    );
    assert.strictEqual(viewModels[4].inputSwimlanes.length, 3);
    assert.strictEqual(viewModels[4].inputSwimlanes[0].id, "e");
    assert.strictEqual(
      viewModels[4].inputSwimlanes[0].color,
      colorRegistry[0]
    );
    assert.strictEqual(viewModels[4].inputSwimlanes[1].id, "d");
    assert.strictEqual(
      viewModels[4].inputSwimlanes[1].color,
      colorRegistry[1]
    );
    assert.strictEqual(viewModels[4].inputSwimlanes[2].id, "g");
    assert.strictEqual(
      viewModels[4].inputSwimlanes[2].color,
      colorRegistry[2]
    );
    assert.strictEqual(viewModels[4].outputSwimlanes.length, 3);
    assert.strictEqual(viewModels[4].outputSwimlanes[0].id, "g");
    assert.strictEqual(
      viewModels[4].outputSwimlanes[0].color,
      colorRegistry[0]
    );
    assert.strictEqual(viewModels[4].outputSwimlanes[1].id, "d");
    assert.strictEqual(
      viewModels[4].outputSwimlanes[1].color,
      colorRegistry[1]
    );
    assert.strictEqual(viewModels[4].outputSwimlanes[2].id, "g");
    assert.strictEqual(
      viewModels[4].outputSwimlanes[2].color,
      colorRegistry[2]
    );
    assert.strictEqual(viewModels[5].inputSwimlanes.length, 3);
    assert.strictEqual(viewModels[5].inputSwimlanes[0].id, "g");
    assert.strictEqual(
      viewModels[5].inputSwimlanes[0].color,
      colorRegistry[0]
    );
    assert.strictEqual(viewModels[5].inputSwimlanes[1].id, "d");
    assert.strictEqual(
      viewModels[5].inputSwimlanes[1].color,
      colorRegistry[1]
    );
    assert.strictEqual(viewModels[5].inputSwimlanes[2].id, "g");
    assert.strictEqual(
      viewModels[5].inputSwimlanes[2].color,
      colorRegistry[2]
    );
    assert.strictEqual(viewModels[5].outputSwimlanes.length, 3);
    assert.strictEqual(viewModels[5].outputSwimlanes[0].id, "g");
    assert.strictEqual(
      viewModels[5].outputSwimlanes[0].color,
      colorRegistry[0]
    );
    assert.strictEqual(viewModels[5].outputSwimlanes[1].id, "g");
    assert.strictEqual(
      viewModels[5].outputSwimlanes[1].color,
      colorRegistry[1]
    );
    assert.strictEqual(viewModels[5].outputSwimlanes[2].id, "g");
    assert.strictEqual(
      viewModels[5].outputSwimlanes[2].color,
      colorRegistry[2]
    );
    assert.strictEqual(viewModels[6].inputSwimlanes.length, 3);
    assert.strictEqual(viewModels[6].inputSwimlanes[0].id, "g");
    assert.strictEqual(
      viewModels[6].inputSwimlanes[0].color,
      colorRegistry[0]
    );
    assert.strictEqual(viewModels[6].inputSwimlanes[1].id, "g");
    assert.strictEqual(
      viewModels[6].inputSwimlanes[1].color,
      colorRegistry[1]
    );
    assert.strictEqual(viewModels[6].inputSwimlanes[2].id, "g");
    assert.strictEqual(
      viewModels[6].inputSwimlanes[2].color,
      colorRegistry[2]
    );
    assert.strictEqual(viewModels[6].outputSwimlanes.length, 1);
    assert.strictEqual(viewModels[6].outputSwimlanes[0].id, "h");
    assert.strictEqual(
      viewModels[6].outputSwimlanes[0].color,
      colorRegistry[0]
    );
  });
  test("graph with color map", () => {
    const models = [
      toSCMHistoryItem("a", ["b"], [{ title: "topic" }]),
      toSCMHistoryItem("b", ["c"]),
      toSCMHistoryItem("c", ["d"], [{ title: "origin/topic" }]),
      toSCMHistoryItem("d", ["e"]),
      toSCMHistoryItem("e", ["f", "g"]),
      toSCMHistoryItem("g", ["h"], [{ title: "origin/main" }])
    ];
    const colorMap = /* @__PURE__ */ new Map([
      ["topic", historyItemGroupLocal],
      ["origin/topic", historyItemGroupRemote],
      ["origin/main", historyItemGroupBase]
    ]);
    const viewModels = toISCMHistoryItemViewModelArray(models, colorMap);
    assert.strictEqual(viewModels.length, 6);
    assert.strictEqual(viewModels[0].inputSwimlanes.length, 0);
    assert.strictEqual(viewModels[0].outputSwimlanes.length, 1);
    assert.strictEqual(viewModels[0].outputSwimlanes[0].id, "b");
    assert.strictEqual(
      viewModels[0].outputSwimlanes[0].color,
      historyItemGroupLocal
    );
    assert.strictEqual(viewModels[1].inputSwimlanes.length, 1);
    assert.strictEqual(viewModels[1].inputSwimlanes[0].id, "b");
    assert.strictEqual(
      viewModels[1].inputSwimlanes[0].color,
      historyItemGroupLocal
    );
    assert.strictEqual(viewModels[1].outputSwimlanes.length, 1);
    assert.strictEqual(viewModels[1].outputSwimlanes[0].id, "c");
    assert.strictEqual(
      viewModels[1].outputSwimlanes[0].color,
      historyItemGroupLocal
    );
    assert.strictEqual(viewModels[2].inputSwimlanes.length, 1);
    assert.strictEqual(viewModels[2].inputSwimlanes[0].id, "c");
    assert.strictEqual(
      viewModels[2].inputSwimlanes[0].color,
      historyItemGroupLocal
    );
    assert.strictEqual(viewModels[2].outputSwimlanes.length, 1);
    assert.strictEqual(viewModels[2].outputSwimlanes[0].id, "d");
    assert.strictEqual(
      viewModels[2].outputSwimlanes[0].color,
      historyItemGroupRemote
    );
    assert.strictEqual(viewModels[3].inputSwimlanes.length, 1);
    assert.strictEqual(viewModels[3].inputSwimlanes[0].id, "d");
    assert.strictEqual(
      viewModels[3].inputSwimlanes[0].color,
      historyItemGroupRemote
    );
    assert.strictEqual(viewModels[3].outputSwimlanes.length, 1);
    assert.strictEqual(viewModels[3].outputSwimlanes[0].id, "e");
    assert.strictEqual(
      viewModels[3].outputSwimlanes[0].color,
      historyItemGroupRemote
    );
    assert.strictEqual(viewModels[4].inputSwimlanes.length, 1);
    assert.strictEqual(viewModels[4].inputSwimlanes[0].id, "e");
    assert.strictEqual(
      viewModels[4].inputSwimlanes[0].color,
      historyItemGroupRemote
    );
    assert.strictEqual(viewModels[4].outputSwimlanes.length, 2);
    assert.strictEqual(viewModels[4].outputSwimlanes[0].id, "f");
    assert.strictEqual(
      viewModels[4].outputSwimlanes[0].color,
      historyItemGroupRemote
    );
    assert.strictEqual(viewModels[4].outputSwimlanes[1].id, "g");
    assert.strictEqual(
      viewModels[4].outputSwimlanes[1].color,
      historyItemGroupBase
    );
    assert.strictEqual(viewModels[5].inputSwimlanes.length, 2);
    assert.strictEqual(viewModels[5].inputSwimlanes[0].id, "f");
    assert.strictEqual(
      viewModels[5].inputSwimlanes[0].color,
      historyItemGroupRemote
    );
    assert.strictEqual(viewModels[5].inputSwimlanes[1].id, "g");
    assert.strictEqual(
      viewModels[5].inputSwimlanes[1].color,
      historyItemGroupBase
    );
    assert.strictEqual(viewModels[5].outputSwimlanes.length, 2);
    assert.strictEqual(viewModels[5].outputSwimlanes[0].id, "f");
    assert.strictEqual(
      viewModels[5].outputSwimlanes[0].color,
      historyItemGroupRemote
    );
    assert.strictEqual(viewModels[5].outputSwimlanes[1].id, "h");
    assert.strictEqual(
      viewModels[5].outputSwimlanes[1].color,
      historyItemGroupBase
    );
  });
});
