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
import { CancellationToken } from "../../../../base/common/cancellation.js";
import {
  AsyncEmitter,
  Emitter
} from "../../../../base/common/event.js";
import {
  combinedDisposable,
  DisposableStore,
  dispose,
  ReferenceCollection,
  toDisposable
} from "../../../../base/common/lifecycle.js";
import { ResourceMap } from "../../../../base/common/map.js";
import { Schemas } from "../../../../base/common/network.js";
import { assertIsDefined } from "../../../../base/common/types.js";
import { URI } from "../../../../base/common/uri.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { IUriIdentityService } from "../../../../platform/uriIdentity/common/uriIdentity.js";
import { IExtensionService } from "../../../services/extensions/common/extensions.js";
import {
  FileWorkingCopyManager
} from "../../../services/workingCopy/common/fileWorkingCopyManager.js";
import {
  CellUri,
  NotebookSetting,
  NotebookWorkingCopyTypeIdentifier
} from "./notebookCommon.js";
import {
  NotebookFileWorkingCopyModelFactory,
  SimpleNotebookEditorModel
} from "./notebookEditorModel.js";
import { INotebookLoggingService } from "./notebookLoggingService.js";
import { NotebookProviderInfo } from "./notebookProvider.js";
import { INotebookService } from "./notebookService.js";
let NotebookModelReferenceCollection = class extends ReferenceCollection {
  constructor(_instantiationService, _notebookService, _configurationService, _telemetryService, _notebookLoggingService) {
    super();
    this._instantiationService = _instantiationService;
    this._notebookService = _notebookService;
    this._configurationService = _configurationService;
    this._telemetryService = _telemetryService;
    this._notebookLoggingService = _notebookLoggingService;
  }
  _disposables = new DisposableStore();
  _workingCopyManagers = /* @__PURE__ */ new Map();
  _modelListener = /* @__PURE__ */ new Map();
  _onDidSaveNotebook = new Emitter();
  onDidSaveNotebook = this._onDidSaveNotebook.event;
  _onDidChangeDirty = new Emitter();
  onDidChangeDirty = this._onDidChangeDirty.event;
  _dirtyStates = new ResourceMap();
  modelsToDispose = /* @__PURE__ */ new Set();
  dispose() {
    this._disposables.dispose();
    this._onDidSaveNotebook.dispose();
    this._onDidChangeDirty.dispose();
    dispose(this._modelListener.values());
    dispose(this._workingCopyManagers.values());
  }
  isDirty(resource) {
    return this._dirtyStates.get(resource) ?? false;
  }
  async createReferencedObject(key, viewType, hasAssociatedFilePath, limits, isScratchpad) {
    this.modelsToDispose.delete(key);
    const uri = URI.parse(key);
    const workingCopyTypeId = NotebookWorkingCopyTypeIdentifier.create(viewType);
    let workingCopyManager = this._workingCopyManagers.get(workingCopyTypeId);
    if (!workingCopyManager) {
      const factory = new NotebookFileWorkingCopyModelFactory(
        viewType,
        this._notebookService,
        this._configurationService,
        this._telemetryService,
        this._notebookLoggingService
      );
      workingCopyManager = this._instantiationService.createInstance(
        FileWorkingCopyManager,
        workingCopyTypeId,
        factory,
        factory
      );
      this._workingCopyManagers.set(
        workingCopyTypeId,
        workingCopyManager
      );
    }
    const isScratchpadView = isScratchpad || viewType === "interactive" && this._configurationService.getValue(
      NotebookSetting.InteractiveWindowPromptToSave
    ) !== true;
    const model = this._instantiationService.createInstance(
      SimpleNotebookEditorModel,
      uri,
      hasAssociatedFilePath,
      viewType,
      workingCopyManager,
      isScratchpadView
    );
    const result = await model.load({ limits });
    let onDirtyAutoReference;
    this._modelListener.set(
      result,
      combinedDisposable(
        result.onDidSave(
          () => this._onDidSaveNotebook.fire(result.resource)
        ),
        result.onDidChangeDirty(() => {
          const isDirty = result.isDirty();
          this._dirtyStates.set(result.resource, isDirty);
          if (isDirty && !onDirtyAutoReference) {
            onDirtyAutoReference = this.acquire(key, viewType);
          } else if (onDirtyAutoReference) {
            onDirtyAutoReference.dispose();
            onDirtyAutoReference = void 0;
          }
          this._onDidChangeDirty.fire(result);
        }),
        toDisposable(() => onDirtyAutoReference?.dispose())
      )
    );
    return result;
  }
  destroyReferencedObject(key, object) {
    this.modelsToDispose.add(key);
    (async () => {
      try {
        const model = await object;
        if (!this.modelsToDispose.has(key)) {
          return;
        }
        if (model instanceof SimpleNotebookEditorModel) {
          await model.canDispose();
        }
        if (!this.modelsToDispose.has(key)) {
          return;
        }
        this._modelListener.get(model)?.dispose();
        this._modelListener.delete(model);
        model.dispose();
      } catch (err) {
        this._notebookLoggingService.error(
          "NotebookModelCollection",
          "FAILED to destory notebook - " + err
        );
      } finally {
        this.modelsToDispose.delete(key);
      }
    })();
  }
};
NotebookModelReferenceCollection = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, INotebookService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, ITelemetryService),
  __decorateParam(4, INotebookLoggingService)
], NotebookModelReferenceCollection);
let NotebookModelResolverServiceImpl = class {
  constructor(instantiationService, _notebookService, _extensionService, _uriIdentService) {
    this._notebookService = _notebookService;
    this._extensionService = _extensionService;
    this._uriIdentService = _uriIdentService;
    this._data = instantiationService.createInstance(
      NotebookModelReferenceCollection
    );
    this.onDidSaveNotebook = this._data.onDidSaveNotebook;
    this.onDidChangeDirty = this._data.onDidChangeDirty;
  }
  _serviceBrand;
  _data;
  onDidSaveNotebook;
  onDidChangeDirty;
  _onWillFailWithConflict = new AsyncEmitter();
  onWillFailWithConflict = this._onWillFailWithConflict.event;
  dispose() {
    this._data.dispose();
  }
  isDirty(resource) {
    return this._data.isDirty(resource);
  }
  createUntitledUri(notebookType) {
    const info = this._notebookService.getContributedNotebookType(
      assertIsDefined(notebookType)
    );
    if (!info) {
      throw new Error("UNKNOWN notebook type: " + notebookType);
    }
    const suffix = NotebookProviderInfo.possibleFileEnding(info.selectors) ?? "";
    for (let counter = 1; ; counter++) {
      const candidate = URI.from({
        scheme: Schemas.untitled,
        path: `Untitled-${counter}${suffix}`,
        query: notebookType
      });
      if (!this._notebookService.getNotebookTextModel(candidate)) {
        return candidate;
      }
    }
  }
  async validateResourceViewType(uri, viewType) {
    if (!uri && !viewType) {
      throw new Error(
        "Must provide at least one of resource or viewType"
      );
    }
    if (uri?.scheme === CellUri.scheme) {
      throw new Error(
        `CANNOT open a cell-uri as notebook. Tried with ${uri.toString()}`
      );
    }
    const resource = this._uriIdentService.asCanonicalUri(
      uri ?? this.createUntitledUri(viewType)
    );
    const existingNotebook = this._notebookService.getNotebookTextModel(resource);
    if (!viewType) {
      if (existingNotebook) {
        viewType = existingNotebook.viewType;
      } else {
        await this._extensionService.whenInstalledExtensionsRegistered();
        const providers = this._notebookService.getContributedNotebookTypes(resource);
        viewType = providers.find(
          (provider) => provider.priority === "exclusive"
        )?.id ?? providers.find(
          (provider) => provider.priority === "default"
        )?.id ?? providers[0]?.id;
      }
    }
    if (!viewType) {
      throw new Error(`Missing viewType for '${resource}'`);
    }
    if (existingNotebook && existingNotebook.viewType !== viewType) {
      await this._onWillFailWithConflict.fireAsync(
        { resource, viewType },
        CancellationToken.None
      );
      const existingViewType2 = this._notebookService.getNotebookTextModel(resource)?.viewType;
      if (existingViewType2 && existingViewType2 !== viewType) {
        throw new Error(
          `A notebook with view type '${existingViewType2}' already exists for '${resource}', CANNOT create another notebook with view type ${viewType}`
        );
      }
    }
    return { resource, viewType };
  }
  async createUntitledNotebookTextModel(viewType) {
    const resource = this._uriIdentService.asCanonicalUri(
      this.createUntitledUri(viewType)
    );
    return await this._notebookService.createNotebookTextModel(
      viewType,
      resource
    );
  }
  async resolve(arg0, viewType, options) {
    let resource;
    let hasAssociatedFilePath;
    if (URI.isUri(arg0)) {
      resource = arg0;
    } else if (arg0.untitledResource) {
      if (arg0.untitledResource.scheme === Schemas.untitled) {
        resource = arg0.untitledResource;
      } else {
        resource = arg0.untitledResource.with({
          scheme: Schemas.untitled
        });
        hasAssociatedFilePath = true;
      }
    }
    const validated = await this.validateResourceViewType(
      resource,
      viewType
    );
    const reference = this._data.acquire(
      validated.resource.toString(),
      validated.viewType,
      hasAssociatedFilePath,
      options?.limits,
      options?.scratchpad
    );
    try {
      const model = await reference.object;
      return {
        object: model,
        dispose() {
          reference.dispose();
        }
      };
    } catch (err) {
      reference.dispose();
      throw err;
    }
  }
};
NotebookModelResolverServiceImpl = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, INotebookService),
  __decorateParam(2, IExtensionService),
  __decorateParam(3, IUriIdentityService)
], NotebookModelResolverServiceImpl);
export {
  NotebookModelResolverServiceImpl
};
