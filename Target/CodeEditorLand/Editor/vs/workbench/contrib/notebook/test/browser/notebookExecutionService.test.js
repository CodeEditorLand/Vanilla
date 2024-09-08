import assert from "assert";
import * as sinon from "sinon";
import { AsyncIterableObject } from "../../../../../base/common/async.js";
import { Event } from "../../../../../base/common/event.js";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import { URI } from "../../../../../base/common/uri.js";
import { mock } from "../../../../../base/test/common/mock.js";
import {
  assertThrowsAsync,
  ensureNoDisposablesAreLeakedInTestSuite
} from "../../../../../base/test/common/utils.js";
import { PLAINTEXT_LANGUAGE_ID } from "../../../../../editor/common/languages/modesRegistry.js";
import {
  IMenuService
} from "../../../../../platform/actions/common/actions.js";
import { ICommandService } from "../../../../../platform/commands/common/commands.js";
import { IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { ExtensionIdentifier } from "../../../../../platform/extensions/common/extensions.js";
import { insertCellAtIndex } from "../../browser/controller/cellOperations.js";
import { NotebookExecutionService } from "../../browser/services/notebookExecutionServiceImpl.js";
import { NotebookKernelService } from "../../browser/services/notebookKernelServiceImpl.js";
import {
  CellKind
} from "../../common/notebookCommon.js";
import { INotebookExecutionStateService } from "../../common/notebookExecutionStateService.js";
import {
  INotebookKernelHistoryService,
  INotebookKernelService
} from "../../common/notebookKernelService.js";
import { INotebookLoggingService } from "../../common/notebookLoggingService.js";
import { INotebookService } from "../../common/notebookService.js";
import {
  withTestNotebook as _withTestNotebook,
  setupInstantiationService
} from "./testNotebookEditor.js";
suite("NotebookExecutionService", () => {
  let instantiationService;
  let contextKeyService;
  let kernelService;
  let disposables;
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
      }()
    );
    instantiationService.stub(
      INotebookLoggingService,
      new class extends mock() {
        debug(category, output) {
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
      INotebookKernelHistoryService,
      new class extends mock() {
        getKernels(notebook) {
          return kernelService.getMatchingKernel(notebook);
        }
        addMostRecentKernel(kernel) {
        }
      }()
    );
    instantiationService.stub(
      ICommandService,
      new class extends mock() {
        executeCommand(_commandId, ..._args) {
          return Promise.resolve(void 0);
        }
      }()
    );
    kernelService = disposables.add(
      instantiationService.createInstance(NotebookKernelService)
    );
    instantiationService.set(INotebookKernelService, kernelService);
    contextKeyService = instantiationService.get(IContextKeyService);
  });
  async function withTestNotebook(cells, callback) {
    return _withTestNotebook(
      cells,
      (editor, viewModel, disposables2) => callback(viewModel, viewModel.notebookDocument, disposables2)
    );
  }
  test("cell is not runnable when no kernel is selected", async () => {
    await withTestNotebook(
      [],
      async (viewModel, textModel, disposables2) => {
        const executionService = instantiationService.createInstance(
          NotebookExecutionService
        );
        const cell = insertCellAtIndex(
          viewModel,
          1,
          "var c = 3",
          "javascript",
          CellKind.Code,
          {},
          [],
          true,
          true
        );
        await assertThrowsAsync(
          async () => await executionService.executeNotebookCells(
            textModel,
            [cell.model],
            contextKeyService
          )
        );
      }
    );
  });
  test("cell is not runnable when kernel does not support the language", async () => {
    await withTestNotebook([], async (viewModel, textModel) => {
      disposables.add(
        kernelService.registerKernel(
          new TestNotebookKernel({ languages: ["testlang"] })
        )
      );
      const executionService = disposables.add(
        instantiationService.createInstance(NotebookExecutionService)
      );
      const cell = disposables.add(
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
      await assertThrowsAsync(
        async () => await executionService.executeNotebookCells(
          textModel,
          [cell.model],
          contextKeyService
        )
      );
    });
  });
  test("cell is runnable when kernel does support the language", async () => {
    await withTestNotebook([], async (viewModel, textModel) => {
      const kernel = new TestNotebookKernel({
        languages: ["javascript"]
      });
      disposables.add(kernelService.registerKernel(kernel));
      kernelService.selectKernelForNotebook(kernel, textModel);
      const executionService = disposables.add(
        instantiationService.createInstance(NotebookExecutionService)
      );
      const executeSpy = sinon.spy();
      kernel.executeNotebookCellsRequest = executeSpy;
      const cell = disposables.add(
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
      await executionService.executeNotebookCells(
        viewModel.notebookDocument,
        [cell.model],
        contextKeyService
      );
      assert.strictEqual(executeSpy.calledOnce, true);
    });
  });
  test("Completes unconfirmed executions", async () => withTestNotebook([], async (viewModel, textModel) => {
    let didExecute = false;
    const kernel = new class extends TestNotebookKernel {
      constructor() {
        super({ languages: ["javascript"] });
        this.id = "mySpecialId";
      }
      async executeNotebookCellsRequest() {
        didExecute = true;
        return;
      }
    }();
    disposables.add(kernelService.registerKernel(kernel));
    kernelService.selectKernelForNotebook(kernel, textModel);
    const executionService = disposables.add(
      instantiationService.createInstance(NotebookExecutionService)
    );
    const exeStateService = instantiationService.get(
      INotebookExecutionStateService
    );
    const cell = disposables.add(
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
    await executionService.executeNotebookCells(
      textModel,
      [cell.model],
      contextKeyService
    );
    assert.strictEqual(didExecute, true);
    assert.strictEqual(
      exeStateService.getCellExecution(cell.uri),
      void 0
    );
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
  provideVariables(notebookUri, parentId, kind, start, token) {
    return AsyncIterableObject.EMPTY;
  }
  executeNotebookCellsRequest() {
    throw new Error("Method not implemented.");
  }
  cancelNotebookCellExecution() {
    throw new Error("Method not implemented.");
  }
  constructor(opts) {
    this.supportedLanguages = opts?.languages ?? [PLAINTEXT_LANGUAGE_ID];
  }
  implementsInterrupt;
  implementsExecutionOrder;
}
