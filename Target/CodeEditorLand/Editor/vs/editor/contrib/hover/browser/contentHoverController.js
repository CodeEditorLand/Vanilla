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
import { DECREASE_HOVER_VERBOSITY_ACTION_ID, INCREASE_HOVER_VERBOSITY_ACTION_ID, SHOW_OR_FOCUS_HOVER_ACTION_ID } from "./hoverActionIds.js";
import { IKeyboardEvent } from "../../../../base/browser/keyboardEvent.js";
import { KeyCode } from "../../../../base/common/keyCodes.js";
import { Disposable, DisposableStore } from "../../../../base/common/lifecycle.js";
import { ICodeEditor, IEditorMouseEvent, IPartialEditorMouseEvent } from "../../../browser/editorBrowser.js";
import { ConfigurationChangedEvent, EditorOption } from "../../../common/config/editorOptions.js";
import { Range } from "../../../common/core/range.js";
import { IEditorContribution, IScrollEvent } from "../../../common/editorCommon.js";
import { HoverStartMode, HoverStartSource } from "./hoverOperation.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IHoverWidget } from "./hoverTypes.js";
import { InlineSuggestionHintsContentWidget } from "../../inlineCompletions/browser/hintsWidget/inlineCompletionsHintsWidget.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { ResultKind } from "../../../../platform/keybinding/common/keybindingResolver.js";
import { HoverVerbosityAction } from "../../../common/languages.js";
import { RunOnceScheduler } from "../../../../base/common/async.js";
import { isMousePositionWithinElement } from "./hoverUtils.js";
import { ContentHoverWidgetWrapper } from "./contentHoverWidgetWrapper.js";
import "./hover.css";
import { Emitter } from "../../../../base/common/event.js";
const _sticky = false;
let ContentHoverController = class extends Disposable {
  constructor(_editor, _instantiationService, _keybindingService) {
    super();
    this._editor = _editor;
    this._instantiationService = _instantiationService;
    this._keybindingService = _keybindingService;
    this._reactToEditorMouseMoveRunner = this._register(
      new RunOnceScheduler(
        () => this._reactToEditorMouseMove(this._mouseMoveEvent),
        0
      )
    );
    this._hookListeners();
    this._register(this._editor.onDidChangeConfiguration((e) => {
      if (e.hasChanged(EditorOption.hover)) {
        this._unhookListeners();
        this._hookListeners();
      }
    }));
  }
  static {
    __name(this, "ContentHoverController");
  }
  _onHoverContentsChanged = this._register(new Emitter());
  onHoverContentsChanged = this._onHoverContentsChanged.event;
  static ID = "editor.contrib.contentHover";
  shouldKeepOpenOnEditorMouseMoveOrLeave = false;
  _listenersStore = new DisposableStore();
  _contentWidget;
  _mouseMoveEvent;
  _reactToEditorMouseMoveRunner;
  _hoverSettings;
  _hoverState = {
    mouseDown: false,
    activatedByDecoratorClick: false
  };
  static get(editor) {
    return editor.getContribution(ContentHoverController.ID);
  }
  _hookListeners() {
    const hoverOpts = this._editor.getOption(EditorOption.hover);
    this._hoverSettings = {
      enabled: hoverOpts.enabled,
      sticky: hoverOpts.sticky,
      hidingDelay: hoverOpts.hidingDelay
    };
    if (hoverOpts.enabled) {
      this._listenersStore.add(this._editor.onMouseDown((e) => this._onEditorMouseDown(e)));
      this._listenersStore.add(this._editor.onMouseUp(() => this._onEditorMouseUp()));
      this._listenersStore.add(this._editor.onMouseMove((e) => this._onEditorMouseMove(e)));
      this._listenersStore.add(this._editor.onKeyDown((e) => this._onKeyDown(e)));
    } else {
      this._listenersStore.add(this._editor.onMouseMove((e) => this._onEditorMouseMove(e)));
      this._listenersStore.add(this._editor.onKeyDown((e) => this._onKeyDown(e)));
    }
    this._listenersStore.add(this._editor.onMouseLeave((e) => this._onEditorMouseLeave(e)));
    this._listenersStore.add(this._editor.onDidChangeModel(() => {
      this._cancelScheduler();
      this._hideWidgets();
    }));
    this._listenersStore.add(this._editor.onDidChangeModelContent(() => this._cancelScheduler()));
    this._listenersStore.add(this._editor.onDidScrollChange((e) => this._onEditorScrollChanged(e)));
  }
  _unhookListeners() {
    this._listenersStore.clear();
  }
  _cancelScheduler() {
    this._mouseMoveEvent = void 0;
    this._reactToEditorMouseMoveRunner.cancel();
  }
  _onEditorScrollChanged(e) {
    if (e.scrollTopChanged || e.scrollLeftChanged) {
      this._hideWidgets();
    }
  }
  _onEditorMouseDown(mouseEvent) {
    this._hoverState.mouseDown = true;
    const shouldNotHideCurrentHoverWidget = this._shouldNotHideCurrentHoverWidget(mouseEvent);
    if (shouldNotHideCurrentHoverWidget) {
      return;
    }
    this._hideWidgets();
  }
  _shouldNotHideCurrentHoverWidget(mouseEvent) {
    return this._isMouseOnContentHoverWidget(mouseEvent) || this._isContentWidgetResizing();
  }
  _isMouseOnContentHoverWidget(mouseEvent) {
    const contentWidgetNode = this._contentWidget?.getDomNode();
    if (contentWidgetNode) {
      return isMousePositionWithinElement(contentWidgetNode, mouseEvent.event.posx, mouseEvent.event.posy);
    }
    return false;
  }
  _onEditorMouseUp() {
    this._hoverState.mouseDown = false;
  }
  _onEditorMouseLeave(mouseEvent) {
    if (this.shouldKeepOpenOnEditorMouseMoveOrLeave) {
      return;
    }
    this._cancelScheduler();
    const shouldNotHideCurrentHoverWidget = this._shouldNotHideCurrentHoverWidget(mouseEvent);
    if (shouldNotHideCurrentHoverWidget) {
      return;
    }
    if (_sticky) {
      return;
    }
    this._hideWidgets();
  }
  _shouldNotRecomputeCurrentHoverWidget(mouseEvent) {
    const isHoverSticky = this._hoverSettings.sticky;
    const isMouseOnStickyContentHoverWidget = /* @__PURE__ */ __name((mouseEvent2, isHoverSticky2) => {
      const isMouseOnContentHoverWidget = this._isMouseOnContentHoverWidget(mouseEvent2);
      return isHoverSticky2 && isMouseOnContentHoverWidget;
    }, "isMouseOnStickyContentHoverWidget");
    const isMouseOnColorPicker = /* @__PURE__ */ __name((mouseEvent2) => {
      const isMouseOnContentHoverWidget = this._isMouseOnContentHoverWidget(mouseEvent2);
      const isColorPickerVisible = this._contentWidget?.isColorPickerVisible ?? false;
      return isMouseOnContentHoverWidget && isColorPickerVisible;
    }, "isMouseOnColorPicker");
    const isTextSelectedWithinContentHoverWidget = /* @__PURE__ */ __name((mouseEvent2, sticky) => {
      return (sticky && this._contentWidget?.containsNode(mouseEvent2.event.browserEvent.view?.document.activeElement) && !mouseEvent2.event.browserEvent.view?.getSelection()?.isCollapsed) ?? false;
    }, "isTextSelectedWithinContentHoverWidget");
    return isMouseOnStickyContentHoverWidget(mouseEvent, isHoverSticky) || isMouseOnColorPicker(mouseEvent) || isTextSelectedWithinContentHoverWidget(mouseEvent, isHoverSticky);
  }
  _onEditorMouseMove(mouseEvent) {
    if (this.shouldKeepOpenOnEditorMouseMoveOrLeave) {
      return;
    }
    this._mouseMoveEvent = mouseEvent;
    if (this._contentWidget?.isFocused || this._contentWidget?.isResizing) {
      return;
    }
    const sticky = this._hoverSettings.sticky;
    if (sticky && this._contentWidget?.isVisibleFromKeyboard) {
      return;
    }
    const shouldNotRecomputeCurrentHoverWidget = this._shouldNotRecomputeCurrentHoverWidget(mouseEvent);
    if (shouldNotRecomputeCurrentHoverWidget) {
      this._reactToEditorMouseMoveRunner.cancel();
      return;
    }
    const hidingDelay = this._hoverSettings.hidingDelay;
    const isContentHoverWidgetVisible = this._contentWidget?.isVisible;
    const shouldRescheduleHoverComputation = isContentHoverWidgetVisible && sticky && hidingDelay > 0;
    if (shouldRescheduleHoverComputation) {
      if (!this._reactToEditorMouseMoveRunner.isScheduled()) {
        this._reactToEditorMouseMoveRunner.schedule(hidingDelay);
      }
      return;
    }
    this._reactToEditorMouseMove(mouseEvent);
  }
  _reactToEditorMouseMove(mouseEvent) {
    if (!mouseEvent) {
      return;
    }
    const target = mouseEvent.target;
    const mouseOnDecorator = target.element?.classList.contains("colorpicker-color-decoration");
    const decoratorActivatedOn = this._editor.getOption(EditorOption.colorDecoratorsActivatedOn);
    const enabled = this._hoverSettings.enabled;
    const activatedByDecoratorClick = this._hoverState.activatedByDecoratorClick;
    if (mouseOnDecorator && (decoratorActivatedOn === "click" && !activatedByDecoratorClick || decoratorActivatedOn === "hover" && !enabled && !_sticky || decoratorActivatedOn === "clickAndHover" && !enabled && !activatedByDecoratorClick) || !mouseOnDecorator && !enabled && !activatedByDecoratorClick) {
      this._hideWidgets();
      return;
    }
    const contentHoverShowsOrWillShow = this._tryShowHoverWidget(mouseEvent);
    if (contentHoverShowsOrWillShow) {
      return;
    }
    if (_sticky) {
      return;
    }
    this._hideWidgets();
  }
  _tryShowHoverWidget(mouseEvent) {
    const contentWidget = this._getOrCreateContentWidget();
    return contentWidget.showsOrWillShow(mouseEvent);
  }
  _onKeyDown(e) {
    if (!this._editor.hasModel()) {
      return;
    }
    const resolvedKeyboardEvent = this._keybindingService.softDispatch(e, this._editor.getDomNode());
    const shouldKeepHoverVisible = resolvedKeyboardEvent.kind === ResultKind.MoreChordsNeeded || resolvedKeyboardEvent.kind === ResultKind.KbFound && (resolvedKeyboardEvent.commandId === SHOW_OR_FOCUS_HOVER_ACTION_ID || resolvedKeyboardEvent.commandId === INCREASE_HOVER_VERBOSITY_ACTION_ID || resolvedKeyboardEvent.commandId === DECREASE_HOVER_VERBOSITY_ACTION_ID) && this._contentWidget?.isVisible;
    if (e.keyCode === KeyCode.Ctrl || e.keyCode === KeyCode.Alt || e.keyCode === KeyCode.Meta || e.keyCode === KeyCode.Shift || shouldKeepHoverVisible) {
      return;
    }
    this._hideWidgets();
  }
  _hideWidgets() {
    if (_sticky) {
      return;
    }
    if (this._hoverState.mouseDown && this._contentWidget?.isColorPickerVisible || InlineSuggestionHintsContentWidget.dropDownVisible) {
      return;
    }
    this._hoverState.activatedByDecoratorClick = false;
    this._contentWidget?.hide();
  }
  _getOrCreateContentWidget() {
    if (!this._contentWidget) {
      this._contentWidget = this._instantiationService.createInstance(ContentHoverWidgetWrapper, this._editor);
      this._listenersStore.add(this._contentWidget.onContentsChanged(() => this._onHoverContentsChanged.fire()));
    }
    return this._contentWidget;
  }
  hideContentHover() {
    this._hideWidgets();
  }
  showContentHover(range, mode, source, focus, activatedByColorDecoratorClick = false) {
    this._hoverState.activatedByDecoratorClick = activatedByColorDecoratorClick;
    this._getOrCreateContentWidget().startShowingAtRange(range, mode, source, focus);
  }
  _isContentWidgetResizing() {
    return this._contentWidget?.widget.isResizing || false;
  }
  focusedHoverPartIndex() {
    return this._getOrCreateContentWidget().focusedHoverPartIndex();
  }
  doesHoverAtIndexSupportVerbosityAction(index, action) {
    return this._getOrCreateContentWidget().doesHoverAtIndexSupportVerbosityAction(index, action);
  }
  updateHoverVerbosityLevel(action, index, focus) {
    this._getOrCreateContentWidget().updateHoverVerbosityLevel(action, index, focus);
  }
  focus() {
    this._contentWidget?.focus();
  }
  focusHoverPartWithIndex(index) {
    this._contentWidget?.focusHoverPartWithIndex(index);
  }
  scrollUp() {
    this._contentWidget?.scrollUp();
  }
  scrollDown() {
    this._contentWidget?.scrollDown();
  }
  scrollLeft() {
    this._contentWidget?.scrollLeft();
  }
  scrollRight() {
    this._contentWidget?.scrollRight();
  }
  pageUp() {
    this._contentWidget?.pageUp();
  }
  pageDown() {
    this._contentWidget?.pageDown();
  }
  goToTop() {
    this._contentWidget?.goToTop();
  }
  goToBottom() {
    this._contentWidget?.goToBottom();
  }
  getWidgetContent() {
    return this._contentWidget?.getWidgetContent();
  }
  getAccessibleWidgetContent() {
    return this._contentWidget?.getAccessibleWidgetContent();
  }
  getAccessibleWidgetContentAtIndex(index) {
    return this._contentWidget?.getAccessibleWidgetContentAtIndex(index);
  }
  get isColorPickerVisible() {
    return this._contentWidget?.isColorPickerVisible;
  }
  get isHoverVisible() {
    return this._contentWidget?.isVisible;
  }
  dispose() {
    super.dispose();
    this._unhookListeners();
    this._listenersStore.dispose();
    this._contentWidget?.dispose();
  }
};
ContentHoverController = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IKeybindingService)
], ContentHoverController);
export {
  ContentHoverController
};
//# sourceMappingURL=contentHoverController.js.map
