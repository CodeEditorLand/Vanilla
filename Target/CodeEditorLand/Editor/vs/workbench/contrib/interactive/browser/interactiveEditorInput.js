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
import { Event } from "../../../../base/common/event.js";
import { IReference } from "../../../../base/common/lifecycle.js";
import * as paths from "../../../../base/common/path.js";
import { isEqual, joinPath } from "../../../../base/common/resources.js";
import { URI } from "../../../../base/common/uri.js";
import { PLAINTEXT_LANGUAGE_ID } from "../../../../editor/common/languages/modesRegistry.js";
import { IResolvedTextEditorModel, ITextModelService } from "../../../../editor/common/services/resolverService.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IFileDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { EditorInputCapabilities, GroupIdentifier, IRevertOptions, ISaveOptions, IUntypedEditorInput } from "../../../common/editor.js";
import { EditorInput } from "../../../common/editor/editorInput.js";
import { IInteractiveDocumentService } from "./interactiveDocumentService.js";
import { IInteractiveHistoryService } from "./interactiveHistoryService.js";
import { IResolvedNotebookEditorModel, NotebookSetting } from "../../notebook/common/notebookCommon.js";
import { ICompositeNotebookEditorInput, NotebookEditorInput } from "../../notebook/common/notebookEditorInput.js";
import { INotebookService } from "../../notebook/common/notebookService.js";
let InteractiveEditorInput = class extends EditorInput {
  constructor(resource, inputResource, title, languageId, instantiationService, textModelService, interactiveDocumentService, historyService, _notebookService, _fileDialogService, configurationService) {
    const input = NotebookEditorInput.getOrCreate(instantiationService, resource, void 0, "interactive", {});
    super();
    this._notebookService = _notebookService;
    this._fileDialogService = _fileDialogService;
    this.isScratchpad = configurationService.getValue(NotebookSetting.InteractiveWindowPromptToSave) !== true;
    this._notebookEditorInput = input;
    this._register(this._notebookEditorInput);
    this.name = title ?? InteractiveEditorInput.windowNames[resource.path] ?? paths.basename(resource.path, paths.extname(resource.path));
    this._initLanguage = languageId;
    this._resource = resource;
    this._inputResource = inputResource;
    this._inputResolver = null;
    this._editorModelReference = null;
    this._inputModelRef = null;
    this._textModelService = textModelService;
    this._interactiveDocumentService = interactiveDocumentService;
    this._historyService = historyService;
    this._registerListeners();
  }
  static {
    __name(this, "InteractiveEditorInput");
  }
  static create(instantiationService, resource, inputResource, title, language) {
    return instantiationService.createInstance(InteractiveEditorInput, resource, inputResource, title, language);
  }
  static windowNames = {};
  static setName(notebookUri, title) {
    if (title) {
      this.windowNames[notebookUri.path] = title;
    }
  }
  static ID = "workbench.input.interactive";
  get editorId() {
    return "interactive";
  }
  get typeId() {
    return InteractiveEditorInput.ID;
  }
  name;
  isScratchpad;
  get language() {
    return this._inputModelRef?.object.textEditorModel.getLanguageId() ?? this._initLanguage;
  }
  _initLanguage;
  _notebookEditorInput;
  get notebookEditorInput() {
    return this._notebookEditorInput;
  }
  get editorInputs() {
    return [this._notebookEditorInput];
  }
  _resource;
  get resource() {
    return this._resource;
  }
  _inputResource;
  get inputResource() {
    return this._inputResource;
  }
  _inputResolver;
  _editorModelReference;
  _inputModelRef;
  get primary() {
    return this._notebookEditorInput;
  }
  _textModelService;
  _interactiveDocumentService;
  _historyService;
  _registerListeners() {
    const oncePrimaryDisposed = Event.once(this.primary.onWillDispose);
    this._register(oncePrimaryDisposed(() => {
      if (!this.isDisposed()) {
        this.dispose();
      }
    }));
    this._register(this.primary.onDidChangeDirty(() => this._onDidChangeDirty.fire()));
    this._register(this.primary.onDidChangeLabel(() => this._onDidChangeLabel.fire()));
    this._register(this.primary.onDidChangeCapabilities(() => this._onDidChangeCapabilities.fire()));
  }
  get capabilities() {
    const scratchPad = this.isScratchpad ? EditorInputCapabilities.Scratchpad : 0;
    return EditorInputCapabilities.Untitled | EditorInputCapabilities.Readonly | scratchPad;
  }
  async _resolveEditorModel() {
    if (!this._editorModelReference) {
      this._editorModelReference = await this._notebookEditorInput.resolve();
    }
    return this._editorModelReference;
  }
  async resolve() {
    if (this._editorModelReference) {
      return this._editorModelReference;
    }
    if (this._inputResolver) {
      return this._inputResolver;
    }
    this._inputResolver = this._resolveEditorModel();
    return this._inputResolver;
  }
  async resolveInput(language) {
    if (this._inputModelRef) {
      return this._inputModelRef.object.textEditorModel;
    }
    const resolvedLanguage = language ?? this._initLanguage ?? PLAINTEXT_LANGUAGE_ID;
    this._interactiveDocumentService.willCreateInteractiveDocument(this.resource, this.inputResource, resolvedLanguage);
    this._inputModelRef = await this._textModelService.createModelReference(this.inputResource);
    return this._inputModelRef.object.textEditorModel;
  }
  async save(group, options) {
    if (this._editorModelReference) {
      if (this.hasCapability(EditorInputCapabilities.Untitled)) {
        return this.saveAs(group, options);
      } else {
        await this._editorModelReference.save(options);
      }
      return this;
    }
    return void 0;
  }
  async saveAs(group, options) {
    if (!this._editorModelReference) {
      return void 0;
    }
    const provider = this._notebookService.getContributedNotebookType("interactive");
    if (!provider) {
      return void 0;
    }
    const filename = this.getName() + ".ipynb";
    const pathCandidate = joinPath(await this._fileDialogService.defaultFilePath(), filename);
    const target = await this._fileDialogService.pickFileToSave(pathCandidate, options?.availableFileSystems);
    if (!target) {
      return void 0;
    }
    const saved = await this._editorModelReference.saveAs(target);
    if (saved && "resource" in saved && saved.resource) {
      this._notebookService.getNotebookTextModel(saved.resource)?.dispose();
    }
    return saved;
  }
  matches(otherInput) {
    if (super.matches(otherInput)) {
      return true;
    }
    if (otherInput instanceof InteractiveEditorInput) {
      return isEqual(this.resource, otherInput.resource) && isEqual(this.inputResource, otherInput.inputResource);
    }
    return false;
  }
  getName() {
    return this.name;
  }
  isDirty() {
    if (this.isScratchpad) {
      return false;
    }
    return this._editorModelReference?.isDirty() ?? false;
  }
  isModified() {
    return this._editorModelReference?.isModified() ?? false;
  }
  async revert(_group, options) {
    if (this._editorModelReference && this._editorModelReference.isDirty()) {
      await this._editorModelReference.revert(options);
    }
  }
  dispose() {
    this._editorModelReference?.revert({ soft: true });
    this._notebookEditorInput?.dispose();
    this._editorModelReference?.dispose();
    this._editorModelReference = null;
    this._interactiveDocumentService.willRemoveInteractiveDocument(this.resource, this.inputResource);
    this._inputModelRef?.dispose();
    this._inputModelRef = null;
    super.dispose();
  }
  get historyService() {
    return this._historyService;
  }
};
InteractiveEditorInput = __decorateClass([
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, ITextModelService),
  __decorateParam(6, IInteractiveDocumentService),
  __decorateParam(7, IInteractiveHistoryService),
  __decorateParam(8, INotebookService),
  __decorateParam(9, IFileDialogService),
  __decorateParam(10, IConfigurationService)
], InteractiveEditorInput);
export {
  InteractiveEditorInput
};
//# sourceMappingURL=interactiveEditorInput.js.map
