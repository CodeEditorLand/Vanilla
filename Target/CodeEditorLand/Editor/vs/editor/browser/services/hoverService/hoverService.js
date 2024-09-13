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
import { InstantiationType, registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { registerThemingParticipant } from "../../../../platform/theme/common/themeService.js";
import { editorHoverBorder } from "../../../../platform/theme/common/colorRegistry.js";
import { IHoverService } from "../../../../platform/hover/browser/hover.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { HoverWidget } from "./hoverWidget.js";
import { IContextViewProvider, IDelegate } from "../../../../base/browser/ui/contextview/contextview.js";
import { Disposable, DisposableStore, IDisposable, toDisposable } from "../../../../base/common/lifecycle.js";
import { addDisposableListener, EventType, getActiveElement, isAncestorOfActiveElement, isAncestor, getWindow, isHTMLElement, isEditableElement } from "../../../../base/browser/dom.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { StandardKeyboardEvent } from "../../../../base/browser/keyboardEvent.js";
import { ResultKind } from "../../../../platform/keybinding/common/keybindingResolver.js";
import { IAccessibilityService } from "../../../../platform/accessibility/common/accessibility.js";
import { ILayoutService } from "../../../../platform/layout/browser/layoutService.js";
import { mainWindow } from "../../../../base/browser/window.js";
import { ContextViewHandler } from "../../../../platform/contextview/browser/contextViewService.js";
import { ManagedHoverWidget } from "./updatableHoverWidget.js";
import { TimeoutTimer } from "../../../../base/common/async.js";
let HoverService = class extends Disposable {
  constructor(_instantiationService, contextMenuService, _keybindingService, _layoutService, _accessibilityService) {
    super();
    this._instantiationService = _instantiationService;
    this._keybindingService = _keybindingService;
    this._layoutService = _layoutService;
    this._accessibilityService = _accessibilityService;
    contextMenuService.onDidShowContextMenu(() => this.hideHover());
    this._contextViewHandler = this._register(new ContextViewHandler(this._layoutService));
  }
  static {
    __name(this, "HoverService");
  }
  _contextViewHandler;
  _currentHoverOptions;
  _currentHover;
  _lastHoverOptions;
  _lastFocusedElementBeforeOpen;
  showHover(options, focus, skipLastFocusedUpdate) {
    if (getHoverOptionsIdentity(this._currentHoverOptions) === getHoverOptionsIdentity(options)) {
      return void 0;
    }
    if (this._currentHover && this._currentHoverOptions?.persistence?.sticky) {
      return void 0;
    }
    this._currentHoverOptions = options;
    this._lastHoverOptions = options;
    const trapFocus = options.trapFocus || this._accessibilityService.isScreenReaderOptimized();
    const activeElement = getActiveElement();
    if (!skipLastFocusedUpdate) {
      if (trapFocus && activeElement) {
        if (!activeElement.classList.contains("monaco-hover")) {
          this._lastFocusedElementBeforeOpen = activeElement;
        }
      } else {
        this._lastFocusedElementBeforeOpen = void 0;
      }
    }
    const hoverDisposables = new DisposableStore();
    const hover = this._instantiationService.createInstance(HoverWidget, options);
    if (options.persistence?.sticky) {
      hover.isLocked = true;
    }
    hover.onDispose(() => {
      const hoverWasFocused = this._currentHover?.domNode && isAncestorOfActiveElement(this._currentHover.domNode);
      if (hoverWasFocused) {
        this._lastFocusedElementBeforeOpen?.focus();
      }
      if (this._currentHoverOptions === options) {
        this._currentHoverOptions = void 0;
      }
      hoverDisposables.dispose();
    }, void 0, hoverDisposables);
    if (!options.container) {
      const targetElement = isHTMLElement(options.target) ? options.target : options.target.targetElements[0];
      options.container = this._layoutService.getContainer(getWindow(targetElement));
    }
    this._contextViewHandler.showContextView(
      new HoverContextViewDelegate(hover, focus),
      options.container
    );
    hover.onRequestLayout(() => this._contextViewHandler.layout(), void 0, hoverDisposables);
    if (options.persistence?.sticky) {
      hoverDisposables.add(addDisposableListener(getWindow(options.container).document, EventType.MOUSE_DOWN, (e) => {
        if (!isAncestor(e.target, hover.domNode)) {
          this.doHideHover();
        }
      }));
    } else {
      if ("targetElements" in options.target) {
        for (const element of options.target.targetElements) {
          hoverDisposables.add(addDisposableListener(element, EventType.CLICK, () => this.hideHover()));
        }
      } else {
        hoverDisposables.add(addDisposableListener(options.target, EventType.CLICK, () => this.hideHover()));
      }
      const focusedElement = getActiveElement();
      if (focusedElement) {
        const focusedElementDocument = getWindow(focusedElement).document;
        hoverDisposables.add(addDisposableListener(focusedElement, EventType.KEY_DOWN, (e) => this._keyDown(e, hover, !!options.persistence?.hideOnKeyDown)));
        hoverDisposables.add(addDisposableListener(focusedElementDocument, EventType.KEY_DOWN, (e) => this._keyDown(e, hover, !!options.persistence?.hideOnKeyDown)));
        hoverDisposables.add(addDisposableListener(focusedElement, EventType.KEY_UP, (e) => this._keyUp(e, hover)));
        hoverDisposables.add(addDisposableListener(focusedElementDocument, EventType.KEY_UP, (e) => this._keyUp(e, hover)));
      }
    }
    if ("IntersectionObserver" in mainWindow) {
      const observer = new IntersectionObserver((e) => this._intersectionChange(e, hover), { threshold: 0 });
      const firstTargetElement = "targetElements" in options.target ? options.target.targetElements[0] : options.target;
      observer.observe(firstTargetElement);
      hoverDisposables.add(toDisposable(() => observer.disconnect()));
    }
    this._currentHover = hover;
    return hover;
  }
  hideHover() {
    if (this._currentHover?.isLocked || !this._currentHoverOptions) {
      return;
    }
    this.doHideHover();
  }
  doHideHover() {
    this._currentHover = void 0;
    this._currentHoverOptions = void 0;
    this._contextViewHandler.hideContextView();
  }
  _intersectionChange(entries, hover) {
    const entry = entries[entries.length - 1];
    if (!entry.isIntersecting) {
      hover.dispose();
    }
  }
  showAndFocusLastHover() {
    if (!this._lastHoverOptions) {
      return;
    }
    this.showHover(this._lastHoverOptions, true, true);
  }
  _keyDown(e, hover, hideOnKeyDown) {
    if (e.key === "Alt") {
      hover.isLocked = true;
      return;
    }
    const event = new StandardKeyboardEvent(e);
    const keybinding = this._keybindingService.resolveKeyboardEvent(event);
    if (keybinding.getSingleModifierDispatchChords().some((value) => !!value) || this._keybindingService.softDispatch(event, event.target).kind !== ResultKind.NoMatchingKb) {
      return;
    }
    if (hideOnKeyDown && (!this._currentHoverOptions?.trapFocus || e.key !== "Tab")) {
      this.hideHover();
      this._lastFocusedElementBeforeOpen?.focus();
    }
  }
  _keyUp(e, hover) {
    if (e.key === "Alt") {
      hover.isLocked = false;
      if (!hover.isMouseIn) {
        this.hideHover();
        this._lastFocusedElementBeforeOpen?.focus();
      }
    }
  }
  _managedHovers = /* @__PURE__ */ new Map();
  // TODO: Investigate performance of this function. There seems to be a lot of content created
  //       and thrown away on start up
  setupManagedHover(hoverDelegate, targetElement, content, options) {
    targetElement.setAttribute("custom-hover", "true");
    if (targetElement.title !== "") {
      console.warn("HTML element already has a title attribute, which will conflict with the custom hover. Please remove the title attribute.");
      console.trace("Stack trace:", targetElement.title);
      targetElement.title = "";
    }
    let hoverPreparation;
    let hoverWidget;
    const hideHover = /* @__PURE__ */ __name((disposeWidget, disposePreparation) => {
      const hadHover = hoverWidget !== void 0;
      if (disposeWidget) {
        hoverWidget?.dispose();
        hoverWidget = void 0;
      }
      if (disposePreparation) {
        hoverPreparation?.dispose();
        hoverPreparation = void 0;
      }
      if (hadHover) {
        hoverDelegate.onDidHideHover?.();
        hoverWidget = void 0;
      }
    }, "hideHover");
    const triggerShowHover = /* @__PURE__ */ __name((delay, focus, target, trapFocus) => {
      return new TimeoutTimer(async () => {
        if (!hoverWidget || hoverWidget.isDisposed) {
          hoverWidget = new ManagedHoverWidget(hoverDelegate, target || targetElement, delay > 0);
          await hoverWidget.update(typeof content === "function" ? content() : content, focus, { ...options, trapFocus });
        }
      }, delay);
    }, "triggerShowHover");
    let isMouseDown = false;
    const mouseDownEmitter = addDisposableListener(targetElement, EventType.MOUSE_DOWN, () => {
      isMouseDown = true;
      hideHover(true, true);
    }, true);
    const mouseUpEmitter = addDisposableListener(targetElement, EventType.MOUSE_UP, () => {
      isMouseDown = false;
    }, true);
    const mouseLeaveEmitter = addDisposableListener(targetElement, EventType.MOUSE_LEAVE, (e) => {
      isMouseDown = false;
      hideHover(false, e.fromElement === targetElement);
    }, true);
    const onMouseOver = /* @__PURE__ */ __name((e) => {
      if (hoverPreparation) {
        return;
      }
      const toDispose = new DisposableStore();
      const target = {
        targetElements: [targetElement],
        dispose: /* @__PURE__ */ __name(() => {
        }, "dispose")
      };
      if (hoverDelegate.placement === void 0 || hoverDelegate.placement === "mouse") {
        const onMouseMove = /* @__PURE__ */ __name((e2) => {
          target.x = e2.x + 10;
          if (isHTMLElement(e2.target) && getHoverTargetElement(e2.target, targetElement) !== targetElement) {
            hideHover(true, true);
          }
        }, "onMouseMove");
        toDispose.add(addDisposableListener(targetElement, EventType.MOUSE_MOVE, onMouseMove, true));
      }
      hoverPreparation = toDispose;
      if (isHTMLElement(e.target) && getHoverTargetElement(e.target, targetElement) !== targetElement) {
        return;
      }
      toDispose.add(triggerShowHover(hoverDelegate.delay, false, target));
    }, "onMouseOver");
    const mouseOverDomEmitter = addDisposableListener(targetElement, EventType.MOUSE_OVER, onMouseOver, true);
    const onFocus = /* @__PURE__ */ __name(() => {
      if (isMouseDown || hoverPreparation) {
        return;
      }
      const target = {
        targetElements: [targetElement],
        dispose: /* @__PURE__ */ __name(() => {
        }, "dispose")
      };
      const toDispose = new DisposableStore();
      const onBlur = /* @__PURE__ */ __name(() => hideHover(true, true), "onBlur");
      toDispose.add(addDisposableListener(targetElement, EventType.BLUR, onBlur, true));
      toDispose.add(triggerShowHover(hoverDelegate.delay, false, target));
      hoverPreparation = toDispose;
    }, "onFocus");
    let focusDomEmitter;
    if (!isEditableElement(targetElement)) {
      focusDomEmitter = addDisposableListener(targetElement, EventType.FOCUS, onFocus, true);
    }
    const hover = {
      show: /* @__PURE__ */ __name((focus) => {
        hideHover(false, true);
        triggerShowHover(0, focus, void 0, focus);
      }, "show"),
      hide: /* @__PURE__ */ __name(() => {
        hideHover(true, true);
      }, "hide"),
      update: /* @__PURE__ */ __name(async (newContent, hoverOptions) => {
        content = newContent;
        await hoverWidget?.update(content, void 0, hoverOptions);
      }, "update"),
      dispose: /* @__PURE__ */ __name(() => {
        this._managedHovers.delete(targetElement);
        mouseOverDomEmitter.dispose();
        mouseLeaveEmitter.dispose();
        mouseDownEmitter.dispose();
        mouseUpEmitter.dispose();
        focusDomEmitter?.dispose();
        hideHover(true, true);
      }, "dispose")
    };
    this._managedHovers.set(targetElement, hover);
    return hover;
  }
  showManagedHover(target) {
    const hover = this._managedHovers.get(target);
    if (hover) {
      hover.show(true);
    }
  }
  dispose() {
    this._managedHovers.forEach((hover) => hover.dispose());
    super.dispose();
  }
};
HoverService = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IContextMenuService),
  __decorateParam(2, IKeybindingService),
  __decorateParam(3, ILayoutService),
  __decorateParam(4, IAccessibilityService)
], HoverService);
function getHoverOptionsIdentity(options) {
  if (options === void 0) {
    return void 0;
  }
  return options?.id ?? options;
}
__name(getHoverOptionsIdentity, "getHoverOptionsIdentity");
class HoverContextViewDelegate {
  constructor(_hover, _focus = false) {
    this._hover = _hover;
    this._focus = _focus;
  }
  static {
    __name(this, "HoverContextViewDelegate");
  }
  // Render over all other context views
  layer = 1;
  get anchorPosition() {
    return this._hover.anchor;
  }
  render(container) {
    this._hover.render(container);
    if (this._focus) {
      this._hover.focus();
    }
    return this._hover;
  }
  getAnchor() {
    return {
      x: this._hover.x,
      y: this._hover.y
    };
  }
  layout() {
    this._hover.layout();
  }
}
function getHoverTargetElement(element, stopElement) {
  stopElement = stopElement ?? getWindow(element).document.body;
  while (!element.hasAttribute("custom-hover") && element !== stopElement) {
    element = element.parentElement;
  }
  return element;
}
__name(getHoverTargetElement, "getHoverTargetElement");
registerSingleton(IHoverService, HoverService, InstantiationType.Delayed);
registerThemingParticipant((theme, collector) => {
  const hoverBorder = theme.getColor(editorHoverBorder);
  if (hoverBorder) {
    collector.addRule(`.monaco-workbench .workbench-hover .hover-row:not(:first-child):not(:empty) { border-top: 1px solid ${hoverBorder.transparent(0.5)}; }`);
    collector.addRule(`.monaco-workbench .workbench-hover hr { border-top: 1px solid ${hoverBorder.transparent(0.5)}; }`);
  }
});
export {
  HoverService
};
//# sourceMappingURL=hoverService.js.map
