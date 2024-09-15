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
import { toAction } from "../../../../../base/common/actions.js";
import {
  VSBuffer,
  streamToBuffer
} from "../../../../../base/common/buffer.js";
import { createErrorWithActions } from "../../../../../base/common/errorMessage.js";
import { Emitter } from "../../../../../base/common/event.js";
import { Iterable } from "../../../../../base/common/iterator.js";
import { Lazy } from "../../../../../base/common/lazy.js";
import {
  Disposable,
  DisposableStore,
  toDisposable
} from "../../../../../base/common/lifecycle.js";
import { ResourceMap } from "../../../../../base/common/map.js";
import { Schemas } from "../../../../../base/common/network.js";
import { basename, isEqual } from "../../../../../base/common/resources.js";
import { isDefined } from "../../../../../base/common/types.js";
import { URI } from "../../../../../base/common/uri.js";
import { localize } from "../../../../../nls.js";
import { IAccessibilityService } from "../../../../../platform/accessibility/common/accessibility.js";
import {
  IConfigurationService
} from "../../../../../platform/configuration/common/configuration.js";
import { IFileService } from "../../../../../platform/files/common/files.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import {
  IStorageService,
  StorageScope,
  StorageTarget
} from "../../../../../platform/storage/common/storage.js";
import { IUriIdentityService } from "../../../../../platform/uriIdentity/common/uriIdentity.js";
import { Memento } from "../../../../common/memento.js";
import {
  IEditorResolverService,
  RegisteredEditorPriority
} from "../../../../services/editor/common/editorResolverService.js";
import {
  IExtensionService,
  isProposedApiEnabled
} from "../../../../services/extensions/common/extensions.js";
import {
  INotebookDocumentService
} from "../../../../services/notebook/common/notebookDocumentService.js";
import { InstallRecommendedExtensionAction } from "../../../extensions/browser/extensionsActions.js";
import { MergeEditorInput } from "../../../mergeEditor/browser/mergeEditorInput.js";
import { NotebookTextModel } from "../../common/model/notebookTextModel.js";
import {
  ACCESSIBLE_NOTEBOOK_DISPLAY_ORDER,
  CellUri,
  MimeTypeDisplayOrder,
  NOTEBOOK_DISPLAY_ORDER,
  NotebookEditorPriority,
  NotebookRendererMatch,
  NotebookSetting,
  RENDERER_EQUIVALENT_EXTENSIONS,
  RENDERER_NOT_AVAILABLE
} from "../../common/notebookCommon.js";
import { NotebookDiffEditorInput } from "../../common/notebookDiffEditorInput.js";
import { NotebookEditorInput } from "../../common/notebookEditorInput.js";
import { INotebookEditorModelResolverService } from "../../common/notebookEditorModelResolverService.js";
import {
  NotebookOutputRendererInfo,
  NotebookStaticPreloadInfo
} from "../../common/notebookOutputRenderer.js";
import {
  NotebookProviderInfo
} from "../../common/notebookProvider.js";
import {
  SimpleNotebookProviderInfo
} from "../../common/notebookService.js";
import { NotebookMultiDiffEditorInput } from "../diff/notebookMultiDiffEditorInput.js";
import {
  notebookPreloadExtensionPoint,
  notebookRendererExtensionPoint,
  notebooksExtensionPoint
} from "../notebookExtensionPoint.js";
let NotebookProviderInfoStore = class extends Disposable {
  constructor(storageService, extensionService, _editorResolverService, _configurationService, _accessibilityService, _instantiationService, _fileService, _notebookEditorModelResolverService, uriIdentService) {
    super();
    this._editorResolverService = _editorResolverService;
    this._configurationService = _configurationService;
    this._accessibilityService = _accessibilityService;
    this._instantiationService = _instantiationService;
    this._fileService = _fileService;
    this._notebookEditorModelResolverService = _notebookEditorModelResolverService;
    this.uriIdentService = uriIdentService;
    this._memento = new Memento(
      NotebookProviderInfoStore.CUSTOM_EDITORS_STORAGE_ID,
      storageService
    );
    const mementoObject = this._memento.getMemento(
      StorageScope.PROFILE,
      StorageTarget.MACHINE
    );
    this._editorResolverService.bufferChangeEvents(() => {
      for (const info of mementoObject[NotebookProviderInfoStore.CUSTOM_EDITORS_ENTRY_ID] || []) {
        this.add(new NotebookProviderInfo(info), false);
      }
    });
    this._register(
      extensionService.onDidRegisterExtensions(() => {
        if (!this._handled) {
          this._clear();
          mementoObject[NotebookProviderInfoStore.CUSTOM_EDITORS_ENTRY_ID] = [];
          this._memento.saveMemento();
        }
      })
    );
    notebooksExtensionPoint.setHandler(
      (extensions) => this._setupHandler(extensions)
    );
  }
  static {
    __name(this, "NotebookProviderInfoStore");
  }
  static CUSTOM_EDITORS_STORAGE_ID = "notebookEditors";
  static CUSTOM_EDITORS_ENTRY_ID = "editors";
  _memento;
  _handled = false;
  _contributedEditors = /* @__PURE__ */ new Map();
  _contributedEditorDisposables = this._register(
    new DisposableStore()
  );
  dispose() {
    this._clear();
    super.dispose();
  }
  _setupHandler(extensions) {
    this._handled = true;
    const builtins = [
      ...this._contributedEditors.values()
    ].filter((info) => !info.extension);
    this._clear();
    const builtinProvidersFromCache = /* @__PURE__ */ new Map();
    builtins.forEach((builtin) => {
      builtinProvidersFromCache.set(builtin.id, this.add(builtin));
    });
    for (const extension of extensions) {
      for (const notebookContribution of extension.value) {
        if (!notebookContribution.type) {
          extension.collector.error(
            `Notebook does not specify type-property`
          );
          continue;
        }
        const existing = this.get(notebookContribution.type);
        if (existing) {
          if (!existing.extension && extension.description.isBuiltin && builtins.find(
            (builtin) => builtin.id === notebookContribution.type
          )) {
            builtinProvidersFromCache.get(notebookContribution.type)?.dispose();
          } else {
            extension.collector.error(
              `Notebook type '${notebookContribution.type}' already used`
            );
            continue;
          }
        }
        this.add(
          new NotebookProviderInfo({
            extension: extension.description.identifier,
            id: notebookContribution.type,
            displayName: notebookContribution.displayName,
            selectors: notebookContribution.selector || [],
            priority: this._convertPriority(
              notebookContribution.priority
            ),
            providerDisplayName: extension.description.displayName ?? extension.description.identifier.value
          })
        );
      }
    }
    const mementoObject = this._memento.getMemento(
      StorageScope.PROFILE,
      StorageTarget.MACHINE
    );
    mementoObject[NotebookProviderInfoStore.CUSTOM_EDITORS_ENTRY_ID] = Array.from(this._contributedEditors.values());
    this._memento.saveMemento();
  }
  clearEditorCache() {
    const mementoObject = this._memento.getMemento(
      StorageScope.PROFILE,
      StorageTarget.MACHINE
    );
    mementoObject[NotebookProviderInfoStore.CUSTOM_EDITORS_ENTRY_ID] = [];
    this._memento.saveMemento();
  }
  _convertPriority(priority) {
    if (!priority) {
      return RegisteredEditorPriority.default;
    }
    if (priority === NotebookEditorPriority.default) {
      return RegisteredEditorPriority.default;
    }
    return RegisteredEditorPriority.option;
  }
  _registerContributionPoint(notebookProviderInfo) {
    const disposables = new DisposableStore();
    for (const selector of notebookProviderInfo.selectors) {
      const globPattern = selector.include || selector;
      const notebookEditorInfo = {
        id: notebookProviderInfo.id,
        label: notebookProviderInfo.displayName,
        detail: notebookProviderInfo.providerDisplayName,
        priority: notebookProviderInfo.priority
      };
      const notebookEditorOptions = {
        canHandleDiff: /* @__PURE__ */ __name(() => !!this._configurationService.getValue(
          NotebookSetting.textDiffEditorPreview
        ) && !this._accessibilityService.isScreenReaderOptimized(), "canHandleDiff"),
        canSupportResource: /* @__PURE__ */ __name((resource) => resource.scheme === Schemas.untitled || resource.scheme === Schemas.vscodeNotebookCell || this._fileService.hasProvider(resource), "canSupportResource")
      };
      const notebookEditorInputFactory = /* @__PURE__ */ __name(({
        resource,
        options
      }) => {
        const data = CellUri.parse(resource);
        let notebookUri;
        let cellOptions;
        let preferredResource = resource;
        if (data) {
          notebookUri = this.uriIdentService.asCanonicalUri(
            data.notebook
          );
          preferredResource = data.notebook;
          cellOptions = { resource, options };
        } else {
          notebookUri = this.uriIdentService.asCanonicalUri(resource);
        }
        if (!cellOptions) {
          cellOptions = options?.cellOptions;
        }
        const notebookOptions = {
          ...options,
          cellOptions,
          viewState: void 0
        };
        const editor = NotebookEditorInput.getOrCreate(
          this._instantiationService,
          notebookUri,
          preferredResource,
          notebookProviderInfo.id
        );
        return { editor, options: notebookOptions };
      }, "notebookEditorInputFactory");
      const notebookUntitledEditorFactory = /* @__PURE__ */ __name(async ({ resource, options }) => {
        const ref = await this._notebookEditorModelResolverService.resolve(
          { untitledResource: resource },
          notebookProviderInfo.id
        );
        ref.object.notebook.onWillDispose(() => {
          ref.dispose();
        });
        return {
          editor: NotebookEditorInput.getOrCreate(
            this._instantiationService,
            ref.object.resource,
            void 0,
            notebookProviderInfo.id
          ),
          options
        };
      }, "notebookUntitledEditorFactory");
      const notebookDiffEditorInputFactory = /* @__PURE__ */ __name((diffEditorInput, group) => {
        const { modified, original, label, description } = diffEditorInput;
        if (this._configurationService.getValue(
          "notebook.experimental.enableNewDiffEditor"
        )) {
          return {
            editor: NotebookMultiDiffEditorInput.create(
              this._instantiationService,
              modified.resource,
              label,
              description,
              original.resource,
              notebookProviderInfo.id
            )
          };
        }
        return {
          editor: NotebookDiffEditorInput.create(
            this._instantiationService,
            modified.resource,
            label,
            description,
            original.resource,
            notebookProviderInfo.id
          )
        };
      }, "notebookDiffEditorInputFactory");
      const mergeEditorInputFactory = /* @__PURE__ */ __name((mergeEditor) => {
        return {
          editor: this._instantiationService.createInstance(
            MergeEditorInput,
            mergeEditor.base.resource,
            {
              uri: mergeEditor.input1.resource,
              title: mergeEditor.input1.label ?? basename(mergeEditor.input1.resource),
              description: mergeEditor.input1.description ?? "",
              detail: mergeEditor.input1.detail
            },
            {
              uri: mergeEditor.input2.resource,
              title: mergeEditor.input2.label ?? basename(mergeEditor.input2.resource),
              description: mergeEditor.input2.description ?? "",
              detail: mergeEditor.input2.detail
            },
            mergeEditor.result.resource
          )
        };
      }, "mergeEditorInputFactory");
      const notebookFactoryObject = {
        createEditorInput: notebookEditorInputFactory,
        createDiffEditorInput: notebookDiffEditorInputFactory,
        createUntitledEditorInput: notebookUntitledEditorFactory,
        createMergeEditorInput: mergeEditorInputFactory
      };
      const notebookCellFactoryObject = {
        createEditorInput: notebookEditorInputFactory,
        createDiffEditorInput: notebookDiffEditorInputFactory
      };
      disposables.add(
        this._configurationService.onDidChangeConfiguration((e) => {
          if (e.affectsConfiguration(
            NotebookSetting.textDiffEditorPreview
          )) {
            const canHandleDiff = !!this._configurationService.getValue(
              NotebookSetting.textDiffEditorPreview
            ) && !this._accessibilityService.isScreenReaderOptimized();
            if (canHandleDiff) {
              notebookFactoryObject.createDiffEditorInput = notebookDiffEditorInputFactory;
              notebookCellFactoryObject.createDiffEditorInput = notebookDiffEditorInputFactory;
            } else {
              notebookFactoryObject.createDiffEditorInput = void 0;
              notebookCellFactoryObject.createDiffEditorInput = void 0;
            }
          }
        })
      );
      disposables.add(
        this._accessibilityService.onDidChangeScreenReaderOptimized(
          () => {
            const canHandleDiff = !!this._configurationService.getValue(
              NotebookSetting.textDiffEditorPreview
            ) && !this._accessibilityService.isScreenReaderOptimized();
            if (canHandleDiff) {
              notebookFactoryObject.createDiffEditorInput = notebookDiffEditorInputFactory;
              notebookCellFactoryObject.createDiffEditorInput = notebookDiffEditorInputFactory;
            } else {
              notebookFactoryObject.createDiffEditorInput = void 0;
              notebookCellFactoryObject.createDiffEditorInput = void 0;
            }
          }
        )
      );
      disposables.add(
        this._editorResolverService.registerEditor(
          globPattern,
          notebookEditorInfo,
          notebookEditorOptions,
          notebookFactoryObject
        )
      );
      disposables.add(
        this._editorResolverService.registerEditor(
          `${Schemas.vscodeNotebookCell}:/**/${globPattern}`,
          {
            ...notebookEditorInfo,
            priority: RegisteredEditorPriority.exclusive
          },
          notebookEditorOptions,
          notebookCellFactoryObject
        )
      );
    }
    return disposables;
  }
  _clear() {
    this._contributedEditors.clear();
    this._contributedEditorDisposables.clear();
  }
  get(viewType) {
    return this._contributedEditors.get(viewType);
  }
  add(info, saveMemento = true) {
    if (this._contributedEditors.has(info.id)) {
      throw new Error(`notebook type '${info.id}' ALREADY EXISTS`);
    }
    this._contributedEditors.set(info.id, info);
    let editorRegistration;
    if (info.extension) {
      editorRegistration = this._registerContributionPoint(info);
      this._contributedEditorDisposables.add(editorRegistration);
    }
    if (saveMemento) {
      const mementoObject = this._memento.getMemento(
        StorageScope.PROFILE,
        StorageTarget.MACHINE
      );
      mementoObject[NotebookProviderInfoStore.CUSTOM_EDITORS_ENTRY_ID] = Array.from(this._contributedEditors.values());
      this._memento.saveMemento();
    }
    return this._register(
      toDisposable(() => {
        const mementoObject = this._memento.getMemento(
          StorageScope.PROFILE,
          StorageTarget.MACHINE
        );
        mementoObject[NotebookProviderInfoStore.CUSTOM_EDITORS_ENTRY_ID] = Array.from(this._contributedEditors.values());
        this._memento.saveMemento();
        editorRegistration?.dispose();
        this._contributedEditors.delete(info.id);
      })
    );
  }
  getContributedNotebook(resource) {
    const result = [];
    for (const info of this._contributedEditors.values()) {
      if (info.matches(resource)) {
        result.push(info);
      }
    }
    if (result.length === 0 && resource.scheme === Schemas.untitled) {
      return Array.from(this._contributedEditors.values());
    }
    return result;
  }
  [Symbol.iterator]() {
    return this._contributedEditors.values();
  }
};
NotebookProviderInfoStore = __decorateClass([
  __decorateParam(0, IStorageService),
  __decorateParam(1, IExtensionService),
  __decorateParam(2, IEditorResolverService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, IAccessibilityService),
  __decorateParam(5, IInstantiationService),
  __decorateParam(6, IFileService),
  __decorateParam(7, INotebookEditorModelResolverService),
  __decorateParam(8, IUriIdentityService)
], NotebookProviderInfoStore);
let NotebookOutputRendererInfoStore = class {
  static {
    __name(this, "NotebookOutputRendererInfoStore");
  }
  contributedRenderers = /* @__PURE__ */ new Map();
  preferredMimetypeMemento;
  preferredMimetype = new Lazy(
    () => this.preferredMimetypeMemento.getMemento(
      StorageScope.WORKSPACE,
      StorageTarget.MACHINE
    )
  );
  constructor(storageService) {
    this.preferredMimetypeMemento = new Memento(
      "workbench.editor.notebook.preferredRenderer2",
      storageService
    );
  }
  clear() {
    this.contributedRenderers.clear();
  }
  get(rendererId) {
    return this.contributedRenderers.get(rendererId);
  }
  getAll() {
    return Array.from(this.contributedRenderers.values());
  }
  add(info) {
    if (this.contributedRenderers.has(info.id)) {
      return;
    }
    this.contributedRenderers.set(info.id, info);
  }
  /** Update and remember the preferred renderer for the given mimetype in this workspace */
  setPreferred(notebookProviderInfo, mimeType, rendererId) {
    const mementoObj = this.preferredMimetype.value;
    const forNotebook = mementoObj[notebookProviderInfo.id];
    if (forNotebook) {
      forNotebook[mimeType] = rendererId;
    } else {
      mementoObj[notebookProviderInfo.id] = { [mimeType]: rendererId };
    }
    this.preferredMimetypeMemento.saveMemento();
  }
  findBestRenderers(notebookProviderInfo, mimeType, kernelProvides) {
    let ReuseOrder;
    ((ReuseOrder2) => {
      ReuseOrder2[ReuseOrder2["PreviouslySelected"] = 256] = "PreviouslySelected";
      ReuseOrder2[ReuseOrder2["SameExtensionAsNotebook"] = 512] = "SameExtensionAsNotebook";
      ReuseOrder2[ReuseOrder2["OtherRenderer"] = 768] = "OtherRenderer";
      ReuseOrder2[ReuseOrder2["BuiltIn"] = 1024] = "BuiltIn";
    })(ReuseOrder || (ReuseOrder = {}));
    const preferred = notebookProviderInfo && this.preferredMimetype.value[notebookProviderInfo.id]?.[mimeType];
    const notebookExtId = notebookProviderInfo?.extension?.value;
    const notebookId = notebookProviderInfo?.id;
    const renderers = Array.from(this.contributedRenderers.values()).map((renderer) => {
      const ownScore = kernelProvides === void 0 ? renderer.matchesWithoutKernel(mimeType) : renderer.matches(mimeType, kernelProvides);
      if (ownScore === NotebookRendererMatch.Never) {
        return void 0;
      }
      const rendererExtId = renderer.extensionId.value;
      const reuseScore = preferred === renderer.id ? 256 /* PreviouslySelected */ : rendererExtId === notebookExtId || RENDERER_EQUIVALENT_EXTENSIONS.get(
        rendererExtId
      )?.has(notebookId) ? 512 /* SameExtensionAsNotebook */ : renderer.isBuiltin ? 1024 /* BuiltIn */ : 768 /* OtherRenderer */;
      return {
        ordered: {
          mimeType,
          rendererId: renderer.id,
          isTrusted: true
        },
        score: reuseScore | ownScore
      };
    }).filter(isDefined);
    if (renderers.length === 0) {
      return [
        {
          mimeType,
          rendererId: RENDERER_NOT_AVAILABLE,
          isTrusted: true
        }
      ];
    }
    return renderers.sort((a, b) => a.score - b.score).map((r) => r.ordered);
  }
};
NotebookOutputRendererInfoStore = __decorateClass([
  __decorateParam(0, IStorageService)
], NotebookOutputRendererInfoStore);
class ModelData {
  constructor(model, onWillDispose) {
    this.model = model;
    this._modelEventListeners.add(
      model.onWillDispose(() => onWillDispose(model))
    );
  }
  static {
    __name(this, "ModelData");
  }
  _modelEventListeners = new DisposableStore();
  get uri() {
    return this.model.uri;
  }
  getCellIndex(cellUri) {
    return this.model.cells.findIndex((cell) => isEqual(cell.uri, cellUri));
  }
  dispose() {
    this._modelEventListeners.dispose();
  }
}
let NotebookService = class extends Disposable {
  constructor(_extensionService, _configurationService, _accessibilityService, _instantiationService, _storageService, _notebookDocumentService) {
    super();
    this._extensionService = _extensionService;
    this._configurationService = _configurationService;
    this._accessibilityService = _accessibilityService;
    this._instantiationService = _instantiationService;
    this._storageService = _storageService;
    this._notebookDocumentService = _notebookDocumentService;
    notebookRendererExtensionPoint.setHandler((renderers) => {
      this._notebookRenderersInfoStore.clear();
      for (const extension of renderers) {
        for (const notebookContribution of extension.value) {
          if (!notebookContribution.entrypoint) {
            extension.collector.error(
              `Notebook renderer does not specify entry point`
            );
            continue;
          }
          const id = notebookContribution.id;
          if (!id) {
            extension.collector.error(
              `Notebook renderer does not specify id-property`
            );
            continue;
          }
          this._notebookRenderersInfoStore.add(
            new NotebookOutputRendererInfo({
              id,
              extension: extension.description,
              entrypoint: notebookContribution.entrypoint,
              displayName: notebookContribution.displayName,
              mimeTypes: notebookContribution.mimeTypes || [],
              dependencies: notebookContribution.dependencies,
              optionalDependencies: notebookContribution.optionalDependencies,
              requiresMessaging: notebookContribution.requiresMessaging
            })
          );
        }
      }
      this._onDidChangeOutputRenderers.fire();
    });
    notebookPreloadExtensionPoint.setHandler((extensions) => {
      this._notebookStaticPreloadInfoStore.clear();
      for (const extension of extensions) {
        if (!isProposedApiEnabled(
          extension.description,
          "contribNotebookStaticPreloads"
        )) {
          continue;
        }
        for (const notebookContribution of extension.value) {
          if (!notebookContribution.entrypoint) {
            extension.collector.error(
              `Notebook preload does not specify entry point`
            );
            continue;
          }
          const type = notebookContribution.type;
          if (!type) {
            extension.collector.error(
              `Notebook preload does not specify type-property`
            );
            continue;
          }
          this._notebookStaticPreloadInfoStore.add(
            new NotebookStaticPreloadInfo({
              type,
              extension: extension.description,
              entrypoint: notebookContribution.entrypoint,
              localResourceRoots: notebookContribution.localResourceRoots ?? []
            })
          );
        }
      }
    });
    const updateOrder = /* @__PURE__ */ __name(() => {
      this._displayOrder = new MimeTypeDisplayOrder(
        this._configurationService.getValue(
          NotebookSetting.displayOrder
        ) || [],
        this._accessibilityService.isScreenReaderOptimized() ? ACCESSIBLE_NOTEBOOK_DISPLAY_ORDER : NOTEBOOK_DISPLAY_ORDER
      );
    }, "updateOrder");
    updateOrder();
    this._register(
      this._configurationService.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration(NotebookSetting.displayOrder)) {
          updateOrder();
        }
      })
    );
    this._register(
      this._accessibilityService.onDidChangeScreenReaderOptimized(() => {
        updateOrder();
      })
    );
    this._memento = new Memento(
      NotebookService._storageNotebookViewTypeProvider,
      this._storageService
    );
    this._viewTypeCache = this._memento.getMemento(
      StorageScope.WORKSPACE,
      StorageTarget.MACHINE
    );
  }
  static {
    __name(this, "NotebookService");
  }
  static _storageNotebookViewTypeProvider = "notebook.viewTypeProvider";
  _memento;
  _viewTypeCache;
  _notebookProviders = /* @__PURE__ */ new Map();
  _notebookProviderInfoStore = void 0;
  get notebookProviderInfoStore() {
    if (!this._notebookProviderInfoStore) {
      this._notebookProviderInfoStore = this._register(
        this._instantiationService.createInstance(
          NotebookProviderInfoStore
        )
      );
    }
    return this._notebookProviderInfoStore;
  }
  _notebookRenderersInfoStore = this._instantiationService.createInstance(
    NotebookOutputRendererInfoStore
  );
  _onDidChangeOutputRenderers = this._register(
    new Emitter()
  );
  onDidChangeOutputRenderers = this._onDidChangeOutputRenderers.event;
  _notebookStaticPreloadInfoStore = /* @__PURE__ */ new Set();
  _models = new ResourceMap();
  _onWillAddNotebookDocument = this._register(
    new Emitter()
  );
  _onDidAddNotebookDocument = this._register(
    new Emitter()
  );
  _onWillRemoveNotebookDocument = this._register(
    new Emitter()
  );
  _onDidRemoveNotebookDocument = this._register(
    new Emitter()
  );
  onWillAddNotebookDocument = this._onWillAddNotebookDocument.event;
  onDidAddNotebookDocument = this._onDidAddNotebookDocument.event;
  onDidRemoveNotebookDocument = this._onDidRemoveNotebookDocument.event;
  onWillRemoveNotebookDocument = this._onWillRemoveNotebookDocument.event;
  _onAddViewType = this._register(new Emitter());
  onAddViewType = this._onAddViewType.event;
  _onWillRemoveViewType = this._register(
    new Emitter()
  );
  onWillRemoveViewType = this._onWillRemoveViewType.event;
  _onDidChangeEditorTypes = this._register(
    new Emitter()
  );
  onDidChangeEditorTypes = this._onDidChangeEditorTypes.event;
  _cutItems;
  _lastClipboardIsCopy = true;
  _displayOrder;
  getEditorTypes() {
    return [...this.notebookProviderInfoStore].map((info) => ({
      id: info.id,
      displayName: info.displayName,
      providerDisplayName: info.providerDisplayName
    }));
  }
  clearEditorCache() {
    this.notebookProviderInfoStore.clearEditorCache();
  }
  _postDocumentOpenActivation(viewType) {
    this._extensionService.activateByEvent(`onNotebook:${viewType}`);
    this._extensionService.activateByEvent(`onNotebook:*`);
  }
  async canResolve(viewType) {
    if (this._notebookProviders.has(viewType)) {
      return true;
    }
    await this._extensionService.whenInstalledExtensionsRegistered();
    await this._extensionService.activateByEvent(
      `onNotebookSerializer:${viewType}`
    );
    return this._notebookProviders.has(viewType);
  }
  registerContributedNotebookType(viewType, data) {
    const info = new NotebookProviderInfo({
      extension: data.extension,
      id: viewType,
      displayName: data.displayName,
      providerDisplayName: data.providerDisplayName,
      priority: data.priority || RegisteredEditorPriority.default,
      selectors: []
    });
    info.update({ selectors: data.filenamePattern });
    const reg = this.notebookProviderInfoStore.add(info);
    this._onDidChangeEditorTypes.fire();
    return toDisposable(() => {
      reg.dispose();
      this._onDidChangeEditorTypes.fire();
    });
  }
  _registerProviderData(viewType, data) {
    if (this._notebookProviders.has(viewType)) {
      throw new Error(
        `notebook provider for viewtype '${viewType}' already exists`
      );
    }
    this._notebookProviders.set(viewType, data);
    this._onAddViewType.fire(viewType);
    return toDisposable(() => {
      this._onWillRemoveViewType.fire(viewType);
      this._notebookProviders.delete(viewType);
    });
  }
  registerNotebookSerializer(viewType, extensionData, serializer) {
    this.notebookProviderInfoStore.get(viewType)?.update({ options: serializer.options });
    this._viewTypeCache[viewType] = extensionData.id.value;
    this._persistMementos();
    return this._registerProviderData(
      viewType,
      new SimpleNotebookProviderInfo(viewType, serializer, extensionData)
    );
  }
  async withNotebookDataProvider(viewType) {
    const selected = this.notebookProviderInfoStore.get(viewType);
    if (!selected) {
      const knownProvider = this.getViewTypeProvider(viewType);
      const actions = knownProvider ? [
        toAction({
          id: "workbench.notebook.action.installMissingViewType",
          label: localize(
            "notebookOpenInstallMissingViewType",
            "Install extension for '{0}'",
            viewType
          ),
          run: /* @__PURE__ */ __name(async () => {
            await this._instantiationService.createInstance(
              InstallRecommendedExtensionAction,
              knownProvider
            ).run();
          }, "run")
        })
      ] : [];
      throw createErrorWithActions(
        `UNKNOWN notebook type '${viewType}'`,
        actions
      );
    }
    await this.canResolve(selected.id);
    const result = this._notebookProviders.get(selected.id);
    if (!result) {
      throw new Error(
        `NO provider registered for view type: '${selected.id}'`
      );
    }
    return result;
  }
  tryGetDataProviderSync(viewType) {
    const selected = this.notebookProviderInfoStore.get(viewType);
    if (!selected) {
      return void 0;
    }
    return this._notebookProviders.get(selected.id);
  }
  _persistMementos() {
    this._memento.saveMemento();
  }
  getViewTypeProvider(viewType) {
    return this._viewTypeCache[viewType];
  }
  getRendererInfo(rendererId) {
    return this._notebookRenderersInfoStore.get(rendererId);
  }
  updateMimePreferredRenderer(viewType, mimeType, rendererId, otherMimetypes) {
    const info = this.notebookProviderInfoStore.get(viewType);
    if (info) {
      this._notebookRenderersInfoStore.setPreferred(
        info,
        mimeType,
        rendererId
      );
    }
    this._displayOrder.prioritize(mimeType, otherMimetypes);
  }
  saveMimeDisplayOrder(target) {
    this._configurationService.updateValue(
      NotebookSetting.displayOrder,
      this._displayOrder.toArray(),
      target
    );
  }
  getRenderers() {
    return this._notebookRenderersInfoStore.getAll();
  }
  *getStaticPreloads(viewType) {
    for (const preload of this._notebookStaticPreloadInfoStore) {
      if (preload.type === viewType) {
        yield preload;
      }
    }
  }
  // --- notebook documents: create, destory, retrieve, enumerate
  async createNotebookTextModel(viewType, uri, stream) {
    if (this._models.has(uri)) {
      throw new Error(`notebook for ${uri} already exists`);
    }
    const info = await this.withNotebookDataProvider(viewType);
    if (!(info instanceof SimpleNotebookProviderInfo)) {
      throw new Error("CANNOT open file notebook with this provider");
    }
    const bytes = stream ? await streamToBuffer(stream) : VSBuffer.fromByteArray([]);
    const data = await info.serializer.dataToNotebook(bytes);
    const notebookModel = this._instantiationService.createInstance(
      NotebookTextModel,
      info.viewType,
      uri,
      data.cells,
      data.metadata,
      info.serializer.options
    );
    const modelData = new ModelData(
      notebookModel,
      this._onWillDisposeDocument.bind(this)
    );
    this._models.set(uri, modelData);
    this._notebookDocumentService.addNotebookDocument(modelData);
    this._onWillAddNotebookDocument.fire(notebookModel);
    this._onDidAddNotebookDocument.fire(notebookModel);
    this._postDocumentOpenActivation(info.viewType);
    return notebookModel;
  }
  getNotebookTextModel(uri) {
    return this._models.get(uri)?.model;
  }
  getNotebookTextModels() {
    return Iterable.map(this._models.values(), (data) => data.model);
  }
  listNotebookDocuments() {
    return [...this._models].map((e) => e[1].model);
  }
  _onWillDisposeDocument(model) {
    const modelData = this._models.get(model.uri);
    if (modelData) {
      this._onWillRemoveNotebookDocument.fire(modelData.model);
      this._models.delete(model.uri);
      this._notebookDocumentService.removeNotebookDocument(modelData);
      modelData.dispose();
      this._onDidRemoveNotebookDocument.fire(modelData.model);
    }
  }
  getOutputMimeTypeInfo(textModel, kernelProvides, output) {
    const sorted = this._displayOrder.sort(
      new Set(output.outputs.map((op) => op.mime))
    );
    const notebookProviderInfo = this.notebookProviderInfoStore.get(
      textModel.viewType
    );
    return sorted.flatMap(
      (mimeType) => this._notebookRenderersInfoStore.findBestRenderers(
        notebookProviderInfo,
        mimeType,
        kernelProvides
      )
    ).sort(
      (a, b) => (a.rendererId === RENDERER_NOT_AVAILABLE ? 1 : 0) - (b.rendererId === RENDERER_NOT_AVAILABLE ? 1 : 0)
    );
  }
  getContributedNotebookTypes(resource) {
    if (resource) {
      return this.notebookProviderInfoStore.getContributedNotebook(
        resource
      );
    }
    return [...this.notebookProviderInfoStore];
  }
  getContributedNotebookType(viewType) {
    return this.notebookProviderInfoStore.get(viewType);
  }
  getNotebookProviderResourceRoots() {
    const ret = [];
    this._notebookProviders.forEach((val) => {
      if (val.extensionData.location) {
        ret.push(URI.revive(val.extensionData.location));
      }
    });
    return ret;
  }
  // --- copy & paste
  setToCopy(items, isCopy) {
    this._cutItems = items;
    this._lastClipboardIsCopy = isCopy;
  }
  getToCopy() {
    if (this._cutItems) {
      return { items: this._cutItems, isCopy: this._lastClipboardIsCopy };
    }
    return void 0;
  }
};
NotebookService = __decorateClass([
  __decorateParam(0, IExtensionService),
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IAccessibilityService),
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IStorageService),
  __decorateParam(5, INotebookDocumentService)
], NotebookService);
export {
  NotebookOutputRendererInfoStore,
  NotebookProviderInfoStore,
  NotebookService
};
//# sourceMappingURL=notebookServiceImpl.js.map
