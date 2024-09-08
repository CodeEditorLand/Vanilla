import assert from "assert";
import { AsyncIterableObject } from "../../../../../base/common/async.js";
import { Emitter, Event } from "../../../../../base/common/event.js";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import { URI } from "../../../../../base/common/uri.js";
import { mock } from "../../../../../base/test/common/mock.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { PLAINTEXT_LANGUAGE_ID } from "../../../../../editor/common/languages/modesRegistry.js";
import {
  IMenuService
} from "../../../../../platform/actions/common/actions.js";
import { ExtensionIdentifier } from "../../../../../platform/extensions/common/extensions.js";
import { NotebookKernelService } from "../../browser/services/notebookKernelServiceImpl.js";
import { NotebookTextModel } from "../../common/model/notebookTextModel.js";
import {
  INotebookKernelService
} from "../../common/notebookKernelService.js";
import { INotebookService } from "../../common/notebookService.js";
import { setupInstantiationService } from "./testNotebookEditor.js";
suite("NotebookKernelService", () => {
  let instantiationService;
  let kernelService;
  let disposables;
  let onDidAddNotebookDocument;
  teardown(() => {
    disposables.dispose();
  });
  ensureNoDisposablesAreLeakedInTestSuite();
  setup(() => {
    disposables = new DisposableStore();
    onDidAddNotebookDocument = new Emitter();
    disposables.add(onDidAddNotebookDocument);
    instantiationService = setupInstantiationService(disposables);
    instantiationService.stub(
      INotebookService,
      new class extends mock() {
        onDidAddNotebookDocument = onDidAddNotebookDocument.event;
        onWillRemoveNotebookDocument = Event.None;
        getNotebookTextModels() {
          return [];
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
    kernelService = disposables.add(
      instantiationService.createInstance(NotebookKernelService)
    );
    instantiationService.set(INotebookKernelService, kernelService);
  });
  test("notebook priorities", () => {
    const u1 = URI.parse("foo:///one");
    const u2 = URI.parse("foo:///two");
    const k1 = new TestNotebookKernel({ label: "z" });
    const k2 = new TestNotebookKernel({ label: "a" });
    disposables.add(kernelService.registerKernel(k1));
    disposables.add(kernelService.registerKernel(k2));
    let info = kernelService.getMatchingKernel({
      uri: u1,
      notebookType: "foo"
    });
    assert.ok(info.all[0] === k2);
    assert.ok(info.all[1] === k1);
    kernelService.updateKernelNotebookAffinity(k2, u1, 2);
    kernelService.updateKernelNotebookAffinity(k2, u2, 1);
    info = kernelService.getMatchingKernel({
      uri: u1,
      notebookType: "foo"
    });
    assert.ok(info.all[0] === k2);
    assert.ok(info.all[1] === k1);
    info = kernelService.getMatchingKernel({
      uri: u2,
      notebookType: "foo"
    });
    assert.ok(info.all[0] === k2);
    assert.ok(info.all[1] === k1);
    kernelService.updateKernelNotebookAffinity(k2, u1, void 0);
    info = kernelService.getMatchingKernel({
      uri: u1,
      notebookType: "foo"
    });
    assert.ok(info.all[0] === k2);
    assert.ok(info.all[1] === k1);
  });
  test("new kernel with higher affinity wins, https://github.com/microsoft/vscode/issues/122028", () => {
    const notebook = URI.parse("foo:///one");
    const kernel = new TestNotebookKernel();
    disposables.add(kernelService.registerKernel(kernel));
    let info = kernelService.getMatchingKernel({
      uri: notebook,
      notebookType: "foo"
    });
    assert.strictEqual(info.all.length, 1);
    assert.ok(info.all[0] === kernel);
    const betterKernel = new TestNotebookKernel();
    disposables.add(kernelService.registerKernel(betterKernel));
    info = kernelService.getMatchingKernel({
      uri: notebook,
      notebookType: "foo"
    });
    assert.strictEqual(info.all.length, 2);
    kernelService.updateKernelNotebookAffinity(betterKernel, notebook, 2);
    info = kernelService.getMatchingKernel({
      uri: notebook,
      notebookType: "foo"
    });
    assert.strictEqual(info.all.length, 2);
    assert.ok(info.all[0] === betterKernel);
    assert.ok(info.all[1] === kernel);
  });
  test("onDidChangeSelectedNotebooks not fired on initial notebook open #121904", () => {
    const uri = URI.parse("foo:///one");
    const jupyter = { uri, viewType: "jupyter", notebookType: "jupyter" };
    const dotnet = { uri, viewType: "dotnet", notebookType: "dotnet" };
    const jupyterKernel = new TestNotebookKernel({
      viewType: jupyter.viewType
    });
    const dotnetKernel = new TestNotebookKernel({
      viewType: dotnet.viewType
    });
    disposables.add(kernelService.registerKernel(jupyterKernel));
    disposables.add(kernelService.registerKernel(dotnetKernel));
    kernelService.selectKernelForNotebook(jupyterKernel, jupyter);
    kernelService.selectKernelForNotebook(dotnetKernel, dotnet);
    let info = kernelService.getMatchingKernel(dotnet);
    assert.strictEqual(info.selected === dotnetKernel, true);
    info = kernelService.getMatchingKernel(jupyter);
    assert.strictEqual(info.selected === jupyterKernel, true);
  });
  test("onDidChangeSelectedNotebooks not fired on initial notebook open #121904, p2", async () => {
    const uri = URI.parse("foo:///one");
    const jupyter = { uri, viewType: "jupyter", notebookType: "jupyter" };
    const dotnet = { uri, viewType: "dotnet", notebookType: "dotnet" };
    const jupyterKernel = new TestNotebookKernel({
      viewType: jupyter.viewType
    });
    const dotnetKernel = new TestNotebookKernel({
      viewType: dotnet.viewType
    });
    disposables.add(kernelService.registerKernel(jupyterKernel));
    disposables.add(kernelService.registerKernel(dotnetKernel));
    kernelService.selectKernelForNotebook(jupyterKernel, jupyter);
    kernelService.selectKernelForNotebook(dotnetKernel, dotnet);
    const transientOptions = {
      transientOutputs: false,
      transientCellMetadata: {},
      transientDocumentMetadata: {},
      cellContentMetadata: {}
    };
    {
      const p1 = Event.toPromise(
        kernelService.onDidChangeSelectedNotebooks
      );
      const d1 = disposables.add(
        instantiationService.createInstance(
          NotebookTextModel,
          jupyter.viewType,
          jupyter.uri,
          [],
          {},
          transientOptions
        )
      );
      onDidAddNotebookDocument.fire(d1);
      const event = await p1;
      assert.strictEqual(event.newKernel, jupyterKernel.id);
    }
    {
      const p2 = Event.toPromise(
        kernelService.onDidChangeSelectedNotebooks
      );
      const d2 = disposables.add(
        instantiationService.createInstance(
          NotebookTextModel,
          dotnet.viewType,
          dotnet.uri,
          [],
          {},
          transientOptions
        )
      );
      onDidAddNotebookDocument.fire(d2);
      const event2 = await p2;
      assert.strictEqual(event2.newKernel, dotnetKernel.id);
    }
  });
});
class TestNotebookKernel {
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
    this.viewType = opts?.viewType ?? this.viewType;
  }
}
