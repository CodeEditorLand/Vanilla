var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { Event, Emitter } from "../../../../../base/common/event.js";
import { Disposable, IDisposable, toDisposable } from "../../../../../base/common/lifecycle.js";
import { INotebookKernelSourceAction, INotebookTextModel } from "../../common/notebookCommon.js";
import { INotebookKernel, ISelectedNotebooksChangeEvent, INotebookKernelMatchResult, INotebookKernelService, INotebookTextModelLike, ISourceAction, INotebookSourceActionChangeEvent, INotebookKernelDetectionTask, IKernelSourceActionProvider } from "../../common/notebookKernelService.js";
import { LRUCache, ResourceMap } from "../../../../../base/common/map.js";
import { IStorageService, StorageScope, StorageTarget } from "../../../../../platform/storage/common/storage.js";
import { URI } from "../../../../../base/common/uri.js";
import { INotebookService } from "../../common/notebookService.js";
import { IMenu, IMenuService, MenuId } from "../../../../../platform/actions/common/actions.js";
import { IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { IAction } from "../../../../../base/common/actions.js";
import { MarshalledId } from "../../../../../base/common/marshallingIds.js";
import { Schemas } from "../../../../../base/common/network.js";
import { getActiveWindow, runWhenWindowIdle } from "../../../../../base/browser/dom.js";
class KernelInfo {
  static {
    __name(this, "KernelInfo");
  }
  static _logicClock = 0;
  kernel;
  score;
  time;
  notebookPriorities = new ResourceMap();
  constructor(kernel) {
    this.kernel = kernel;
    this.score = -1;
    this.time = KernelInfo._logicClock++;
  }
}
class NotebookTextModelLikeId {
  static {
    __name(this, "NotebookTextModelLikeId");
  }
  static str(k) {
    return `${k.notebookType}/${k.uri.toString()}`;
  }
  static obj(s) {
    const idx = s.indexOf("/");
    return {
      notebookType: s.substring(0, idx),
      uri: URI.parse(s.substring(idx + 1))
    };
  }
}
class SourceAction extends Disposable {
  constructor(action, model, isPrimary) {
    super();
    this.action = action;
    this.model = model;
    this.isPrimary = isPrimary;
  }
  static {
    __name(this, "SourceAction");
  }
  execution;
  _onDidChangeState = this._register(new Emitter());
  onDidChangeState = this._onDidChangeState.event;
  async runAction() {
    if (this.execution) {
      return this.execution;
    }
    this.execution = this._runAction();
    this._onDidChangeState.fire();
    await this.execution;
    this.execution = void 0;
    this._onDidChangeState.fire();
  }
  async _runAction() {
    try {
      await this.action.run({
        uri: this.model.uri,
        $mid: MarshalledId.NotebookActionContext
      });
    } catch (error) {
      console.warn(`Kernel source command failed: ${error}`);
    }
  }
}
let NotebookKernelService = class extends Disposable {
  constructor(_notebookService, _storageService, _menuService, _contextKeyService) {
    super();
    this._notebookService = _notebookService;
    this._storageService = _storageService;
    this._menuService = _menuService;
    this._contextKeyService = _contextKeyService;
    this._register(_notebookService.onDidAddNotebookDocument(this._tryAutoBindNotebook, this));
    this._register(_notebookService.onWillRemoveNotebookDocument((notebook) => {
      const id = NotebookTextModelLikeId.str(notebook);
      const kernelId = this._notebookBindings.get(id);
      if (kernelId && notebook.uri.scheme === Schemas.untitled) {
        this.selectKernelForNotebook(void 0, notebook);
      }
      this._kernelSourceActionsUpdates.get(id)?.dispose();
      this._kernelSourceActionsUpdates.delete(id);
    }));
    try {
      const data = JSON.parse(this._storageService.get(NotebookKernelService._storageNotebookBinding, StorageScope.WORKSPACE, "[]"));
      this._notebookBindings.fromJSON(data);
    } catch {
    }
  }
  static {
    __name(this, "NotebookKernelService");
  }
  _kernels = /* @__PURE__ */ new Map();
  _notebookBindings = new LRUCache(1e3, 0.7);
  _onDidChangeNotebookKernelBinding = this._register(new Emitter());
  _onDidAddKernel = this._register(new Emitter());
  _onDidRemoveKernel = this._register(new Emitter());
  _onDidChangeNotebookAffinity = this._register(new Emitter());
  _onDidChangeSourceActions = this._register(new Emitter());
  _onDidNotebookVariablesChange = this._register(new Emitter());
  _kernelSources = /* @__PURE__ */ new Map();
  _kernelSourceActionsUpdates = /* @__PURE__ */ new Map();
  _kernelDetectionTasks = /* @__PURE__ */ new Map();
  _onDidChangeKernelDetectionTasks = this._register(new Emitter());
  _kernelSourceActionProviders = /* @__PURE__ */ new Map();
  onDidChangeSelectedNotebooks = this._onDidChangeNotebookKernelBinding.event;
  onDidAddKernel = this._onDidAddKernel.event;
  onDidRemoveKernel = this._onDidRemoveKernel.event;
  onDidChangeNotebookAffinity = this._onDidChangeNotebookAffinity.event;
  onDidChangeSourceActions = this._onDidChangeSourceActions.event;
  onDidChangeKernelDetectionTasks = this._onDidChangeKernelDetectionTasks.event;
  onDidNotebookVariablesUpdate = this._onDidNotebookVariablesChange.event;
  static _storageNotebookBinding = "notebook.controller2NotebookBindings";
  dispose() {
    this._kernels.clear();
    this._kernelSources.forEach((v) => {
      v.menu.dispose();
      v.actions.forEach((a) => a[1].dispose());
    });
    this._kernelSourceActionsUpdates.forEach((v) => {
      v.dispose();
    });
    this._kernelSourceActionsUpdates.clear();
    super.dispose();
  }
  _persistSoonHandle;
  _persistMementos() {
    this._persistSoonHandle?.dispose();
    this._persistSoonHandle = runWhenWindowIdle(getActiveWindow(), () => {
      this._storageService.store(NotebookKernelService._storageNotebookBinding, JSON.stringify(this._notebookBindings), StorageScope.WORKSPACE, StorageTarget.MACHINE);
    }, 100);
  }
  static _score(kernel, notebook) {
    if (kernel.viewType === "*") {
      return 5;
    } else if (kernel.viewType === notebook.notebookType) {
      return 10;
    } else {
      return 0;
    }
  }
  _tryAutoBindNotebook(notebook, onlyThisKernel) {
    const id = this._notebookBindings.get(NotebookTextModelLikeId.str(notebook));
    if (!id) {
      return;
    }
    const existingKernel = this._kernels.get(id);
    if (!existingKernel || !NotebookKernelService._score(existingKernel.kernel, notebook)) {
      return;
    }
    if (!onlyThisKernel || existingKernel.kernel === onlyThisKernel) {
      this._onDidChangeNotebookKernelBinding.fire({ notebook: notebook.uri, oldKernel: void 0, newKernel: existingKernel.kernel.id });
    }
  }
  notifyVariablesChange(notebookUri) {
    this._onDidNotebookVariablesChange.fire(notebookUri);
  }
  registerKernel(kernel) {
    if (this._kernels.has(kernel.id)) {
      throw new Error(`NOTEBOOK CONTROLLER with id '${kernel.id}' already exists`);
    }
    this._kernels.set(kernel.id, new KernelInfo(kernel));
    this._onDidAddKernel.fire(kernel);
    for (const notebook of this._notebookService.getNotebookTextModels()) {
      this._tryAutoBindNotebook(notebook, kernel);
    }
    return toDisposable(() => {
      if (this._kernels.delete(kernel.id)) {
        this._onDidRemoveKernel.fire(kernel);
      }
      for (const [key, candidate] of Array.from(this._notebookBindings)) {
        if (candidate === kernel.id) {
          this._onDidChangeNotebookKernelBinding.fire({ notebook: NotebookTextModelLikeId.obj(key).uri, oldKernel: kernel.id, newKernel: void 0 });
        }
      }
    });
  }
  getMatchingKernel(notebook) {
    const kernels = [];
    for (const info of this._kernels.values()) {
      const score = NotebookKernelService._score(info.kernel, notebook);
      if (score) {
        kernels.push({
          score,
          kernel: info.kernel,
          instanceAffinity: info.notebookPriorities.get(notebook.uri) ?? 1
        });
      }
    }
    kernels.sort((a, b) => b.instanceAffinity - a.instanceAffinity || a.score - b.score || a.kernel.label.localeCompare(b.kernel.label));
    const all = kernels.map((obj) => obj.kernel);
    const selectedId = this._notebookBindings.get(NotebookTextModelLikeId.str(notebook));
    const selected = selectedId ? this._kernels.get(selectedId)?.kernel : void 0;
    const suggestions = kernels.filter((item) => item.instanceAffinity > 1).map((item) => item.kernel);
    const hidden = kernels.filter((item) => item.instanceAffinity < 0).map((item) => item.kernel);
    return { all, selected, suggestions, hidden };
  }
  getSelectedOrSuggestedKernel(notebook) {
    const info = this.getMatchingKernel(notebook);
    if (info.selected) {
      return info.selected;
    }
    const preferred = info.all.filter(
      (kernel) => this._kernels.get(kernel.id)?.notebookPriorities.get(notebook.uri) === 2
      /* vscode.NotebookControllerPriority.Preferred */
    );
    if (preferred.length === 1) {
      return preferred[0];
    }
    return info.all.length === 1 ? info.all[0] : void 0;
  }
  // a notebook has one kernel, a kernel has N notebooks
  // notebook <-1----N-> kernel
  selectKernelForNotebook(kernel, notebook) {
    const key = NotebookTextModelLikeId.str(notebook);
    const oldKernel = this._notebookBindings.get(key);
    if (oldKernel !== kernel?.id) {
      if (kernel) {
        this._notebookBindings.set(key, kernel.id);
      } else {
        this._notebookBindings.delete(key);
      }
      this._onDidChangeNotebookKernelBinding.fire({ notebook: notebook.uri, oldKernel, newKernel: kernel?.id });
      this._persistMementos();
    }
  }
  preselectKernelForNotebook(kernel, notebook) {
    const key = NotebookTextModelLikeId.str(notebook);
    const oldKernel = this._notebookBindings.get(key);
    if (oldKernel !== kernel?.id) {
      this._notebookBindings.set(key, kernel.id);
      this._persistMementos();
    }
  }
  updateKernelNotebookAffinity(kernel, notebook, preference) {
    const info = this._kernels.get(kernel.id);
    if (!info) {
      throw new Error(`UNKNOWN kernel '${kernel.id}'`);
    }
    if (preference === void 0) {
      info.notebookPriorities.delete(notebook);
    } else {
      info.notebookPriorities.set(notebook, preference);
    }
    this._onDidChangeNotebookAffinity.fire();
  }
  getRunningSourceActions(notebook) {
    const id = NotebookTextModelLikeId.str(notebook);
    const existingInfo = this._kernelSources.get(id);
    if (existingInfo) {
      return existingInfo.actions.filter((action) => action[0].execution).map((action) => action[0]);
    }
    return [];
  }
  getSourceActions(notebook, contextKeyService) {
    contextKeyService = contextKeyService ?? this._contextKeyService;
    const id = NotebookTextModelLikeId.str(notebook);
    const existingInfo = this._kernelSources.get(id);
    if (existingInfo) {
      return existingInfo.actions.map((a) => a[0]);
    }
    const sourceMenu = this._register(this._menuService.createMenu(MenuId.NotebookKernelSource, contextKeyService));
    const info = { menu: sourceMenu, actions: [] };
    const loadActionsFromMenu = /* @__PURE__ */ __name((menu, document) => {
      const groups = menu.getActions({ shouldForwardArgs: true });
      const sourceActions = [];
      groups.forEach((group) => {
        const isPrimary = /^primary/.test(group[0]);
        group[1].forEach((action) => {
          const sourceAction = new SourceAction(action, document, isPrimary);
          const stateChangeListener = sourceAction.onDidChangeState(() => {
            this._onDidChangeSourceActions.fire({
              notebook: document.uri,
              viewType: document.notebookType
            });
          });
          sourceActions.push([sourceAction, stateChangeListener]);
        });
      });
      info.actions = sourceActions;
      this._kernelSources.set(id, info);
      this._onDidChangeSourceActions.fire({ notebook: document.uri, viewType: document.notebookType });
    }, "loadActionsFromMenu");
    this._kernelSourceActionsUpdates.get(id)?.dispose();
    this._kernelSourceActionsUpdates.set(id, sourceMenu.onDidChange(() => {
      loadActionsFromMenu(sourceMenu, notebook);
    }));
    loadActionsFromMenu(sourceMenu, notebook);
    return info.actions.map((a) => a[0]);
  }
  registerNotebookKernelDetectionTask(task) {
    const notebookType = task.notebookType;
    const all = this._kernelDetectionTasks.get(notebookType) ?? [];
    all.push(task);
    this._kernelDetectionTasks.set(notebookType, all);
    this._onDidChangeKernelDetectionTasks.fire(notebookType);
    return toDisposable(() => {
      const all2 = this._kernelDetectionTasks.get(notebookType) ?? [];
      const idx = all2.indexOf(task);
      if (idx >= 0) {
        all2.splice(idx, 1);
        this._kernelDetectionTasks.set(notebookType, all2);
        this._onDidChangeKernelDetectionTasks.fire(notebookType);
      }
    });
  }
  getKernelDetectionTasks(notebook) {
    return this._kernelDetectionTasks.get(notebook.notebookType) ?? [];
  }
  registerKernelSourceActionProvider(viewType, provider) {
    const providers = this._kernelSourceActionProviders.get(viewType) ?? [];
    providers.push(provider);
    this._kernelSourceActionProviders.set(viewType, providers);
    this._onDidChangeSourceActions.fire({ viewType });
    const eventEmitterDisposable = provider.onDidChangeSourceActions?.(() => {
      this._onDidChangeSourceActions.fire({ viewType });
    });
    return toDisposable(() => {
      const providers2 = this._kernelSourceActionProviders.get(viewType) ?? [];
      const idx = providers2.indexOf(provider);
      if (idx >= 0) {
        providers2.splice(idx, 1);
        this._kernelSourceActionProviders.set(viewType, providers2);
      }
      eventEmitterDisposable?.dispose();
    });
  }
  /**
   * Get kernel source actions from providers
   */
  getKernelSourceActions2(notebook) {
    const viewType = notebook.notebookType;
    const providers = this._kernelSourceActionProviders.get(viewType) ?? [];
    const promises = providers.map((provider) => provider.provideKernelSourceActions());
    return Promise.all(promises).then((actions) => {
      return actions.reduce((a, b) => a.concat(b), []);
    });
  }
};
NotebookKernelService = __decorateClass([
  __decorateParam(0, INotebookService),
  __decorateParam(1, IStorageService),
  __decorateParam(2, IMenuService),
  __decorateParam(3, IContextKeyService)
], NotebookKernelService);
export {
  NotebookKernelService
};
//# sourceMappingURL=notebookKernelServiceImpl.js.map
