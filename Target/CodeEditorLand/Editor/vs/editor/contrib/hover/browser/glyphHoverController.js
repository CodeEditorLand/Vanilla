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
import { RunOnceScheduler } from "../../../../base/common/async.js";
import { KeyCode } from "../../../../base/common/keyCodes.js";
import {
  Disposable,
  DisposableStore
} from "../../../../base/common/lifecycle.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import {
  EditorOption
} from "../../../common/config/editorOptions.js";
import { isMousePositionWithinElement } from "./hoverUtils.js";
import "./hover.css";
import { GlyphHoverWidget } from "./glyphHoverWidget.js";
const _sticky = false;
let GlyphHoverController = class extends Disposable {
  constructor(_editor, _instantiationService) {
    super();
    this._editor = _editor;
    this._instantiationService = _instantiationService;
    this._reactToEditorMouseMoveRunner = this._register(
      new RunOnceScheduler(
        () => this._reactToEditorMouseMove(this._mouseMoveEvent),
        0
      )
    );
    this._hookListeners();
    this._register(
      this._editor.onDidChangeConfiguration(
        (e) => {
          if (e.hasChanged(EditorOption.hover)) {
            this._unhookListeners();
            this._hookListeners();
          }
        }
      )
    );
  }
  static {
    __name(this, "GlyphHoverController");
  }
  static ID = "editor.contrib.marginHover";
  shouldKeepOpenOnEditorMouseMoveOrLeave = false;
  _listenersStore = new DisposableStore();
  _glyphWidget;
  _mouseMoveEvent;
  _reactToEditorMouseMoveRunner;
  _hoverSettings;
  _hoverState = {
    mouseDown: false
  };
  static get(editor) {
    return editor.getContribution(
      GlyphHoverController.ID
    );
  }
  _hookListeners() {
    const hoverOpts = this._editor.getOption(EditorOption.hover);
    this._hoverSettings = {
      enabled: hoverOpts.enabled,
      sticky: hoverOpts.sticky,
      hidingDelay: hoverOpts.hidingDelay
    };
    if (hoverOpts.enabled) {
      this._listenersStore.add(
        this._editor.onMouseDown(
          (e) => this._onEditorMouseDown(e)
        )
      );
      this._listenersStore.add(
        this._editor.onMouseUp(() => this._onEditorMouseUp())
      );
      this._listenersStore.add(
        this._editor.onMouseMove(
          (e) => this._onEditorMouseMove(e)
        )
      );
      this._listenersStore.add(
        this._editor.onKeyDown(
          (e) => this._onKeyDown(e)
        )
      );
    } else {
      this._listenersStore.add(
        this._editor.onMouseMove(
          (e) => this._onEditorMouseMove(e)
        )
      );
      this._listenersStore.add(
        this._editor.onKeyDown(
          (e) => this._onKeyDown(e)
        )
      );
    }
    this._listenersStore.add(
      this._editor.onMouseLeave((e) => this._onEditorMouseLeave(e))
    );
    this._listenersStore.add(
      this._editor.onDidChangeModel(() => {
        this._cancelScheduler();
        this._hideWidgets();
      })
    );
    this._listenersStore.add(
      this._editor.onDidChangeModelContent(() => this._cancelScheduler())
    );
    this._listenersStore.add(
      this._editor.onDidScrollChange(
        (e) => this._onEditorScrollChanged(e)
      )
    );
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
    const shouldNotHideCurrentHoverWidget = this._isMouseOnGlyphHoverWidget(mouseEvent);
    if (shouldNotHideCurrentHoverWidget) {
      return;
    }
    this._hideWidgets();
  }
  _isMouseOnGlyphHoverWidget(mouseEvent) {
    const glyphHoverWidgetNode = this._glyphWidget?.getDomNode();
    if (glyphHoverWidgetNode) {
      return isMousePositionWithinElement(
        glyphHoverWidgetNode,
        mouseEvent.event.posx,
        mouseEvent.event.posy
      );
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
    const shouldNotHideCurrentHoverWidget = this._isMouseOnGlyphHoverWidget(mouseEvent);
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
    const isMouseOnGlyphHoverWidget = this._isMouseOnGlyphHoverWidget(mouseEvent);
    return isHoverSticky && isMouseOnGlyphHoverWidget;
  }
  _onEditorMouseMove(mouseEvent) {
    if (this.shouldKeepOpenOnEditorMouseMoveOrLeave) {
      return;
    }
    this._mouseMoveEvent = mouseEvent;
    const shouldNotRecomputeCurrentHoverWidget = this._shouldNotRecomputeCurrentHoverWidget(mouseEvent);
    if (shouldNotRecomputeCurrentHoverWidget) {
      this._reactToEditorMouseMoveRunner.cancel();
      return;
    }
    this._reactToEditorMouseMove(mouseEvent);
  }
  _reactToEditorMouseMove(mouseEvent) {
    if (!mouseEvent) {
      return;
    }
    const glyphWidgetShowsOrWillShow = this._tryShowHoverWidget(mouseEvent);
    if (glyphWidgetShowsOrWillShow) {
      return;
    }
    if (_sticky) {
      return;
    }
    this._hideWidgets();
  }
  _tryShowHoverWidget(mouseEvent) {
    const glyphWidget = this._getOrCreateGlyphWidget();
    return glyphWidget.showsOrWillShow(mouseEvent);
  }
  _onKeyDown(e) {
    if (!this._editor.hasModel()) {
      return;
    }
    if (e.keyCode === KeyCode.Ctrl || e.keyCode === KeyCode.Alt || e.keyCode === KeyCode.Meta || e.keyCode === KeyCode.Shift) {
      return;
    }
    this._hideWidgets();
  }
  _hideWidgets() {
    if (_sticky) {
      return;
    }
    this._glyphWidget?.hide();
  }
  _getOrCreateGlyphWidget() {
    if (!this._glyphWidget) {
      this._glyphWidget = this._instantiationService.createInstance(
        GlyphHoverWidget,
        this._editor
      );
    }
    return this._glyphWidget;
  }
  hideContentHover() {
    this._hideWidgets();
  }
  dispose() {
    super.dispose();
    this._unhookListeners();
    this._listenersStore.dispose();
    this._glyphWidget?.dispose();
  }
};
GlyphHoverController = __decorateClass([
  __decorateParam(1, IInstantiationService)
], GlyphHoverController);
export {
  GlyphHoverController
};
//# sourceMappingURL=glyphHoverController.js.map
