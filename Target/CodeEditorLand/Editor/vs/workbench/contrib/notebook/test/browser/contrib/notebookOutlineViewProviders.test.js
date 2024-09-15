var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { IDataSource } from "../../../../../../base/browser/ui/tree/tree.js";
import { CancellationToken } from "../../../../../../base/common/cancellation.js";
import { IReference } from "../../../../../../base/common/lifecycle.js";
import { mock } from "../../../../../../base/test/common/mock.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../../base/test/common/utils.js";
import { ITextModel } from "../../../../../../editor/common/model.js";
import { IOutlineModelService, OutlineModel } from "../../../../../../editor/contrib/documentSymbols/browser/outlineModel.js";
import { TestConfigurationService } from "../../../../../../platform/configuration/test/common/testConfigurationService.js";
import { TestThemeService } from "../../../../../../platform/theme/test/common/testThemeService.js";
import { NotebookBreadcrumbsProvider, NotebookCellOutline, NotebookOutlinePaneProvider, NotebookQuickPickProvider } from "../../../browser/contrib/outline/notebookOutline.js";
import { ICellViewModel } from "../../../browser/notebookBrowser.js";
import { INotebookCellOutlineDataSource } from "../../../browser/viewModel/notebookOutlineDataSource.js";
import { NotebookOutlineEntryFactory } from "../../../browser/viewModel/notebookOutlineEntryFactory.js";
import { OutlineEntry } from "../../../browser/viewModel/OutlineEntry.js";
import { INotebookExecutionStateService } from "../../../common/notebookExecutionStateService.js";
import { MockDocumentSymbol } from "../testNotebookEditor.js";
import { IResolvedTextEditorModel, ITextModelService } from "../../../../../../editor/common/services/resolverService.js";
import { URI } from "../../../../../../base/common/uri.js";
suite("Notebook Outline View Providers", function() {
  const store = ensureNoDisposablesAreLeakedInTestSuite();
  const configurationService = new TestConfigurationService();
  const themeService = new TestThemeService();
  const symbolsPerTextModel = {};
  function setSymbolsForTextModel(symbols, textmodelId = "textId") {
    symbolsPerTextModel[textmodelId] = symbols;
  }
  __name(setSymbolsForTextModel, "setSymbolsForTextModel");
  const executionService = new class extends mock() {
    getCellExecution() {
      return void 0;
    }
  }();
  class OutlineModelStub {
    constructor(textId) {
      this.textId = textId;
    }
    static {
      __name(this, "OutlineModelStub");
    }
    getTopLevelSymbols() {
      return symbolsPerTextModel[this.textId];
    }
  }
  const outlineModelService = new class extends mock() {
    getOrCreate(model, arg1) {
      const outline = new OutlineModelStub(model.id);
      return Promise.resolve(outline);
    }
    getDebounceValue(arg0) {
      return 0;
    }
  }();
  const textModelService = new class extends mock() {
    createModelReference(uri) {
      return Promise.resolve({
        object: {
          textEditorModel: {
            id: uri.toString(),
            getVersionId() {
              return 1;
            }
          }
        },
        dispose() {
        }
      });
    }
  }();
  function createCodeCellViewModel(version = 1, source = "# code", textmodelId = "textId") {
    return {
      uri: { toString() {
        return textmodelId;
      } },
      id: textmodelId,
      textBuffer: {
        getLineCount() {
          return 0;
        }
      },
      getText() {
        return source;
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
      },
      cellKind: 2
    };
  }
  __name(createCodeCellViewModel, "createCodeCellViewModel");
  function createMockOutlineDataSource(entries, activeElement = void 0) {
    return new class extends mock() {
      object = {
        entries,
        activeElement
      };
    }();
  }
  __name(createMockOutlineDataSource, "createMockOutlineDataSource");
  function createMarkupCellViewModel(version = 1, source = "markup", textmodelId = "textId", alternativeId = 1) {
    return {
      textBuffer: {
        getLineCount() {
          return 0;
        }
      },
      getText() {
        return source;
      },
      getAlternativeId() {
        return alternativeId;
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
      },
      cellKind: 1
    };
  }
  __name(createMarkupCellViewModel, "createMarkupCellViewModel");
  function flatten(element, dataSource) {
    const elements = [];
    const children = dataSource.getChildren(element);
    for (const child of children) {
      elements.push(child);
      elements.push(...flatten(child, dataSource));
    }
    return elements;
  }
  __name(flatten, "flatten");
  function buildOutlineTree(entries) {
    if (entries.length > 0) {
      const result = [entries[0]];
      const parentStack = [entries[0]];
      for (let i = 1; i < entries.length; i++) {
        const entry = entries[i];
        while (true) {
          const len = parentStack.length;
          if (len === 0) {
            result.push(entry);
            parentStack.push(entry);
            break;
          } else {
            const parentCandidate = parentStack[len - 1];
            if (parentCandidate.level < entry.level) {
              parentCandidate.addChild(entry);
              parentStack.push(entry);
              break;
            } else {
              parentStack.pop();
            }
          }
        }
      }
      return result;
    }
    return void 0;
  }
  __name(buildOutlineTree, "buildOutlineTree");
  async function setOutlineViewConfiguration(config) {
    await configurationService.setUserConfiguration("notebook.outline.showMarkdownHeadersOnly", config.outlineShowMarkdownHeadersOnly);
    await configurationService.setUserConfiguration("notebook.outline.showCodeCells", config.outlineShowCodeCells);
    await configurationService.setUserConfiguration("notebook.outline.showCodeCellSymbols", config.outlineShowCodeCellSymbols);
    await configurationService.setUserConfiguration("notebook.gotoSymbols.showAllSymbols", config.quickPickShowAllSymbols);
    await configurationService.setUserConfiguration("notebook.breadcrumbs.showCodeCells", config.breadcrumbsShowCodeCells);
  }
  __name(setOutlineViewConfiguration, "setOutlineViewConfiguration");
  test("OutlinePane 0: Default Settings (Headers Only ON, Code cells OFF, Symbols ON)", async function() {
    await setOutlineViewConfiguration({
      outlineShowMarkdownHeadersOnly: true,
      outlineShowCodeCells: false,
      outlineShowCodeCellSymbols: true,
      quickPickShowAllSymbols: false,
      breadcrumbsShowCodeCells: false
    });
    const cells = [
      createMarkupCellViewModel(1, "# h1", "$0", 0),
      createMarkupCellViewModel(1, "plaintext", "$1", 0),
      createCodeCellViewModel(1, "# code cell 2", "$2"),
      createCodeCellViewModel(1, "# code cell 3", "$3")
    ];
    setSymbolsForTextModel([], "$0");
    setSymbolsForTextModel([], "$1");
    setSymbolsForTextModel([{ name: "var2", range: {} }], "$2");
    setSymbolsForTextModel([{ name: "var3", range: {} }], "$3");
    const entryFactory = new NotebookOutlineEntryFactory(executionService, outlineModelService, textModelService);
    for (const cell of cells) {
      await entryFactory.cacheSymbols(cell, CancellationToken.None);
    }
    const outlineModel = new OutlineEntry(-1, -1, createCodeCellViewModel(), "fakeRoot", false, false, void 0, void 0);
    for (const cell of cells) {
      entryFactory.getOutlineEntries(cell, 0).forEach((entry) => outlineModel.addChild(entry));
    }
    const outlinePaneProvider = store.add(new NotebookOutlinePaneProvider(void 0, configurationService));
    const results = flatten(outlineModel, outlinePaneProvider);
    assert.equal(results.length, 1);
    assert.equal(results[0].label, "h1");
    assert.equal(results[0].level, 1);
  });
  test("OutlinePane 1: ALL Markdown", async function() {
    await setOutlineViewConfiguration({
      outlineShowMarkdownHeadersOnly: false,
      outlineShowCodeCells: false,
      outlineShowCodeCellSymbols: false,
      quickPickShowAllSymbols: false,
      breadcrumbsShowCodeCells: false
    });
    const cells = [
      createMarkupCellViewModel(1, "# h1", "$0", 0),
      createMarkupCellViewModel(1, "plaintext", "$1", 0),
      createCodeCellViewModel(1, "# code cell 2", "$2"),
      createCodeCellViewModel(1, "# code cell 3", "$3")
    ];
    setSymbolsForTextModel([], "$0");
    setSymbolsForTextModel([], "$1");
    setSymbolsForTextModel([{ name: "var2", range: {} }], "$2");
    setSymbolsForTextModel([{ name: "var3", range: {} }], "$3");
    const entryFactory = new NotebookOutlineEntryFactory(executionService, outlineModelService, textModelService);
    for (const cell of cells) {
      await entryFactory.cacheSymbols(cell, CancellationToken.None);
    }
    const outlineModel = new OutlineEntry(-1, -1, createCodeCellViewModel(), "fakeRoot", false, false, void 0, void 0);
    for (const cell of cells) {
      entryFactory.getOutlineEntries(cell, 0).forEach((entry) => outlineModel.addChild(entry));
    }
    const outlinePaneProvider = store.add(new NotebookOutlinePaneProvider(void 0, configurationService));
    const results = flatten(outlineModel, outlinePaneProvider);
    assert.equal(results.length, 2);
    assert.equal(results[0].label, "h1");
    assert.equal(results[0].level, 1);
    assert.equal(results[1].label, "plaintext");
    assert.equal(results[1].level, 7);
  });
  test("OutlinePane 2: Only Headers", async function() {
    await setOutlineViewConfiguration({
      outlineShowMarkdownHeadersOnly: true,
      outlineShowCodeCells: false,
      outlineShowCodeCellSymbols: false,
      quickPickShowAllSymbols: false,
      breadcrumbsShowCodeCells: false
    });
    const cells = [
      createMarkupCellViewModel(1, "# h1", "$0", 0),
      createMarkupCellViewModel(1, "plaintext", "$1", 0),
      createCodeCellViewModel(1, "# code cell 2", "$2"),
      createCodeCellViewModel(1, "# code cell 3", "$3")
    ];
    setSymbolsForTextModel([], "$0");
    setSymbolsForTextModel([], "$1");
    setSymbolsForTextModel([{ name: "var2", range: {} }], "$2");
    setSymbolsForTextModel([{ name: "var3", range: {} }], "$3");
    const entryFactory = new NotebookOutlineEntryFactory(executionService, outlineModelService, textModelService);
    for (const cell of cells) {
      await entryFactory.cacheSymbols(cell, CancellationToken.None);
    }
    const outlineModel = new OutlineEntry(-1, -1, createCodeCellViewModel(), "fakeRoot", false, false, void 0, void 0);
    for (const cell of cells) {
      entryFactory.getOutlineEntries(cell, 0).forEach((entry) => outlineModel.addChild(entry));
    }
    const outlinePaneProvider = store.add(new NotebookOutlinePaneProvider(void 0, configurationService));
    const results = flatten(outlineModel, outlinePaneProvider);
    assert.equal(results.length, 1);
    assert.equal(results[0].label, "h1");
    assert.equal(results[0].level, 1);
  });
  test("OutlinePane 3: Only Headers + Code Cells", async function() {
    await setOutlineViewConfiguration({
      outlineShowMarkdownHeadersOnly: true,
      outlineShowCodeCells: true,
      outlineShowCodeCellSymbols: false,
      quickPickShowAllSymbols: false,
      breadcrumbsShowCodeCells: false
    });
    const cells = [
      createMarkupCellViewModel(1, "# h1", "$0", 0),
      createMarkupCellViewModel(1, "plaintext", "$1", 0),
      createCodeCellViewModel(1, "# code cell 2", "$2"),
      createCodeCellViewModel(1, "# code cell 3", "$3")
    ];
    setSymbolsForTextModel([], "$0");
    setSymbolsForTextModel([], "$1");
    setSymbolsForTextModel([{ name: "var2", range: {} }], "$2");
    setSymbolsForTextModel([{ name: "var3", range: {} }], "$3");
    const entryFactory = new NotebookOutlineEntryFactory(executionService, outlineModelService, textModelService);
    for (const cell of cells) {
      await entryFactory.cacheSymbols(cell, CancellationToken.None);
    }
    const outlineModel = new OutlineEntry(-1, -1, createCodeCellViewModel(), "fakeRoot", false, false, void 0, void 0);
    for (const cell of cells) {
      entryFactory.getOutlineEntries(cell, 0).forEach((entry) => outlineModel.addChild(entry));
    }
    const outlinePaneProvider = store.add(new NotebookOutlinePaneProvider(void 0, configurationService));
    const results = flatten(outlineModel, outlinePaneProvider);
    assert.equal(results.length, 3);
    assert.equal(results[0].label, "h1");
    assert.equal(results[0].level, 1);
    assert.equal(results[1].label, "# code cell 2");
    assert.equal(results[1].level, 7);
    assert.equal(results[2].label, "# code cell 3");
    assert.equal(results[2].level, 7);
  });
  test("OutlinePane 4: Only Headers + Code Cells + Symbols", async function() {
    await setOutlineViewConfiguration({
      outlineShowMarkdownHeadersOnly: true,
      outlineShowCodeCells: true,
      outlineShowCodeCellSymbols: true,
      quickPickShowAllSymbols: false,
      breadcrumbsShowCodeCells: false
    });
    const cells = [
      createMarkupCellViewModel(1, "# h1", "$0", 0),
      createMarkupCellViewModel(1, "plaintext", "$1", 0),
      createCodeCellViewModel(1, "# code cell 2", "$2"),
      createCodeCellViewModel(1, "# code cell 3", "$3")
    ];
    setSymbolsForTextModel([], "$0");
    setSymbolsForTextModel([], "$1");
    setSymbolsForTextModel([{ name: "var2", range: {} }], "$2");
    setSymbolsForTextModel([{ name: "var3", range: {} }], "$3");
    const entryFactory = new NotebookOutlineEntryFactory(executionService, outlineModelService, textModelService);
    for (const cell of cells) {
      await entryFactory.cacheSymbols(cell, CancellationToken.None);
    }
    const outlineModel = new OutlineEntry(-1, -1, createCodeCellViewModel(), "fakeRoot", false, false, void 0, void 0);
    for (const cell of cells) {
      entryFactory.getOutlineEntries(cell, 0).forEach((entry) => outlineModel.addChild(entry));
    }
    const outlinePaneProvider = store.add(new NotebookOutlinePaneProvider(void 0, configurationService));
    const results = flatten(outlineModel, outlinePaneProvider);
    assert.equal(results.length, 5);
    assert.equal(results[0].label, "h1");
    assert.equal(results[0].level, 1);
    assert.equal(results[1].label, "# code cell 2");
    assert.equal(results[1].level, 7);
    assert.equal(results[2].label, "var2");
    assert.equal(results[2].level, 8);
    assert.equal(results[3].label, "# code cell 3");
    assert.equal(results[3].level, 7);
    assert.equal(results[4].label, "var3");
    assert.equal(results[4].level, 8);
  });
  test("QuickPick 0: Symbols On + 2 cells WITH symbols", async function() {
    await setOutlineViewConfiguration({
      outlineShowMarkdownHeadersOnly: false,
      outlineShowCodeCells: false,
      outlineShowCodeCellSymbols: false,
      quickPickShowAllSymbols: true,
      breadcrumbsShowCodeCells: false
    });
    const cells = [
      createMarkupCellViewModel(1, "# h1", "$0", 0),
      createMarkupCellViewModel(1, "plaintext", "$1", 0),
      createCodeCellViewModel(1, "# code cell 2", "$2"),
      createCodeCellViewModel(1, "# code cell 3", "$3")
    ];
    setSymbolsForTextModel([], "$0");
    setSymbolsForTextModel([], "$1");
    setSymbolsForTextModel([{ name: "var2", range: {}, kind: 12 }], "$2");
    setSymbolsForTextModel([{ name: "var3", range: {}, kind: 12 }], "$3");
    const entryFactory = new NotebookOutlineEntryFactory(executionService, outlineModelService, textModelService);
    for (const cell of cells) {
      await entryFactory.cacheSymbols(cell, CancellationToken.None);
    }
    const outlineModel = new OutlineEntry(-1, -1, createCodeCellViewModel(), "fakeRoot", false, false, void 0, void 0);
    for (const cell of cells) {
      entryFactory.getOutlineEntries(cell, 0).forEach((entry) => outlineModel.addChild(entry));
    }
    const quickPickProvider = store.add(new NotebookQuickPickProvider(createMockOutlineDataSource([...outlineModel.children]), configurationService, themeService));
    const results = quickPickProvider.getQuickPickElements();
    assert.equal(results.length, 4);
    assert.equal(results[0].label, "$(markdown) h1");
    assert.equal(results[0].element.level, 1);
    assert.equal(results[1].label, "$(markdown) plaintext");
    assert.equal(results[1].element.level, 7);
    assert.equal(results[2].label, "$(symbol-variable) var2");
    assert.equal(results[2].element.level, 8);
    assert.equal(results[3].label, "$(symbol-variable) var3");
    assert.equal(results[3].element.level, 8);
  });
  test("QuickPick 1: Symbols On + 1 cell WITH symbol + 1 cell WITHOUT symbol", async function() {
    await setOutlineViewConfiguration({
      outlineShowMarkdownHeadersOnly: false,
      outlineShowCodeCells: false,
      outlineShowCodeCellSymbols: false,
      quickPickShowAllSymbols: true,
      breadcrumbsShowCodeCells: false
    });
    const cells = [
      createMarkupCellViewModel(1, "# h1", "$0", 0),
      createMarkupCellViewModel(1, "plaintext", "$1", 0),
      createCodeCellViewModel(1, "# code cell 2", "$2"),
      createCodeCellViewModel(1, "# code cell 3", "$3")
    ];
    setSymbolsForTextModel([], "$0");
    setSymbolsForTextModel([], "$1");
    setSymbolsForTextModel([], "$2");
    setSymbolsForTextModel([{ name: "var3", range: {}, kind: 12 }], "$3");
    const entryFactory = new NotebookOutlineEntryFactory(executionService, outlineModelService, textModelService);
    for (const cell of cells) {
      await entryFactory.cacheSymbols(cell, CancellationToken.None);
    }
    const outlineModel = new OutlineEntry(-1, -1, createCodeCellViewModel(), "fakeRoot", false, false, void 0, void 0);
    for (const cell of cells) {
      entryFactory.getOutlineEntries(cell, 0).forEach((entry) => outlineModel.addChild(entry));
    }
    const quickPickProvider = store.add(new NotebookQuickPickProvider(createMockOutlineDataSource([...outlineModel.children]), configurationService, themeService));
    const results = quickPickProvider.getQuickPickElements();
    assert.equal(results.length, 4);
    assert.equal(results[0].label, "$(markdown) h1");
    assert.equal(results[0].element.level, 1);
    assert.equal(results[1].label, "$(markdown) plaintext");
    assert.equal(results[1].element.level, 7);
    assert.equal(results[2].label, "$(code) # code cell 2");
    assert.equal(results[2].element.level, 7);
    assert.equal(results[3].label, "$(symbol-variable) var3");
    assert.equal(results[3].element.level, 8);
  });
  test("QuickPick 3: Symbols Off", async function() {
    await setOutlineViewConfiguration({
      outlineShowMarkdownHeadersOnly: false,
      outlineShowCodeCells: false,
      outlineShowCodeCellSymbols: false,
      quickPickShowAllSymbols: false,
      breadcrumbsShowCodeCells: false
    });
    const cells = [
      createMarkupCellViewModel(1, "# h1", "$0", 0),
      createMarkupCellViewModel(1, "plaintext", "$1", 0),
      createCodeCellViewModel(1, "# code cell 2", "$2"),
      createCodeCellViewModel(1, "# code cell 3", "$3")
    ];
    setSymbolsForTextModel([], "$0");
    setSymbolsForTextModel([], "$1");
    setSymbolsForTextModel([{ name: "var2", range: {}, kind: 12 }], "$2");
    setSymbolsForTextModel([{ name: "var3", range: {}, kind: 12 }], "$3");
    const entryFactory = new NotebookOutlineEntryFactory(executionService, outlineModelService, textModelService);
    for (const cell of cells) {
      await entryFactory.cacheSymbols(cell, CancellationToken.None);
    }
    const outlineModel = new OutlineEntry(-1, -1, createCodeCellViewModel(), "fakeRoot", false, false, void 0, void 0);
    for (const cell of cells) {
      entryFactory.getOutlineEntries(cell, 0).forEach((entry) => outlineModel.addChild(entry));
    }
    const quickPickProvider = store.add(new NotebookQuickPickProvider(createMockOutlineDataSource([...outlineModel.children]), configurationService, themeService));
    const results = quickPickProvider.getQuickPickElements();
    assert.equal(results.length, 4);
    assert.equal(results[0].label, "$(markdown) h1");
    assert.equal(results[0].element.level, 1);
    assert.equal(results[1].label, "$(markdown) plaintext");
    assert.equal(results[1].element.level, 7);
    assert.equal(results[2].label, "$(code) # code cell 2");
    assert.equal(results[2].element.level, 7);
    assert.equal(results[3].label, "$(code) # code cell 3");
    assert.equal(results[3].element.level, 7);
  });
  test("Breadcrumbs 0: Code Cells On ", async function() {
    await setOutlineViewConfiguration({
      outlineShowMarkdownHeadersOnly: false,
      outlineShowCodeCells: false,
      outlineShowCodeCellSymbols: false,
      quickPickShowAllSymbols: false,
      breadcrumbsShowCodeCells: true
    });
    const cells = [
      createMarkupCellViewModel(1, "# h1", "$0", 0),
      createMarkupCellViewModel(1, "plaintext", "$1", 0),
      createCodeCellViewModel(1, "# code cell 2", "$2"),
      createCodeCellViewModel(1, "# code cell 3", "$3")
    ];
    setSymbolsForTextModel([], "$0");
    setSymbolsForTextModel([], "$1");
    setSymbolsForTextModel([{ name: "var2", range: {}, kind: 12 }], "$2");
    setSymbolsForTextModel([{ name: "var3", range: {}, kind: 12 }], "$3");
    const entryFactory = new NotebookOutlineEntryFactory(executionService, outlineModelService, textModelService);
    for (const cell of cells) {
      await entryFactory.cacheSymbols(cell, CancellationToken.None);
    }
    const outlineModel = new OutlineEntry(-1, -1, createMarkupCellViewModel(), "fakeRoot", false, false, void 0, void 0);
    for (const cell of cells) {
      entryFactory.getOutlineEntries(cell, 0).forEach((entry) => outlineModel.addChild(entry));
    }
    const outlineTree = buildOutlineTree([...outlineModel.children]);
    const breadcrumbsProvider = store.add(new NotebookBreadcrumbsProvider(createMockOutlineDataSource([], [...outlineTree[0].children][1]), configurationService));
    const results = breadcrumbsProvider.getBreadcrumbElements();
    assert.equal(results.length, 3);
    assert.equal(results[0].label, "fakeRoot");
    assert.equal(results[0].level, -1);
    assert.equal(results[1].label, "h1");
    assert.equal(results[1].level, 1);
    assert.equal(results[2].label, "# code cell 2");
    assert.equal(results[2].level, 7);
  });
  test("Breadcrumbs 1: Code Cells Off ", async function() {
    await setOutlineViewConfiguration({
      outlineShowMarkdownHeadersOnly: false,
      outlineShowCodeCells: false,
      outlineShowCodeCellSymbols: false,
      quickPickShowAllSymbols: false,
      breadcrumbsShowCodeCells: false
    });
    const cells = [
      createMarkupCellViewModel(1, "# h1", "$0", 0),
      createMarkupCellViewModel(1, "plaintext", "$1", 0),
      createCodeCellViewModel(1, "# code cell 2", "$2"),
      createCodeCellViewModel(1, "# code cell 3", "$3")
    ];
    setSymbolsForTextModel([], "$0");
    setSymbolsForTextModel([], "$1");
    setSymbolsForTextModel([{ name: "var2", range: {}, kind: 12 }], "$2");
    setSymbolsForTextModel([{ name: "var3", range: {}, kind: 12 }], "$3");
    const entryFactory = new NotebookOutlineEntryFactory(executionService, outlineModelService, textModelService);
    for (const cell of cells) {
      await entryFactory.cacheSymbols(cell, CancellationToken.None);
    }
    const outlineModel = new OutlineEntry(-1, -1, createMarkupCellViewModel(), "fakeRoot", false, false, void 0, void 0);
    for (const cell of cells) {
      entryFactory.getOutlineEntries(cell, 0).forEach((entry) => outlineModel.addChild(entry));
    }
    const outlineTree = buildOutlineTree([...outlineModel.children]);
    const breadcrumbsProvider = store.add(new NotebookBreadcrumbsProvider(createMockOutlineDataSource([], [...outlineTree[0].children][1]), configurationService));
    const results = breadcrumbsProvider.getBreadcrumbElements();
    assert.equal(results.length, 2);
    assert.equal(results[0].label, "fakeRoot");
    assert.equal(results[0].level, -1);
    assert.equal(results[1].label, "h1");
    assert.equal(results[1].level, 1);
  });
});
//# sourceMappingURL=notebookOutlineViewProviders.test.js.map
