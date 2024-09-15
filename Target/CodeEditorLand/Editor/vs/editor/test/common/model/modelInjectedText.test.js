var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../base/test/common/utils.js";
import { EditOperation } from "../../../common/core/editOperation.js";
import { Range } from "../../../common/core/range.js";
import { InternalModelContentChangeEvent, LineInjectedText, ModelRawChange, RawContentChangedType } from "../../../common/textModelEvents.js";
import { createTextModel } from "../testTextModel.js";
suite("Editor Model - Injected Text Events", () => {
  const store = ensureNoDisposablesAreLeakedInTestSuite();
  test("Basic", () => {
    const thisModel = store.add(createTextModel("First Line\nSecond Line"));
    const recordedChanges = new Array();
    store.add(thisModel.onDidChangeContentOrInjectedText((e) => {
      const changes = e instanceof InternalModelContentChangeEvent ? e.rawContentChangedEvent.changes : e.changes;
      for (const change of changes) {
        recordedChanges.push(mapChange(change));
      }
    }));
    let decorations = thisModel.deltaDecorations([], [{
      options: {
        after: { content: "injected1" },
        description: "test1",
        showIfCollapsed: true
      },
      range: new Range(1, 1, 1, 1)
    }]);
    assert.deepStrictEqual(recordedChanges.splice(0), [
      {
        kind: "lineChanged",
        line: "[injected1]First Line",
        lineNumber: 1
      }
    ]);
    decorations = thisModel.deltaDecorations(decorations, [{
      options: {
        after: { content: "injected1" },
        description: "test1",
        showIfCollapsed: true
      },
      range: new Range(2, 1, 2, 1)
    }, {
      options: {
        after: { content: "injected2" },
        description: "test2",
        showIfCollapsed: true
      },
      range: new Range(2, 2, 2, 2)
    }]);
    assert.deepStrictEqual(recordedChanges.splice(0), [
      {
        kind: "lineChanged",
        line: "First Line",
        lineNumber: 1
      },
      {
        kind: "lineChanged",
        line: "[injected1]S[injected2]econd Line",
        lineNumber: 2
      }
    ]);
    thisModel.applyEdits([EditOperation.replace(new Range(2, 2, 2, 2), "Hello")]);
    assert.deepStrictEqual(recordedChanges.splice(0), [
      {
        kind: "lineChanged",
        line: "[injected1]SHello[injected2]econd Line",
        lineNumber: 2
      }
    ]);
    thisModel.pushEditOperations(null, [EditOperation.replace(new Range(2, 2, 2, 2), "\n\n\n")], null);
    assert.deepStrictEqual(thisModel.getAllDecorations(void 0).map((d) => ({ description: d.options.description, range: d.range.toString() })), [
      {
        "description": "test1",
        "range": "[2,1 -> 2,1]"
      },
      {
        "description": "test2",
        "range": "[2,2 -> 5,6]"
      }
    ]);
    assert.deepStrictEqual(recordedChanges.splice(0), [
      {
        kind: "lineChanged",
        line: "[injected1]S",
        lineNumber: 2
      },
      {
        fromLineNumber: 3,
        kind: "linesInserted",
        lines: [
          "",
          "",
          "Hello[injected2]econd Line"
        ]
      }
    ]);
    thisModel.pushEditOperations(null, [EditOperation.replace(new Range(3, 1, 5, 1), "\n\n\n\n\n\n\n\n\n\n\n\n\n")], null);
    assert.deepStrictEqual(recordedChanges.splice(0), [
      {
        "kind": "lineChanged",
        "line": "",
        "lineNumber": 5
      },
      {
        "kind": "lineChanged",
        "line": "",
        "lineNumber": 4
      },
      {
        "kind": "lineChanged",
        "line": "",
        "lineNumber": 3
      },
      {
        "fromLineNumber": 6,
        "kind": "linesInserted",
        "lines": [
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "Hello[injected2]econd Line"
        ]
      }
    ]);
    assert.strictEqual(thisModel.undo(), void 0);
    assert.deepStrictEqual(recordedChanges.splice(0), [
      {
        kind: "lineChanged",
        line: "[injected1]SHello[injected2]econd Line",
        lineNumber: 2
      },
      {
        kind: "linesDeleted"
      }
    ]);
  });
});
function mapChange(change) {
  if (change.changeType === RawContentChangedType.LineChanged) {
    (change.injectedText || []).every((e) => {
      assert.deepStrictEqual(e.lineNumber, change.lineNumber);
    });
    return {
      kind: "lineChanged",
      line: getDetail(change.detail, change.injectedText),
      lineNumber: change.lineNumber
    };
  } else if (change.changeType === RawContentChangedType.LinesInserted) {
    return {
      kind: "linesInserted",
      lines: change.detail.map((e, idx) => getDetail(e, change.injectedTexts[idx])),
      fromLineNumber: change.fromLineNumber
    };
  } else if (change.changeType === RawContentChangedType.LinesDeleted) {
    return {
      kind: "linesDeleted"
    };
  } else if (change.changeType === RawContentChangedType.EOLChanged) {
    return {
      kind: "eolChanged"
    };
  } else if (change.changeType === RawContentChangedType.Flush) {
    return {
      kind: "flush"
    };
  }
  return { kind: "unknown" };
}
__name(mapChange, "mapChange");
function getDetail(line, injectedTexts) {
  return LineInjectedText.applyInjectedText(line, (injectedTexts || []).map((t) => t.withText(`[${t.options.content}]`)));
}
__name(getDetail, "getDetail");
//# sourceMappingURL=modelInjectedText.test.js.map
