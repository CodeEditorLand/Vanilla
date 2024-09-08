import assert from "assert";
import {
  AsyncIterableObject,
  DeferredPromise
} from "../../../../../base/common/async.js";
import { Event } from "../../../../../base/common/event.js";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import { URI } from "../../../../../base/common/uri.js";
import { mock } from "../../../../../base/test/common/mock.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { PLAINTEXT_LANGUAGE_ID } from "../../../../../editor/common/languages/modesRegistry.js";
import {
  IMenuService
} from "../../../../../platform/actions/common/actions.js";
import { ExtensionIdentifier } from "../../../../../platform/extensions/common/extensions.js";
import { insertCellAtIndex } from "../../browser/controller/cellOperations.js";
import { NotebookExecutionService } from "../../browser/services/notebookExecutionServiceImpl.js";
import { NotebookExecutionStateService } from "../../browser/services/notebookExecutionStateServiceImpl.js";
import { NotebookKernelService } from "../../browser/services/notebookKernelServiceImpl.js";
import {
  CellEditType,
  CellKind,
  CellUri,
  NotebookExecutionState
} from "../../common/notebookCommon.js";
import {
  CellExecutionUpdateType,
  INotebookExecutionService
} from "../../common/notebookExecutionService.js";
import {
  INotebookExecutionStateService,
  NotebookExecutionType
} from "../../common/notebookExecutionStateService.js";
import {
  INotebookKernelService
} from "../../common/notebookKernelService.js";
import { INotebookLoggingService } from "../../common/notebookLoggingService.js";
import { INotebookService } from "../../common/notebookService.js";
import {
  withTestNotebook as _withTestNotebook,
  setupInstantiationService
} from "./testNotebookEditor.js";
suite("NotebookExecutionStateService", () => {
  let instantiationService;
  let kernelService;
  let disposables;
  let testNotebookModel;
  teardown(() => {
    disposables.dispose();
  });
  ensureNoDisposablesAreLeakedInTestSuite();
  setup(() => {
    disposables = new DisposableStore();
    instantiationService = setupInstantiationService(disposables);
    instantiationService.stub(
      INotebookService,
      new class extends mock() {
        onDidAddNotebookDocument = Event.None;
        onWillRemoveNotebookDocument = Event.None;
        getNotebookTextModels() {
          return [];
        }
        getNotebookTextModel(uri) {
          return testNotebookModel;
        }
      }()
    );
    instantiationService.stub(
      IMenuService,
      new class extends mock() {
        createMenu() {
          return new class extends mock() {
            onDidChange = Event.None;
            getActions() {
              return [];
            }
            dispose() {
            }
          }();
        }
      }()
    );
    instantiationService.stub(
      INotebookLoggingService,
      new class extends mock() {
        debug(category, output) {
        }
      }()
    );
    kernelService = disposables.add(
      instantiationService.createInstance(NotebookKernelService)
    );
    instantiationService.set(INotebookKernelService, kernelService);
    instantiationService.set(
      INotebookExecutionService,
      disposables.add(
        instantiationService.createInstance(NotebookExecutionService)
      )
    );
    instantiationService.set(
      INotebookExecutionStateService,
      disposables.add(
        instantiationService.createInstance(
          NotebookExecutionStateService
        )
      )
    );
  });
  async function withTestNotebook(cells, callback) {
    return _withTestNotebook(
      cells,
      (editor, viewModel) => callback(viewModel, viewModel.notebookDocument, disposables)
    );
  }
  function testCancelOnDelete(expectedCancels, implementsInterrupt) {
    return withTestNotebook(
      [],
      async (viewModel, _document, disposables2) => {
        testNotebookModel = viewModel.notebookDocument;
        let cancels = 0;
        const kernel = new class extends TestNotebookKernel {
          implementsInterrupt = implementsInterrupt;
          constructor() {
            super({ languages: ["javascript"] });
          }
          async executeNotebookCellsRequest() {
          }
          async cancelNotebookCellExecution(_uri, handles) {
            cancels += handles.length;
          }
        }();
        disposables2.add(kernelService.registerKernel(kernel));
        kernelService.selectKernelForNotebook(
          kernel,
          viewModel.notebookDocument
        );
        const executionStateService = instantiationService.get(INotebookExecutionStateService);
        const cell = disposables2.add(
          insertCellAtIndex(
            viewModel,
            0,
            "var c = 3",
            "javascript",
            CellKind.Code,
            {},
            [],
            true,
            true
          )
        );
        const cell2 = disposables2.add(
          insertCellAtIndex(
            viewModel,
            1,
            "var c = 3",
            "javascript",
            CellKind.Code,
            {},
            [],
            true,
            true
          )
        );
        const cell3 = disposables2.add(
          insertCellAtIndex(
            viewModel,
            2,
            "var c = 3",
            "javascript",
            CellKind.Code,
            {},
            [],
            true,
            true
          )
        );
        insertCellAtIndex(
          viewModel,
          3,
          "var c = 3",
          "javascript",
          CellKind.Code,
          {},
          [],
          true,
          true
        );
        const exe = executionStateService.createCellExecution(
          viewModel.uri,
          cell.handle
        );
        exe.confirm();
        exe.update([
          {
            editType: CellExecutionUpdateType.ExecutionState,
            executionOrder: 1
          }
        ]);
        const exe2 = executionStateService.createCellExecution(
          viewModel.uri,
          cell2.handle
        );
        exe2.confirm();
        executionStateService.createCellExecution(
          viewModel.uri,
          cell3.handle
        );
        assert.strictEqual(cancels, 0);
        viewModel.notebookDocument.applyEdits(
          [
            {
              editType: CellEditType.Replace,
              index: 0,
              count: 3,
              cells: []
            }
          ],
          true,
          void 0,
          () => void 0,
          void 0,
          false
        );
        assert.strictEqual(cancels, expectedCancels);
      }
    );
  }
  test("cancel execution when cell is deleted", async () => testCancelOnDelete(3, false));
  test("cancel execution when cell is deleted in interrupt-type kernel", async () => testCancelOnDelete(1, true));
  test("fires onDidChangeCellExecution when cell is completed while deleted", async () => withTestNotebook([], async (viewModel, _document, disposables2) => {
    testNotebookModel = viewModel.notebookDocument;
    const kernel = new TestNotebookKernel();
    disposables2.add(kernelService.registerKernel(kernel));
    kernelService.selectKernelForNotebook(
      kernel,
      viewModel.notebookDocument
    );
    const executionStateService = instantiationService.get(INotebookExecutionStateService);
    const cell = insertCellAtIndex(
      viewModel,
      0,
      "var c = 3",
      "javascript",
      CellKind.Code,
      {},
      [],
      true,
      true
    );
    const exe = executionStateService.createCellExecution(
      viewModel.uri,
      cell.handle
    );
    let didFire = false;
    disposables2.add(
      executionStateService.onDidChangeExecution((e) => {
        if (e.type === NotebookExecutionType.cell) {
          didFire = !e.changed;
        }
      })
    );
    viewModel.notebookDocument.applyEdits(
      [
        {
          editType: CellEditType.Replace,
          index: 0,
          count: 1,
          cells: []
        }
      ],
      true,
      void 0,
      () => void 0,
      void 0,
      false
    );
    exe.complete({});
    assert.strictEqual(didFire, true);
  }));
  test("does not fire onDidChangeCellExecution for output updates", async () => withTestNotebook([], async (viewModel, _document, disposables2) => {
    testNotebookModel = viewModel.notebookDocument;
    const kernel = new TestNotebookKernel();
    disposables2.add(kernelService.registerKernel(kernel));
    kernelService.selectKernelForNotebook(
      kernel,
      viewModel.notebookDocument
    );
    const executionStateService = instantiationService.get(INotebookExecutionStateService);
    const cell = disposables2.add(
      insertCellAtIndex(
        viewModel,
        0,
        "var c = 3",
        "javascript",
        CellKind.Code,
        {},
        [],
        true,
        true
      )
    );
    const exe = executionStateService.createCellExecution(
      viewModel.uri,
      cell.handle
    );
    let didFire = false;
    disposables2.add(
      executionStateService.onDidChangeExecution((e) => {
        if (e.type === NotebookExecutionType.cell) {
          didFire = true;
        }
      })
    );
    exe.update([
      {
        editType: CellExecutionUpdateType.OutputItems,
        items: [],
        outputId: "1"
      }
    ]);
    assert.strictEqual(didFire, false);
    exe.update([
      {
        editType: CellExecutionUpdateType.ExecutionState,
        executionOrder: 123
      }
    ]);
    assert.strictEqual(didFire, true);
    exe.complete({});
  }));
  test("getCellExecution and onDidChangeCellExecution", async () => withTestNotebook([], async (viewModel, _document, disposables2) => {
    testNotebookModel = viewModel.notebookDocument;
    const kernel = new TestNotebookKernel();
    disposables2.add(kernelService.registerKernel(kernel));
    kernelService.selectKernelForNotebook(
      kernel,
      viewModel.notebookDocument
    );
    const executionStateService = instantiationService.get(INotebookExecutionStateService);
    const cell = disposables2.add(
      insertCellAtIndex(
        viewModel,
        0,
        "var c = 3",
        "javascript",
        CellKind.Code,
        {},
        [],
        true,
        true
      )
    );
    const deferred = new DeferredPromise();
    disposables2.add(
      executionStateService.onDidChangeExecution((e) => {
        if (e.type === NotebookExecutionType.cell) {
          const cellUri = CellUri.generate(
            e.notebook,
            e.cellHandle
          );
          const exe = executionStateService.getCellExecution(cellUri);
          assert.ok(exe);
          assert.strictEqual(
            e.notebook.toString(),
            exe.notebook.toString()
          );
          assert.strictEqual(e.cellHandle, exe.cellHandle);
          assert.strictEqual(
            exe.notebook.toString(),
            e.changed?.notebook.toString()
          );
          assert.strictEqual(
            exe.cellHandle,
            e.changed?.cellHandle
          );
          deferred.complete();
        }
      })
    );
    executionStateService.createCellExecution(
      viewModel.uri,
      cell.handle
    );
    return deferred.p;
  }));
  test("getExecution and onDidChangeExecution", async function() {
    return withTestNotebook(
      [],
      async (viewModel, _document, disposables2) => {
        testNotebookModel = viewModel.notebookDocument;
        const kernel = new TestNotebookKernel();
        disposables2.add(kernelService.registerKernel(kernel));
        kernelService.selectKernelForNotebook(
          kernel,
          viewModel.notebookDocument
        );
        const eventRaisedWithExecution = [];
        const executionStateService = instantiationService.get(INotebookExecutionStateService);
        executionStateService.onDidChangeExecution(
          (e) => eventRaisedWithExecution.push(
            e.type === NotebookExecutionType.notebook && !!e.changed
          ),
          this,
          disposables2
        );
        const deferred = new DeferredPromise();
        disposables2.add(
          executionStateService.onDidChangeExecution((e) => {
            if (e.type === NotebookExecutionType.notebook) {
              const exe = executionStateService.getExecution(
                viewModel.uri
              );
              assert.ok(exe);
              assert.strictEqual(
                e.notebook.toString(),
                exe.notebook.toString()
              );
              assert.ok(e.affectsNotebook(viewModel.uri));
              assert.deepStrictEqual(eventRaisedWithExecution, [
                true
              ]);
              deferred.complete();
            }
          })
        );
        executionStateService.createExecution(viewModel.uri);
        return deferred.p;
      }
    );
  });
  test("getExecution and onDidChangeExecution 2", async function() {
    return withTestNotebook(
      [],
      async (viewModel, _document, disposables2) => {
        testNotebookModel = viewModel.notebookDocument;
        const kernel = new TestNotebookKernel();
        disposables2.add(kernelService.registerKernel(kernel));
        kernelService.selectKernelForNotebook(
          kernel,
          viewModel.notebookDocument
        );
        const executionStateService = instantiationService.get(INotebookExecutionStateService);
        const deferred = new DeferredPromise();
        const expectedNotebookEventStates = [
          NotebookExecutionState.Unconfirmed,
          NotebookExecutionState.Pending,
          NotebookExecutionState.Executing,
          void 0
        ];
        executionStateService.onDidChangeExecution(
          (e) => {
            if (e.type === NotebookExecutionType.notebook) {
              const expectedState = expectedNotebookEventStates.shift();
              if (typeof expectedState === "number") {
                const exe = executionStateService.getExecution(
                  viewModel.uri
                );
                assert.ok(exe);
                assert.strictEqual(
                  e.notebook.toString(),
                  exe.notebook.toString()
                );
                assert.strictEqual(
                  e.changed?.state,
                  expectedState
                );
              } else {
                assert.ok(e.changed === void 0);
              }
              assert.ok(e.affectsNotebook(viewModel.uri));
              if (expectedNotebookEventStates.length === 0) {
                deferred.complete();
              }
            }
          },
          this,
          disposables2
        );
        const execution = executionStateService.createExecution(
          viewModel.uri
        );
        execution.confirm();
        execution.begin();
        execution.complete();
        return deferred.p;
      }
    );
  });
  test("force-cancel works for Cell Execution", async () => withTestNotebook([], async (viewModel, _document, disposables2) => {
    testNotebookModel = viewModel.notebookDocument;
    const kernel = new TestNotebookKernel();
    disposables2.add(kernelService.registerKernel(kernel));
    kernelService.selectKernelForNotebook(
      kernel,
      viewModel.notebookDocument
    );
    const executionStateService = instantiationService.get(INotebookExecutionStateService);
    const cell = disposables2.add(
      insertCellAtIndex(
        viewModel,
        0,
        "var c = 3",
        "javascript",
        CellKind.Code,
        {},
        [],
        true,
        true
      )
    );
    executionStateService.createCellExecution(
      viewModel.uri,
      cell.handle
    );
    const exe = executionStateService.getCellExecution(cell.uri);
    assert.ok(exe);
    executionStateService.forceCancelNotebookExecutions(viewModel.uri);
    const exe2 = executionStateService.getCellExecution(cell.uri);
    assert.strictEqual(exe2, void 0);
  }));
  test("force-cancel works for Notebook Execution", async function() {
    return withTestNotebook(
      [],
      async (viewModel, _document, disposables2) => {
        testNotebookModel = viewModel.notebookDocument;
        const kernel = new TestNotebookKernel();
        disposables2.add(kernelService.registerKernel(kernel));
        kernelService.selectKernelForNotebook(
          kernel,
          viewModel.notebookDocument
        );
        const eventRaisedWithExecution = [];
        const executionStateService = instantiationService.get(INotebookExecutionStateService);
        executionStateService.onDidChangeExecution(
          (e) => eventRaisedWithExecution.push(
            e.type === NotebookExecutionType.notebook && !!e.changed
          ),
          this,
          disposables2
        );
        executionStateService.createExecution(viewModel.uri);
        const exe = executionStateService.getExecution(viewModel.uri);
        assert.ok(exe);
        assert.deepStrictEqual(eventRaisedWithExecution, [true]);
        executionStateService.forceCancelNotebookExecutions(
          viewModel.uri
        );
        const exe2 = executionStateService.getExecution(viewModel.uri);
        assert.deepStrictEqual(eventRaisedWithExecution, [true, false]);
        assert.strictEqual(exe2, void 0);
      }
    );
  });
  test("force-cancel works for Cell and Notebook Execution", async () => withTestNotebook([], async (viewModel, _document, disposables2) => {
    testNotebookModel = viewModel.notebookDocument;
    const kernel = new TestNotebookKernel();
    disposables2.add(kernelService.registerKernel(kernel));
    kernelService.selectKernelForNotebook(
      kernel,
      viewModel.notebookDocument
    );
    const executionStateService = instantiationService.get(INotebookExecutionStateService);
    executionStateService.createExecution(viewModel.uri);
    executionStateService.createExecution(viewModel.uri);
    const cellExe = executionStateService.getExecution(viewModel.uri);
    const exe = executionStateService.getExecution(viewModel.uri);
    assert.ok(cellExe);
    assert.ok(exe);
    executionStateService.forceCancelNotebookExecutions(viewModel.uri);
    const cellExe2 = executionStateService.getExecution(viewModel.uri);
    const exe2 = executionStateService.getExecution(viewModel.uri);
    assert.strictEqual(cellExe2, void 0);
    assert.strictEqual(exe2, void 0);
  }));
});
class TestNotebookKernel {
  id = "test";
  label = "";
  viewType = "*";
  onDidChange = Event.None;
  extension = new ExtensionIdentifier("test");
  localResourceRoot = URI.file("/test");
  description;
  detail;
  preloadUris = [];
  preloadProvides = [];
  supportedLanguages = [];
  async executeNotebookCellsRequest() {
  }
  async cancelNotebookCellExecution(uri, cellHandles) {
  }
  provideVariables(notebookUri, parentId, kind, start, token) {
    return AsyncIterableObject.EMPTY;
  }
  constructor(opts) {
    this.supportedLanguages = opts?.languages ?? [PLAINTEXT_LANGUAGE_ID];
    if (opts?.id) {
      this.id = opts?.id;
    }
  }
}
