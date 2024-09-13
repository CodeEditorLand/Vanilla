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
import { LazyStatefulPromise, raceTimeout } from "../../../../base/common/async.js";
import { BugIndicatingError, onUnexpectedError } from "../../../../base/common/errors.js";
import { Event, ValueWithChangeEvent } from "../../../../base/common/event.js";
import { IMarkdownString } from "../../../../base/common/htmlContent.js";
import { Disposable, DisposableStore, IDisposable, IReference } from "../../../../base/common/lifecycle.js";
import { parse } from "../../../../base/common/marshalling.js";
import { Schemas } from "../../../../base/common/network.js";
import { deepClone } from "../../../../base/common/objects.js";
import { ObservableLazyPromise, ValueWithChangeEventFromObservable, autorun, constObservable, derived, mapObservableArrayCached, observableFromEvent, observableFromValueWithChangeEvent, observableValue, recomputeInitiallyAndOnChange } from "../../../../base/common/observable.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { isDefined, isObject } from "../../../../base/common/types.js";
import { URI } from "../../../../base/common/uri.js";
import { RefCounted } from "../../../../editor/browser/widget/diffEditor/utils.js";
import { IDocumentDiffItem, IMultiDiffEditorModel } from "../../../../editor/browser/widget/multiDiffEditor/model.js";
import { MultiDiffEditorViewModel } from "../../../../editor/browser/widget/multiDiffEditor/multiDiffEditorViewModel.js";
import { IDiffEditorOptions } from "../../../../editor/common/config/editorOptions.js";
import { IResolvedTextEditorModel, ITextModelService } from "../../../../editor/common/services/resolverService.js";
import { ITextResourceConfigurationService } from "../../../../editor/common/services/textResourceConfiguration.js";
import { localize } from "../../../../nls.js";
import { ConfirmResult } from "../../../../platform/dialogs/common/dialogs.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IEditorConfiguration } from "../../../browser/parts/editor/textEditor.js";
import { DEFAULT_EDITOR_ASSOCIATION, EditorInputCapabilities, EditorInputWithOptions, GroupIdentifier, IEditorSerializer, IResourceMultiDiffEditorInput, IRevertOptions, ISaveOptions, IUntypedEditorInput } from "../../../common/editor.js";
import { EditorInput, IEditorCloseHandler } from "../../../common/editor/editorInput.js";
import { IEditorResolverService, RegisteredEditorPriority } from "../../../services/editor/common/editorResolverService.js";
import { ILanguageSupport, ITextFileEditorModel, ITextFileService } from "../../../services/textfile/common/textfiles.js";
import { MultiDiffEditorIcon } from "./icons.contribution.js";
import { IMultiDiffSourceResolverService, IResolvedMultiDiffSource, MultiDiffEditorItem } from "./multiDiffSourceResolverService.js";
let MultiDiffEditorInput = class extends EditorInput {
  constructor(multiDiffSource, label, initialResources, isTransient = false, _textModelService, _textResourceConfigurationService, _instantiationService, _multiDiffSourceResolverService, _textFileService) {
    super();
    this.multiDiffSource = multiDiffSource;
    this.label = label;
    this.initialResources = initialResources;
    this.isTransient = isTransient;
    this._textModelService = _textModelService;
    this._textResourceConfigurationService = _textResourceConfigurationService;
    this._instantiationService = _instantiationService;
    this._multiDiffSourceResolverService = _multiDiffSourceResolverService;
    this._textFileService = _textFileService;
    this._register(autorun((reader) => {
      const resources = this.resources.read(reader);
      const label2 = this.label ?? localize("name", "Multi Diff Editor");
      if (resources) {
        this._name = label2 + localize({
          key: "files",
          comment: ["the number of files being shown"]
        }, " ({0} files)", resources.length);
      } else {
        this._name = label2;
      }
      this._onDidChangeLabel.fire();
    }));
  }
  static {
    __name(this, "MultiDiffEditorInput");
  }
  static fromResourceMultiDiffEditorInput(input, instantiationService) {
    if (!input.multiDiffSource && !input.resources) {
      throw new BugIndicatingError("MultiDiffEditorInput requires either multiDiffSource or resources");
    }
    const multiDiffSource = input.multiDiffSource ?? URI.parse(`multi-diff-editor:${(/* @__PURE__ */ new Date()).getMilliseconds().toString() + Math.random().toString()}`);
    return instantiationService.createInstance(
      MultiDiffEditorInput,
      multiDiffSource,
      input.label,
      input.resources?.map((resource) => {
        return new MultiDiffEditorItem(
          resource.original.resource,
          resource.modified.resource,
          resource.goToFileResource
        );
      }),
      input.isTransient ?? false
    );
  }
  static fromSerialized(data, instantiationService) {
    return instantiationService.createInstance(
      MultiDiffEditorInput,
      URI.parse(data.multiDiffSourceUri),
      data.label,
      data.resources?.map((resource) => new MultiDiffEditorItem(
        resource.originalUri ? URI.parse(resource.originalUri) : void 0,
        resource.modifiedUri ? URI.parse(resource.modifiedUri) : void 0,
        resource.goToFileUri ? URI.parse(resource.goToFileUri) : void 0
      )),
      false
    );
  }
  static ID = "workbench.input.multiDiffEditor";
  get resource() {
    return this.multiDiffSource;
  }
  get capabilities() {
    return EditorInputCapabilities.Readonly;
  }
  get typeId() {
    return MultiDiffEditorInput.ID;
  }
  _name = "";
  getName() {
    return this._name;
  }
  get editorId() {
    return DEFAULT_EDITOR_ASSOCIATION.id;
  }
  getIcon() {
    return MultiDiffEditorIcon;
  }
  serialize() {
    return {
      label: this.label,
      multiDiffSourceUri: this.multiDiffSource.toString(),
      resources: this.initialResources?.map((resource) => ({
        originalUri: resource.originalUri?.toString(),
        modifiedUri: resource.modifiedUri?.toString(),
        goToFileUri: resource.goToFileUri?.toString()
      }))
    };
  }
  setLanguageId(languageId, source) {
    const activeDiffItem = this._viewModel.requireValue().activeDiffItem.get();
    const value = activeDiffItem?.documentDiffItem;
    if (!value) {
      return;
    }
    const target = value.modified ?? value.original;
    if (!target) {
      return;
    }
    target.setLanguage(languageId, source);
  }
  async getViewModel() {
    return this._viewModel.getPromise();
  }
  _viewModel = new LazyStatefulPromise(async () => {
    const model = await this._createModel();
    this._register(model);
    const vm = new MultiDiffEditorViewModel(model, this._instantiationService);
    this._register(vm);
    await raceTimeout(vm.waitForDiffs(), 1e3);
    return vm;
  });
  async _createModel() {
    const source = await this._resolvedSource.getPromise();
    const textResourceConfigurationService = this._textResourceConfigurationService;
    const documentsWithPromises = mapObservableArrayCached(this, source.resources, async (r, store) => {
      let original;
      let modified;
      const multiDiffItemStore = new DisposableStore();
      try {
        [original, modified] = await Promise.all([
          r.originalUri ? this._textModelService.createModelReference(r.originalUri) : void 0,
          r.modifiedUri ? this._textModelService.createModelReference(r.modifiedUri) : void 0
        ]);
        if (original) {
          multiDiffItemStore.add(original);
        }
        if (modified) {
          multiDiffItemStore.add(modified);
        }
      } catch (e) {
        console.error(e);
        onUnexpectedError(e);
        return void 0;
      }
      const uri = r.modifiedUri ?? r.originalUri;
      const result2 = {
        multiDiffEditorItem: r,
        original: original?.object.textEditorModel,
        modified: modified?.object.textEditorModel,
        contextKeys: r.contextKeys,
        get options() {
          return {
            ...getReadonlyConfiguration(modified?.object.isReadonly() ?? true),
            ...computeOptions(textResourceConfigurationService.getValue(uri))
          };
        },
        onOptionsDidChange: /* @__PURE__ */ __name((h) => this._textResourceConfigurationService.onDidChangeConfiguration((e) => {
          if (e.affectsConfiguration(uri, "editor") || e.affectsConfiguration(uri, "diffEditor")) {
            h();
          }
        }), "onOptionsDidChange")
      };
      return store.add(RefCounted.createOfNonDisposable(result2, multiDiffItemStore, this));
    }, (i) => JSON.stringify([i.modifiedUri?.toString(), i.originalUri?.toString()]));
    const documents = observableValue("documents", "loading");
    const updateDocuments = derived(async (reader) => {
      const docsPromises = documentsWithPromises.read(reader);
      const docs = await Promise.all(docsPromises);
      const newDocuments = docs.filter(isDefined);
      documents.set(newDocuments, void 0);
    });
    const a = recomputeInitiallyAndOnChange(updateDocuments);
    await updateDocuments.get();
    const result = {
      dispose: /* @__PURE__ */ __name(() => a.dispose(), "dispose"),
      documents: new ValueWithChangeEventFromObservable(documents),
      contextKeys: source.source?.contextKeys
    };
    return result;
  }
  _resolvedSource = new ObservableLazyPromise(async () => {
    const source = this.initialResources ? { resources: ValueWithChangeEvent.const(this.initialResources) } : await this._multiDiffSourceResolverService.resolve(this.multiDiffSource);
    return {
      source,
      resources: source ? observableFromValueWithChangeEvent(this, source.resources) : constObservable([])
    };
  });
  matches(otherInput) {
    if (super.matches(otherInput)) {
      return true;
    }
    if (otherInput instanceof MultiDiffEditorInput) {
      return this.multiDiffSource.toString() === otherInput.multiDiffSource.toString();
    }
    return false;
  }
  resources = derived(this, (reader) => this._resolvedSource.cachedPromiseResult.read(reader)?.data?.resources.read(reader));
  textFileServiceOnDidChange = new FastEventDispatcher(
    this._textFileService.files.onDidChangeDirty,
    (item) => item.resource.toString(),
    (uri) => uri.toString()
  );
  _isDirtyObservables = mapObservableArrayCached(this, this.resources.map((r) => r ?? []), (res) => {
    const isModifiedDirty = res.modifiedUri ? isUriDirty(this.textFileServiceOnDidChange, this._textFileService, res.modifiedUri) : constObservable(false);
    const isOriginalDirty = res.originalUri ? isUriDirty(this.textFileServiceOnDidChange, this._textFileService, res.originalUri) : constObservable(false);
    return derived((reader) => (
      /** @description modifiedDirty||originalDirty */
      isModifiedDirty.read(reader) || isOriginalDirty.read(reader)
    ));
  }, (i) => i.getKey());
  _isDirtyObservable = derived(this, (reader) => this._isDirtyObservables.read(reader).some((isDirty) => isDirty.read(reader))).keepObserved(this._store);
  onDidChangeDirty = Event.fromObservableLight(this._isDirtyObservable);
  isDirty() {
    return this._isDirtyObservable.get();
  }
  async save(group, options) {
    await this.doSaveOrRevert("save", group, options);
    return this;
  }
  revert(group, options) {
    return this.doSaveOrRevert("revert", group, options);
  }
  async doSaveOrRevert(mode, group, options) {
    const items = this._viewModel.currentValue?.items.get();
    if (items) {
      await Promise.all(items.map(async (item) => {
        const model = item.diffEditorViewModel.model;
        const handleOriginal = model.original.uri.scheme !== Schemas.untitled && this._textFileService.isDirty(model.original.uri);
        await Promise.all([
          handleOriginal ? mode === "save" ? this._textFileService.save(model.original.uri, options) : this._textFileService.revert(model.original.uri, options) : Promise.resolve(),
          mode === "save" ? this._textFileService.save(model.modified.uri, options) : this._textFileService.revert(model.modified.uri, options)
        ]);
      }));
    }
    return void 0;
  }
  closeHandler = {
    // TODO@bpasero TODO@hediet this is a workaround for
    // not having a better way to figure out if the
    // editors this input wraps around are opened or not
    async confirm() {
      return ConfirmResult.DONT_SAVE;
    },
    showConfirm() {
      return false;
    }
  };
};
MultiDiffEditorInput = __decorateClass([
  __decorateParam(4, ITextModelService),
  __decorateParam(5, ITextResourceConfigurationService),
  __decorateParam(6, IInstantiationService),
  __decorateParam(7, IMultiDiffSourceResolverService),
  __decorateParam(8, ITextFileService)
], MultiDiffEditorInput);
class FastEventDispatcher {
  constructor(_event, _getEventArgsKey, _keyToString) {
    this._event = _event;
    this._getEventArgsKey = _getEventArgsKey;
    this._keyToString = _keyToString;
  }
  static {
    __name(this, "FastEventDispatcher");
  }
  _count = 0;
  _buckets = /* @__PURE__ */ new Map();
  _eventSubscription;
  filteredEvent(filter) {
    return (listener) => {
      const key = this._keyToString(filter);
      let bucket = this._buckets.get(key);
      if (!bucket) {
        bucket = /* @__PURE__ */ new Set();
        this._buckets.set(key, bucket);
      }
      bucket.add(listener);
      this._count++;
      if (this._count === 1) {
        this._eventSubscription = this._event(this._handleEventChange);
      }
      return {
        dispose: /* @__PURE__ */ __name(() => {
          bucket.delete(listener);
          if (bucket.size === 0) {
            this._buckets.delete(key);
          }
          this._count--;
          if (this._count === 0) {
            this._eventSubscription?.dispose();
            this._eventSubscription = void 0;
          }
        }, "dispose")
      };
    };
  }
  _handleEventChange = /* @__PURE__ */ __name((e) => {
    const key = this._getEventArgsKey(e);
    const bucket = this._buckets.get(key);
    if (bucket) {
      for (const listener of bucket) {
        listener(e);
      }
    }
  }, "_handleEventChange");
}
function isUriDirty(onDidChangeDirty, textFileService, uri) {
  return observableFromEvent(onDidChangeDirty.filteredEvent(uri), () => textFileService.isDirty(uri));
}
__name(isUriDirty, "isUriDirty");
function getReadonlyConfiguration(isReadonly) {
  return {
    readOnly: !!isReadonly,
    readOnlyMessage: typeof isReadonly !== "boolean" ? isReadonly : void 0
  };
}
__name(getReadonlyConfiguration, "getReadonlyConfiguration");
function computeOptions(configuration) {
  const editorConfiguration = deepClone(configuration.editor);
  if (isObject(configuration.diffEditor)) {
    const diffEditorConfiguration = deepClone(configuration.diffEditor);
    diffEditorConfiguration.diffCodeLens = diffEditorConfiguration.codeLens;
    delete diffEditorConfiguration.codeLens;
    diffEditorConfiguration.diffWordWrap = diffEditorConfiguration.wordWrap;
    delete diffEditorConfiguration.wordWrap;
    Object.assign(editorConfiguration, diffEditorConfiguration);
  }
  return editorConfiguration;
}
__name(computeOptions, "computeOptions");
let MultiDiffEditorResolverContribution = class extends Disposable {
  static {
    __name(this, "MultiDiffEditorResolverContribution");
  }
  static ID = "workbench.contrib.multiDiffEditorResolver";
  constructor(editorResolverService, instantiationService) {
    super();
    this._register(editorResolverService.registerEditor(
      `*`,
      {
        id: DEFAULT_EDITOR_ASSOCIATION.id,
        label: DEFAULT_EDITOR_ASSOCIATION.displayName,
        detail: DEFAULT_EDITOR_ASSOCIATION.providerDisplayName,
        priority: RegisteredEditorPriority.builtin
      },
      {},
      {
        createMultiDiffEditorInput: /* @__PURE__ */ __name((multiDiffEditor) => {
          return {
            editor: MultiDiffEditorInput.fromResourceMultiDiffEditorInput(multiDiffEditor, instantiationService)
          };
        }, "createMultiDiffEditorInput")
      }
    ));
  }
};
MultiDiffEditorResolverContribution = __decorateClass([
  __decorateParam(0, IEditorResolverService),
  __decorateParam(1, IInstantiationService)
], MultiDiffEditorResolverContribution);
class MultiDiffEditorSerializer {
  static {
    __name(this, "MultiDiffEditorSerializer");
  }
  canSerialize(editor) {
    return editor instanceof MultiDiffEditorInput && !editor.isTransient;
  }
  serialize(editor) {
    if (!this.canSerialize(editor)) {
      return void 0;
    }
    return JSON.stringify(editor.serialize());
  }
  deserialize(instantiationService, serializedEditor) {
    try {
      const data = parse(serializedEditor);
      return MultiDiffEditorInput.fromSerialized(data, instantiationService);
    } catch (err) {
      onUnexpectedError(err);
      return void 0;
    }
  }
}
export {
  MultiDiffEditorInput,
  MultiDiffEditorResolverContribution,
  MultiDiffEditorSerializer
};
//# sourceMappingURL=multiDiffEditorInput.js.map
