var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { createWebWorker } from "../../../../base/browser/defaultWorkerFactory.js";
import { RunOnceScheduler } from "../../../../base/common/async.js";
import {
  Disposable,
  dispose
} from "../../../../base/common/lifecycle.js";
import { ILanguageFeaturesService } from "../../../../editor/common/services/languageFeatures.js";
import { IModelService } from "../../../../editor/common/services/model.js";
import { WorkerTextModelSyncClient } from "../../../../editor/common/services/textModelSync/textModelSync.impl.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import {
  LOG_MODE_ID,
  OUTPUT_MODE_ID
} from "../../../services/output/common/output.js";
let OutputLinkProvider = class extends Disposable {
  constructor(contextService, modelService, languageFeaturesService) {
    super();
    this.contextService = contextService;
    this.modelService = modelService;
    this.languageFeaturesService = languageFeaturesService;
    this.disposeWorkerScheduler = new RunOnceScheduler(
      () => this.disposeWorker(),
      OutputLinkProvider.DISPOSE_WORKER_TIME
    );
    this.registerListeners();
    this.updateLinkProviderWorker();
  }
  static DISPOSE_WORKER_TIME = 3 * 60 * 1e3;
  // dispose worker after 3 minutes of inactivity
  worker;
  disposeWorkerScheduler;
  linkProviderRegistration;
  registerListeners() {
    this._register(
      this.contextService.onDidChangeWorkspaceFolders(
        () => this.updateLinkProviderWorker()
      )
    );
  }
  updateLinkProviderWorker() {
    const folders = this.contextService.getWorkspace().folders;
    if (folders.length > 0) {
      if (!this.linkProviderRegistration) {
        this.linkProviderRegistration = this.languageFeaturesService.linkProvider.register(
          [
            { language: OUTPUT_MODE_ID, scheme: "*" },
            { language: LOG_MODE_ID, scheme: "*" }
          ],
          {
            provideLinks: async (model) => {
              const links = await this.provideLinks(
                model.uri
              );
              return links && { links };
            }
          }
        );
      }
    } else {
      dispose(this.linkProviderRegistration);
      this.linkProviderRegistration = void 0;
    }
    this.disposeWorker();
    this.disposeWorkerScheduler.cancel();
  }
  getOrCreateWorker() {
    this.disposeWorkerScheduler.schedule();
    if (!this.worker) {
      this.worker = new OutputLinkWorkerClient(
        this.contextService,
        this.modelService
      );
    }
    return this.worker;
  }
  async provideLinks(modelUri) {
    return this.getOrCreateWorker().provideLinks(modelUri);
  }
  disposeWorker() {
    if (this.worker) {
      this.worker.dispose();
      this.worker = void 0;
    }
  }
};
OutputLinkProvider = __decorateClass([
  __decorateParam(0, IWorkspaceContextService),
  __decorateParam(1, IModelService),
  __decorateParam(2, ILanguageFeaturesService)
], OutputLinkProvider);
let OutputLinkWorkerClient = class extends Disposable {
  constructor(contextService, modelService) {
    super();
    this.contextService = contextService;
    this._workerClient = this._register(
      createWebWorker(
        "vs/workbench/contrib/output/common/outputLinkComputer",
        "OutputLinkDetectionWorker"
      )
    );
    this._workerTextModelSyncClient = WorkerTextModelSyncClient.create(
      this._workerClient,
      modelService
    );
    this._initializeBarrier = this._ensureWorkspaceFolders();
  }
  _workerClient;
  _workerTextModelSyncClient;
  _initializeBarrier;
  async _ensureWorkspaceFolders() {
    await this._workerClient.proxy.$setWorkspaceFolders(
      this.contextService.getWorkspace().folders.map((folder) => folder.uri.toString())
    );
  }
  async provideLinks(modelUri) {
    await this._initializeBarrier;
    await this._workerTextModelSyncClient.ensureSyncedResources([modelUri]);
    return this._workerClient.proxy.$computeLinks(modelUri.toString());
  }
};
OutputLinkWorkerClient = __decorateClass([
  __decorateParam(0, IWorkspaceContextService),
  __decorateParam(1, IModelService)
], OutputLinkWorkerClient);
export {
  OutputLinkProvider
};
