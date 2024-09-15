var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { URI } from "../../../../../base/common/uri.js";
import { ExtensionIdentifier } from "../../../../../platform/extensions/common/extensions.js";
import { setupInstantiationService } from "./testNotebookEditor.js";
import { Emitter, Event } from "../../../../../base/common/event.js";
import { INotebookKernel, INotebookKernelService, VariablesResult } from "../../common/notebookKernelService.js";
import { NotebookKernelService } from "../../browser/services/notebookKernelServiceImpl.js";
import { INotebookService } from "../../common/notebookService.js";
import { mock } from "../../../../../base/test/common/mock.js";
import { TestInstantiationService } from "../../../../../platform/instantiation/test/common/instantiationServiceMock.js";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import { NotebookTextModel } from "../../common/model/notebookTextModel.js";
import { PLAINTEXT_LANGUAGE_ID } from "../../../../../editor/common/languages/modesRegistry.js";
import { IMenu, IMenuService } from "../../../../../platform/actions/common/actions.js";
import { NotebookKernelHistoryService } from "../../browser/services/notebookKernelHistoryServiceImpl.js";
import { IApplicationStorageValueChangeEvent, IProfileStorageValueChangeEvent, IStorageService, IStorageValueChangeEvent, IWillSaveStateEvent, IWorkspaceStorageValueChangeEvent, StorageScope } from "../../../../../platform/storage/common/storage.js";
import { INotebookLoggingService } from "../../common/notebookLoggingService.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { CancellationToken } from "../../../../../base/common/cancellation.js";
import { AsyncIterableObject } from "../../../../../base/common/async.js";
suite("NotebookKernelHistoryService", () => {
  let disposables;
  let instantiationService;
  let kernelService;
  let onDidAddNotebookDocument;
  teardown(() => {
    disposables.dispose();
  });
  ensureNoDisposablesAreLeakedInTestSuite();
  setup(function() {
    disposables = new DisposableStore();
    onDidAddNotebookDocument = new Emitter();
    disposables.add(onDidAddNotebookDocument);
    instantiationService = setupInstantiationService(disposables);
    instantiationService.stub(INotebookService, new class extends mock() {
      onDidAddNotebookDocument = onDidAddNotebookDocument.event;
      onWillRemoveNotebookDocument = Event.None;
      getNotebookTextModels() {
        return [];
      }
    }());
    instantiationService.stub(IMenuService, new class extends mock() {
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
    }());
    kernelService = disposables.add(instantiationService.createInstance(NotebookKernelService));
    instantiationService.set(INotebookKernelService, kernelService);
  });
  test("notebook kernel empty history", function() {
    const u1 = URI.parse("foo:///one");
    const k1 = new TestNotebookKernel({ label: "z", notebookType: "foo" });
    const k2 = new TestNotebookKernel({ label: "a", notebookType: "foo" });
    disposables.add(kernelService.registerKernel(k1));
    disposables.add(kernelService.registerKernel(k2));
    instantiationService.stub(IStorageService, new class extends mock() {
      onWillSaveState = Event.None;
      onDidChangeValue(scope, key, disposable) {
        return Event.None;
      }
      get(key, scope, fallbackValue) {
        if (key === "notebook.kernelHistory") {
          return JSON.stringify({
            "foo": {
              "entries": []
            }
          });
        }
        return void 0;
      }
    }());
    instantiationService.stub(INotebookLoggingService, new class extends mock() {
      info() {
      }
      debug() {
      }
    }());
    const kernelHistoryService = disposables.add(instantiationService.createInstance(NotebookKernelHistoryService));
    let info = kernelHistoryService.getKernels({ uri: u1, notebookType: "foo" });
    assert.equal(info.all.length, 0);
    assert.ok(!info.selected);
    kernelService.updateKernelNotebookAffinity(k2, u1, 2);
    info = kernelHistoryService.getKernels({ uri: u1, notebookType: "foo" });
    assert.equal(info.all.length, 0);
    assert.deepStrictEqual(info.selected, void 0);
  });
  test("notebook kernel history restore", function() {
    const u1 = URI.parse("foo:///one");
    const k1 = new TestNotebookKernel({ label: "z", notebookType: "foo" });
    const k2 = new TestNotebookKernel({ label: "a", notebookType: "foo" });
    const k3 = new TestNotebookKernel({ label: "b", notebookType: "foo" });
    disposables.add(kernelService.registerKernel(k1));
    disposables.add(kernelService.registerKernel(k2));
    disposables.add(kernelService.registerKernel(k3));
    instantiationService.stub(IStorageService, new class extends mock() {
      onWillSaveState = Event.None;
      onDidChangeValue(scope, key, disposable) {
        return Event.None;
      }
      get(key, scope, fallbackValue) {
        if (key === "notebook.kernelHistory") {
          return JSON.stringify({
            "foo": {
              "entries": [
                k2.id
              ]
            }
          });
        }
        return void 0;
      }
    }());
    instantiationService.stub(INotebookLoggingService, new class extends mock() {
      info() {
      }
      debug() {
      }
    }());
    const kernelHistoryService = disposables.add(instantiationService.createInstance(NotebookKernelHistoryService));
    let info = kernelHistoryService.getKernels({ uri: u1, notebookType: "foo" });
    assert.equal(info.all.length, 1);
    assert.deepStrictEqual(info.selected, void 0);
    kernelHistoryService.addMostRecentKernel(k3);
    info = kernelHistoryService.getKernels({ uri: u1, notebookType: "foo" });
    assert.deepStrictEqual(info.all, [k3, k2]);
  });
});
class TestNotebookKernel {
  static {
    __name(this, "TestNotebookKernel");
  }
  id = Math.random() + "kernel";
  label = "test-label";
  viewType = "*";
  onDidChange = Event.None;
  extension = new ExtensionIdentifier("test");
  localResourceRoot = URI.file("/test");
  description;
  detail;
  preloadUris = [];
  preloadProvides = [];
  supportedLanguages = [];
  executeNotebookCellsRequest() {
    throw new Error("Method not implemented.");
  }
  cancelNotebookCellExecution() {
    throw new Error("Method not implemented.");
  }
  provideVariables(notebookUri, parentId, kind, start, token) {
    return AsyncIterableObject.EMPTY;
  }
  constructor(opts) {
    this.supportedLanguages = opts?.languages ?? [PLAINTEXT_LANGUAGE_ID];
    this.label = opts?.label ?? this.label;
    this.viewType = opts?.notebookType ?? this.viewType;
  }
}
//# sourceMappingURL=notebookKernelHistory.test.js.map
