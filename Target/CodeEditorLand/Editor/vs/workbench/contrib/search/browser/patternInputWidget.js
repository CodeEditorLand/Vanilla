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
import * as dom from "../../../../base/browser/dom.js";
import { getDefaultHoverDelegate } from "../../../../base/browser/ui/hover/hoverDelegateFactory.js";
import { Toggle } from "../../../../base/browser/ui/toggle/toggle.js";
import { Widget } from "../../../../base/browser/ui/widget.js";
import { Codicon } from "../../../../base/common/codicons.js";
import {
  Emitter
} from "../../../../base/common/event.js";
import { KeyCode } from "../../../../base/common/keyCodes.js";
import * as nls from "../../../../nls.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { ContextScopedHistoryInputBox } from "../../../../platform/history/browser/contextScopedHistoryWidget.js";
import { showHistoryKeybindingHint } from "../../../../platform/history/browser/historyWidgetKeybindingHint.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { defaultToggleStyles } from "../../../../platform/theme/browser/defaultStyles.js";
let PatternInputWidget = class extends Widget {
  constructor(parent, contextViewProvider, options, contextKeyService, configurationService, keybindingService) {
    super();
    this.contextViewProvider = contextViewProvider;
    this.contextKeyService = contextKeyService;
    this.configurationService = configurationService;
    this.keybindingService = keybindingService;
    options = {
      ...{
        ariaLabel: nls.localize("defaultLabel", "input")
      },
      ...options
    };
    this.width = options.width ?? 100;
    this.render(options);
    parent.appendChild(this.domNode);
  }
  static {
    __name(this, "PatternInputWidget");
  }
  static OPTION_CHANGE = "optionChange";
  inputFocusTracker;
  width;
  domNode;
  inputBox;
  _onSubmit = this._register(new Emitter());
  onSubmit = this._onSubmit.event;
  _onCancel = this._register(new Emitter());
  onCancel = this._onCancel.event;
  dispose() {
    super.dispose();
    this.inputFocusTracker?.dispose();
  }
  setWidth(newWidth) {
    this.width = newWidth;
    this.contextViewProvider.layout();
    this.setInputWidth();
  }
  getValue() {
    return this.inputBox.value;
  }
  setValue(value) {
    if (this.inputBox.value !== value) {
      this.inputBox.value = value;
    }
  }
  select() {
    this.inputBox.select();
  }
  focus() {
    this.inputBox.focus();
  }
  inputHasFocus() {
    return this.inputBox.hasFocus();
  }
  setInputWidth() {
    this.inputBox.width = this.width - this.getSubcontrolsWidth() - 2;
  }
  getSubcontrolsWidth() {
    return 0;
  }
  getHistory() {
    return this.inputBox.getHistory();
  }
  clearHistory() {
    this.inputBox.clearHistory();
  }
  prependHistory(history) {
    this.inputBox.prependHistory(history);
  }
  clear() {
    this.setValue("");
  }
  onSearchSubmit() {
    this.inputBox.addToHistory();
  }
  showNextTerm() {
    this.inputBox.showNextValue();
  }
  showPreviousTerm() {
    this.inputBox.showPreviousValue();
  }
  render(options) {
    this.domNode = document.createElement("div");
    this.domNode.classList.add("monaco-findInput");
    this.inputBox = new ContextScopedHistoryInputBox(
      this.domNode,
      this.contextViewProvider,
      {
        placeholder: options.placeholder,
        showPlaceholderOnFocus: options.showPlaceholderOnFocus,
        tooltip: options.tooltip,
        ariaLabel: options.ariaLabel,
        validationOptions: {
          validation: void 0
        },
        history: options.history || [],
        showHistoryHint: /* @__PURE__ */ __name(() => showHistoryKeybindingHint(this.keybindingService), "showHistoryHint"),
        inputBoxStyles: options.inputBoxStyles
      },
      this.contextKeyService
    );
    this._register(
      this.inputBox.onDidChange(() => this._onSubmit.fire(true))
    );
    this.inputFocusTracker = dom.trackFocus(this.inputBox.inputElement);
    this.onkeyup(
      this.inputBox.inputElement,
      (keyboardEvent) => this.onInputKeyUp(keyboardEvent)
    );
    const controls = document.createElement("div");
    controls.className = "controls";
    this.renderSubcontrols(controls);
    this.domNode.appendChild(controls);
    this.setInputWidth();
  }
  renderSubcontrols(_controlsDiv) {
  }
  onInputKeyUp(keyboardEvent) {
    switch (keyboardEvent.keyCode) {
      case KeyCode.Enter:
        this.onSearchSubmit();
        this._onSubmit.fire(false);
        return;
      case KeyCode.Escape:
        this._onCancel.fire();
        return;
    }
  }
};
PatternInputWidget = __decorateClass([
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, IKeybindingService)
], PatternInputWidget);
let IncludePatternInputWidget = class extends PatternInputWidget {
  static {
    __name(this, "IncludePatternInputWidget");
  }
  _onChangeSearchInEditorsBoxEmitter = this._register(
    new Emitter()
  );
  onChangeSearchInEditorsBox = this._onChangeSearchInEditorsBoxEmitter.event;
  constructor(parent, contextViewProvider, options, contextKeyService, configurationService, keybindingService) {
    super(
      parent,
      contextViewProvider,
      options,
      contextKeyService,
      configurationService,
      keybindingService
    );
  }
  useSearchInEditorsBox;
  dispose() {
    super.dispose();
    this.useSearchInEditorsBox.dispose();
  }
  onlySearchInOpenEditors() {
    return this.useSearchInEditorsBox.checked;
  }
  setOnlySearchInOpenEditors(value) {
    this.useSearchInEditorsBox.checked = value;
    this._onChangeSearchInEditorsBoxEmitter.fire();
  }
  getSubcontrolsWidth() {
    return super.getSubcontrolsWidth() + this.useSearchInEditorsBox.width();
  }
  renderSubcontrols(controlsDiv) {
    this.useSearchInEditorsBox = this._register(
      new Toggle({
        icon: Codicon.book,
        title: nls.localize(
          "onlySearchInOpenEditors",
          "Search only in Open Editors"
        ),
        isChecked: false,
        hoverDelegate: getDefaultHoverDelegate("element"),
        ...defaultToggleStyles
      })
    );
    this._register(
      this.useSearchInEditorsBox.onChange((viaKeyboard) => {
        this._onChangeSearchInEditorsBoxEmitter.fire();
        if (!viaKeyboard) {
          this.inputBox.focus();
        }
      })
    );
    controlsDiv.appendChild(this.useSearchInEditorsBox.domNode);
    super.renderSubcontrols(controlsDiv);
  }
};
IncludePatternInputWidget = __decorateClass([
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, IKeybindingService)
], IncludePatternInputWidget);
let ExcludePatternInputWidget = class extends PatternInputWidget {
  static {
    __name(this, "ExcludePatternInputWidget");
  }
  _onChangeIgnoreBoxEmitter = this._register(new Emitter());
  onChangeIgnoreBox = this._onChangeIgnoreBoxEmitter.event;
  constructor(parent, contextViewProvider, options, contextKeyService, configurationService, keybindingService) {
    super(
      parent,
      contextViewProvider,
      options,
      contextKeyService,
      configurationService,
      keybindingService
    );
  }
  useExcludesAndIgnoreFilesBox;
  dispose() {
    super.dispose();
    this.useExcludesAndIgnoreFilesBox.dispose();
  }
  useExcludesAndIgnoreFiles() {
    return this.useExcludesAndIgnoreFilesBox.checked;
  }
  setUseExcludesAndIgnoreFiles(value) {
    this.useExcludesAndIgnoreFilesBox.checked = value;
    this._onChangeIgnoreBoxEmitter.fire();
  }
  getSubcontrolsWidth() {
    return super.getSubcontrolsWidth() + this.useExcludesAndIgnoreFilesBox.width();
  }
  renderSubcontrols(controlsDiv) {
    this.useExcludesAndIgnoreFilesBox = this._register(
      new Toggle({
        icon: Codicon.exclude,
        actionClassName: "useExcludesAndIgnoreFiles",
        title: nls.localize(
          "useExcludesAndIgnoreFilesDescription",
          "Use Exclude Settings and Ignore Files"
        ),
        isChecked: true,
        hoverDelegate: getDefaultHoverDelegate("element"),
        ...defaultToggleStyles
      })
    );
    this._register(
      this.useExcludesAndIgnoreFilesBox.onChange((viaKeyboard) => {
        this._onChangeIgnoreBoxEmitter.fire();
        if (!viaKeyboard) {
          this.inputBox.focus();
        }
      })
    );
    controlsDiv.appendChild(this.useExcludesAndIgnoreFilesBox.domNode);
    super.renderSubcontrols(controlsDiv);
  }
};
ExcludePatternInputWidget = __decorateClass([
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, IKeybindingService)
], ExcludePatternInputWidget);
export {
  ExcludePatternInputWidget,
  IncludePatternInputWidget,
  PatternInputWidget
};
//# sourceMappingURL=patternInputWidget.js.map
