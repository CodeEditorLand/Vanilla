import assert from "assert";
import { CancellationToken } from "../../../../../../base/common/cancellation.js";
import { mock } from "../../../../../../base/test/common/mock.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../../base/test/common/utils.js";
import { NotebookOutlineEntryFactory } from "../../../browser/viewModel/notebookOutlineEntryFactory.js";
suite("Notebook Symbols", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  const symbolsPerTextModel = {};
  function setSymbolsForTextModel(symbols, textmodelId = "textId") {
    symbolsPerTextModel[textmodelId] = symbols;
  }
  const executionService = new class extends mock() {
    getCellExecution() {
      return void 0;
    }
  }();
  class OutlineModelStub {
    constructor(textId) {
      this.textId = textId;
    }
    getTopLevelSymbols() {
      return symbolsPerTextModel[this.textId];
    }
  }
  const outlineModelService = new class extends mock() {
    getOrCreate(model, arg1) {
      const outline = new OutlineModelStub(
        model.id
      );
      return Promise.resolve(outline);
    }
    getDebounceValue(arg0) {
      return 0;
    }
  }();
  function createCellViewModel(version = 1, textmodelId = "textId") {
    return {
      textBuffer: {
        getLineCount() {
          return 0;
        }
      },
      getText() {
        return "# code";
      },
      model: {
        textModel: {
          id: textmodelId,
          getVersionId() {
            return version;
          }
        }
      },
      resolveTextModel() {
        return this.model.textModel;
      }
    };
  }
  test("Cell without symbols cache", () => {
    setSymbolsForTextModel([{ name: "var", range: {} }]);
    const entryFactory = new NotebookOutlineEntryFactory(executionService);
    const entries = entryFactory.getOutlineEntries(
      createCellViewModel(),
      0
    );
    assert.equal(entries.length, 1, "no entries created");
    assert.equal(
      entries[0].label,
      "# code",
      "entry should fall back to first line of cell"
    );
  });
  test("Cell with simple symbols", async () => {
    setSymbolsForTextModel([
      { name: "var1", range: {} },
      { name: "var2", range: {} }
    ]);
    const entryFactory = new NotebookOutlineEntryFactory(executionService);
    const cell = createCellViewModel();
    await entryFactory.cacheSymbols(
      cell,
      outlineModelService,
      CancellationToken.None
    );
    const entries = entryFactory.getOutlineEntries(cell, 0);
    assert.equal(entries.length, 3, "wrong number of outline entries");
    assert.equal(entries[0].label, "# code");
    assert.equal(entries[1].label, "var1");
    assert.equal(entries[1].level, 8);
    assert.equal(entries[1].index, 1);
    assert.equal(entries[2].label, "var2");
    assert.equal(entries[2].level, 8);
    assert.equal(entries[2].index, 2);
  });
  test("Cell with nested symbols", async () => {
    setSymbolsForTextModel([
      {
        name: "root1",
        range: {},
        children: [
          { name: "nested1", range: {} },
          { name: "nested2", range: {} }
        ]
      },
      {
        name: "root2",
        range: {},
        children: [{ name: "nested1", range: {} }]
      }
    ]);
    const entryFactory = new NotebookOutlineEntryFactory(executionService);
    const cell = createCellViewModel();
    await entryFactory.cacheSymbols(
      cell,
      outlineModelService,
      CancellationToken.None
    );
    const entries = entryFactory.getOutlineEntries(
      createCellViewModel(),
      0
    );
    assert.equal(entries.length, 6, "wrong number of outline entries");
    assert.equal(entries[0].label, "# code");
    assert.equal(entries[1].label, "root1");
    assert.equal(entries[1].level, 8);
    assert.equal(entries[2].label, "nested1");
    assert.equal(entries[2].level, 9);
    assert.equal(entries[3].label, "nested2");
    assert.equal(entries[3].level, 9);
    assert.equal(entries[4].label, "root2");
    assert.equal(entries[4].level, 8);
    assert.equal(entries[5].label, "nested1");
    assert.equal(entries[5].level, 9);
  });
  test("Multiple Cells with symbols", async () => {
    setSymbolsForTextModel([{ name: "var1", range: {} }], "$1");
    setSymbolsForTextModel([{ name: "var2", range: {} }], "$2");
    const entryFactory = new NotebookOutlineEntryFactory(executionService);
    const cell1 = createCellViewModel(1, "$1");
    const cell2 = createCellViewModel(1, "$2");
    await entryFactory.cacheSymbols(
      cell1,
      outlineModelService,
      CancellationToken.None
    );
    await entryFactory.cacheSymbols(
      cell2,
      outlineModelService,
      CancellationToken.None
    );
    const entries1 = entryFactory.getOutlineEntries(
      createCellViewModel(1, "$1"),
      0
    );
    const entries2 = entryFactory.getOutlineEntries(
      createCellViewModel(1, "$2"),
      0
    );
    assert.equal(entries1.length, 2, "wrong number of outline entries");
    assert.equal(entries1[0].label, "# code");
    assert.equal(entries1[1].label, "var1");
    assert.equal(entries2.length, 2, "wrong number of outline entries");
    assert.equal(entries2[0].label, "# code");
    assert.equal(entries2[1].label, "var2");
  });
});
