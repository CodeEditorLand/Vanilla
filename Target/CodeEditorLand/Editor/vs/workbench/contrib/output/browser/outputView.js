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
import "./output.css";
import { Dimension } from "../../../../base/browser/dom.js";
import {
  createCancelablePromise
} from "../../../../base/common/async.js";
import { CursorChangeReason } from "../../../../editor/common/cursorEvents.js";
import { ITextResourceConfigurationService } from "../../../../editor/common/services/textResourceConfiguration.js";
import * as nls from "../../../../nls.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import {
  IContextKeyService
} from "../../../../platform/contextkey/common/contextkey.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { IHoverService } from "../../../../platform/hover/browser/hover.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ServiceCollection } from "../../../../platform/instantiation/common/serviceCollection.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { computeEditorAriaLabel } from "../../../browser/editor.js";
import { AbstractTextResourceEditor } from "../../../browser/parts/editor/textResourceEditor.js";
import {
  ViewPane
} from "../../../browser/parts/views/viewPane.js";
import { ResourceContextKey } from "../../../common/contextkeys.js";
import { TextResourceEditorInput } from "../../../common/editor/textResourceEditorInput.js";
import { IViewDescriptorService } from "../../../common/views.js";
import { IEditorGroupsService } from "../../../services/editor/common/editorGroupsService.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import {
  CONTEXT_IN_OUTPUT,
  CONTEXT_OUTPUT_SCROLL_LOCK,
  OUTPUT_VIEW_ID
} from "../../../services/output/common/output.js";
let OutputViewPane = class extends ViewPane {
  static {
    __name(this, "OutputViewPane");
  }
  editor;
  channelId;
  editorPromise = null;
  scrollLockContextKey;
  get scrollLock() {
    return !!this.scrollLockContextKey.get();
  }
  set scrollLock(scrollLock) {
    this.scrollLockContextKey.set(scrollLock);
  }
  constructor(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService, hoverService) {
    super(
      options,
      keybindingService,
      contextMenuService,
      configurationService,
      contextKeyService,
      viewDescriptorService,
      instantiationService,
      openerService,
      themeService,
      telemetryService,
      hoverService
    );
    this.scrollLockContextKey = CONTEXT_OUTPUT_SCROLL_LOCK.bindTo(
      this.contextKeyService
    );
    const editorInstantiationService = this._register(
      instantiationService.createChild(
        new ServiceCollection([
          IContextKeyService,
          this.scopedContextKeyService
        ])
      )
    );
    this.editor = this._register(
      editorInstantiationService.createInstance(OutputEditor)
    );
    this._register(
      this.editor.onTitleAreaUpdate(() => {
        this.updateTitle(this.editor.getTitle());
        this.updateActions();
      })
    );
    this._register(
      this.onDidChangeBodyVisibility(
        () => this.onDidChangeVisibility(this.isBodyVisible())
      )
    );
  }
  showChannel(channel, preserveFocus) {
    if (this.channelId !== channel.id) {
      this.setInput(channel);
    }
    if (!preserveFocus) {
      this.focus();
    }
  }
  focus() {
    super.focus();
    this.editorPromise?.then(() => this.editor.focus());
  }
  renderBody(container) {
    super.renderBody(container);
    this.editor.create(container);
    container.classList.add("output-view");
    const codeEditor = this.editor.getControl();
    codeEditor.setAriaOptions({
      role: "document",
      activeDescendant: void 0
    });
    this._register(
      codeEditor.onDidChangeModelContent(() => {
        if (!this.scrollLock) {
          this.editor.revealLastLine();
        }
      })
    );
    this._register(
      codeEditor.onDidChangeCursorPosition((e) => {
        if (e.reason !== CursorChangeReason.Explicit) {
          return;
        }
        if (!this.configurationService.getValue(
          "output.smartScroll.enabled"
        )) {
          return;
        }
        const model = codeEditor.getModel();
        if (model) {
          const newPositionLine = e.position.lineNumber;
          const lastLine = model.getLineCount();
          this.scrollLock = lastLine !== newPositionLine;
        }
      })
    );
  }
  layoutBody(height, width) {
    super.layoutBody(height, width);
    this.editor.layout(new Dimension(width, height));
  }
  onDidChangeVisibility(visible) {
    this.editor.setVisible(visible);
    if (!visible) {
      this.clearInput();
    }
  }
  setInput(channel) {
    this.channelId = channel.id;
    const input = this.createInput(channel);
    if (!this.editor.input || !input.matches(this.editor.input)) {
      this.editorPromise?.cancel();
      this.editorPromise = createCancelablePromise(
        (token) => this.editor.setInput(
          this.createInput(channel),
          { preserveFocus: true },
          /* @__PURE__ */ Object.create(null),
          token
        ).then(() => this.editor)
      );
    }
  }
  clearInput() {
    this.channelId = void 0;
    this.editor.clearInput();
    this.editorPromise = null;
  }
  createInput(channel) {
    return this.instantiationService.createInstance(
      TextResourceEditorInput,
      channel.uri,
      nls.localize("output model title", "{0} - Output", channel.label),
      nls.localize("channel", "Output channel for '{0}'", channel.label),
      void 0,
      void 0
    );
  }
};
OutputViewPane = __decorateClass([
  __decorateParam(1, IKeybindingService),
  __decorateParam(2, IContextMenuService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, IContextKeyService),
  __decorateParam(5, IViewDescriptorService),
  __decorateParam(6, IInstantiationService),
  __decorateParam(7, IOpenerService),
  __decorateParam(8, IThemeService),
  __decorateParam(9, ITelemetryService),
  __decorateParam(10, IHoverService)
], OutputViewPane);
let OutputEditor = class extends AbstractTextResourceEditor {
  constructor(telemetryService, instantiationService, storageService, configurationService, textResourceConfigurationService, themeService, editorGroupService, editorService, fileService) {
    super(OUTPUT_VIEW_ID, editorGroupService.activeGroup, telemetryService, instantiationService, storageService, textResourceConfigurationService, themeService, editorGroupService, editorService, fileService);
    this.configurationService = configurationService;
    this.resourceContext = this._register(instantiationService.createInstance(ResourceContextKey));
  }
  static {
    __name(this, "OutputEditor");
  }
  resourceContext;
  getId() {
    return OUTPUT_VIEW_ID;
  }
  getTitle() {
    return nls.localize("output", "Output");
  }
  getConfigurationOverrides(configuration) {
    const options = super.getConfigurationOverrides(configuration);
    options.wordWrap = "on";
    options.lineNumbers = "off";
    options.glyphMargin = false;
    options.lineDecorationsWidth = 20;
    options.rulers = [];
    options.folding = false;
    options.scrollBeyondLastLine = false;
    options.renderLineHighlight = "none";
    options.minimap = { enabled: false };
    options.renderValidationDecorations = "editable";
    options.padding = void 0;
    options.readOnly = true;
    options.domReadOnly = true;
    options.unicodeHighlight = {
      nonBasicASCII: false,
      invisibleCharacters: false,
      ambiguousCharacters: false
    };
    const outputConfig = this.configurationService.getValue("[Log]");
    if (outputConfig) {
      if (outputConfig["editor.minimap.enabled"]) {
        options.minimap = { enabled: true };
      }
      if ("editor.wordWrap" in outputConfig) {
        options.wordWrap = outputConfig["editor.wordWrap"];
      }
    }
    return options;
  }
  getAriaLabel() {
    return this.input ? this.input.getAriaLabel() : nls.localize("outputViewAriaLabel", "Output panel");
  }
  computeAriaLabel() {
    return this.input ? computeEditorAriaLabel(
      this.input,
      void 0,
      void 0,
      this.editorGroupService.count
    ) : this.getAriaLabel();
  }
  async setInput(input, options, context, token) {
    const focus = !(options && options.preserveFocus);
    if (this.input && input.matches(this.input)) {
      return;
    }
    if (this.input) {
      this.input.dispose();
    }
    await super.setInput(input, options, context, token);
    this.resourceContext.set(input.resource);
    if (focus) {
      this.focus();
    }
    this.revealLastLine();
  }
  clearInput() {
    if (this.input) {
      this.input.dispose();
    }
    super.clearInput();
    this.resourceContext.reset();
  }
  createEditor(parent) {
    parent.setAttribute("role", "document");
    super.createEditor(parent);
    const scopedContextKeyService = this.scopedContextKeyService;
    if (scopedContextKeyService) {
      CONTEXT_IN_OUTPUT.bindTo(scopedContextKeyService).set(true);
    }
  }
};
OutputEditor = __decorateClass([
  __decorateParam(0, ITelemetryService),
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IStorageService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, ITextResourceConfigurationService),
  __decorateParam(5, IThemeService),
  __decorateParam(6, IEditorGroupsService),
  __decorateParam(7, IEditorService),
  __decorateParam(8, IFileService)
], OutputEditor);
export {
  OutputViewPane
};
//# sourceMappingURL=outputView.js.map
