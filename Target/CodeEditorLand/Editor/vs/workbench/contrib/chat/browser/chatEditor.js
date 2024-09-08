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
import {
  IContextKeyService
} from "../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ServiceCollection } from "../../../../platform/instantiation/common/serviceCollection.js";
import {
  IStorageService,
  StorageScope,
  StorageTarget
} from "../../../../platform/storage/common/storage.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import {
  editorBackground,
  editorForeground,
  inputBackground
} from "../../../../platform/theme/common/colorRegistry.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { EditorPane } from "../../../browser/parts/editor/editorPane.js";
import { Memento } from "../../../common/memento.js";
import { ChatAgentLocation } from "../common/chatAgents.js";
import { CHAT_PROVIDER_ID } from "../common/chatParticipantContribTypes.js";
import { clearChatEditor } from "./actions/chatClear.js";
import { ChatEditorInput } from "./chatEditorInput.js";
import { ChatWidget } from "./chatWidget.js";
let ChatEditor = class extends EditorPane {
  constructor(group, telemetryService, themeService, instantiationService, storageService, contextKeyService) {
    super(ChatEditorInput.EditorID, group, telemetryService, themeService, storageService);
    this.instantiationService = instantiationService;
    this.storageService = storageService;
    this.contextKeyService = contextKeyService;
  }
  widget;
  _scopedContextKeyService;
  get scopedContextKeyService() {
    return this._scopedContextKeyService;
  }
  _memento;
  _viewState;
  async clear() {
    if (this.input) {
      return this.instantiationService.invokeFunction(
        clearChatEditor,
        this.input
      );
    }
  }
  createEditor(parent) {
    this._scopedContextKeyService = this._register(
      this.contextKeyService.createScoped(parent)
    );
    const scopedInstantiationService = this._register(
      this.instantiationService.createChild(
        new ServiceCollection([
          IContextKeyService,
          this.scopedContextKeyService
        ])
      )
    );
    this.widget = this._register(
      scopedInstantiationService.createInstance(
        ChatWidget,
        ChatAgentLocation.Panel,
        void 0,
        { supportsFileReferences: true },
        {
          listForeground: editorForeground,
          listBackground: editorBackground,
          inputEditorBackground: inputBackground,
          resultEditorBackground: editorBackground
        }
      )
    );
    this._register(this.widget.onDidClear(() => this.clear()));
    this.widget.render(parent);
    this.widget.setVisible(true);
  }
  setEditorVisible(visible) {
    super.setEditorVisible(visible);
    this.widget?.setVisible(visible);
  }
  focus() {
    super.focus();
    this.widget?.focusInput();
  }
  clearInput() {
    this.saveState();
    super.clearInput();
  }
  async setInput(input, options, context, token) {
    super.setInput(input, options, context, token);
    const editorModel = await input.resolve();
    if (!editorModel) {
      throw new Error(
        `Failed to get model for chat editor. id: ${input.sessionId}`
      );
    }
    if (!this.widget) {
      throw new Error("ChatEditor lifecycle issue: no editor widget");
    }
    this.updateModel(
      editorModel.model,
      options?.viewState ?? input.options.viewState
    );
  }
  updateModel(model, viewState) {
    this._memento = new Memento(
      "interactive-session-editor-" + CHAT_PROVIDER_ID,
      this.storageService
    );
    this._viewState = viewState ?? this._memento.getMemento(
      StorageScope.WORKSPACE,
      StorageTarget.MACHINE
    );
    this.widget.setModel(model, { ...this._viewState });
  }
  saveState() {
    this.widget?.saveState();
    if (this._memento && this._viewState) {
      const widgetViewState = this.widget.getViewState();
      this._viewState.inputValue = widgetViewState.inputValue;
      this._memento.saveMemento();
    }
  }
  layout(dimension, position) {
    if (this.widget) {
      this.widget.layout(dimension.height, dimension.width);
    }
  }
};
ChatEditor = __decorateClass([
  __decorateParam(1, ITelemetryService),
  __decorateParam(2, IThemeService),
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IStorageService),
  __decorateParam(5, IContextKeyService)
], ChatEditor);
export {
  ChatEditor
};
