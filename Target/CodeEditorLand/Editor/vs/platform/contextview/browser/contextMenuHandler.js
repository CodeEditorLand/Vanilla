var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IContextMenuDelegate } from "../../../base/browser/contextmenu.js";
import { $, addDisposableListener, EventType, getActiveElement, getWindow, isAncestor, isHTMLElement } from "../../../base/browser/dom.js";
import { StandardMouseEvent } from "../../../base/browser/mouseEvent.js";
import { Menu } from "../../../base/browser/ui/menu/menu.js";
import { ActionRunner, IRunEvent, WorkbenchActionExecutedClassification, WorkbenchActionExecutedEvent } from "../../../base/common/actions.js";
import { isCancellationError } from "../../../base/common/errors.js";
import { combinedDisposable, DisposableStore, IDisposable } from "../../../base/common/lifecycle.js";
import { IContextViewService } from "./contextView.js";
import { IKeybindingService } from "../../keybinding/common/keybinding.js";
import { INotificationService } from "../../notification/common/notification.js";
import { ITelemetryService } from "../../telemetry/common/telemetry.js";
import { defaultMenuStyles } from "../../theme/browser/defaultStyles.js";
class ContextMenuHandler {
  constructor(contextViewService, telemetryService, notificationService, keybindingService) {
    this.contextViewService = contextViewService;
    this.telemetryService = telemetryService;
    this.notificationService = notificationService;
    this.keybindingService = keybindingService;
  }
  static {
    __name(this, "ContextMenuHandler");
  }
  focusToReturn = null;
  lastContainer = null;
  block = null;
  blockDisposable = null;
  options = { blockMouse: true };
  configure(options) {
    this.options = options;
  }
  showContextMenu(delegate) {
    const actions = delegate.getActions();
    if (!actions.length) {
      return;
    }
    this.focusToReturn = getActiveElement();
    let menu;
    const shadowRootElement = isHTMLElement(delegate.domForShadowRoot) ? delegate.domForShadowRoot : void 0;
    this.contextViewService.showContextView({
      getAnchor: /* @__PURE__ */ __name(() => delegate.getAnchor(), "getAnchor"),
      canRelayout: false,
      anchorAlignment: delegate.anchorAlignment,
      anchorAxisAlignment: delegate.anchorAxisAlignment,
      render: /* @__PURE__ */ __name((container) => {
        this.lastContainer = container;
        const className = delegate.getMenuClassName ? delegate.getMenuClassName() : "";
        if (className) {
          container.className += " " + className;
        }
        if (this.options.blockMouse) {
          this.block = container.appendChild($(".context-view-block"));
          this.block.style.position = "fixed";
          this.block.style.cursor = "initial";
          this.block.style.left = "0";
          this.block.style.top = "0";
          this.block.style.width = "100%";
          this.block.style.height = "100%";
          this.block.style.zIndex = "-1";
          this.blockDisposable?.dispose();
          this.blockDisposable = addDisposableListener(this.block, EventType.MOUSE_DOWN, (e) => e.stopPropagation());
        }
        const menuDisposables = new DisposableStore();
        const actionRunner = delegate.actionRunner || new ActionRunner();
        actionRunner.onWillRun((evt) => this.onActionRun(evt, !delegate.skipTelemetry), this, menuDisposables);
        actionRunner.onDidRun(this.onDidActionRun, this, menuDisposables);
        menu = new Menu(
          container,
          actions,
          {
            actionViewItemProvider: delegate.getActionViewItem,
            context: delegate.getActionsContext ? delegate.getActionsContext() : null,
            actionRunner,
            getKeyBinding: delegate.getKeyBinding ? delegate.getKeyBinding : (action) => this.keybindingService.lookupKeybinding(action.id)
          },
          defaultMenuStyles
        );
        menu.onDidCancel(() => this.contextViewService.hideContextView(true), null, menuDisposables);
        menu.onDidBlur(() => this.contextViewService.hideContextView(true), null, menuDisposables);
        const targetWindow = getWindow(container);
        menuDisposables.add(addDisposableListener(targetWindow, EventType.BLUR, () => this.contextViewService.hideContextView(true)));
        menuDisposables.add(addDisposableListener(targetWindow, EventType.MOUSE_DOWN, (e) => {
          if (e.defaultPrevented) {
            return;
          }
          const event = new StandardMouseEvent(targetWindow, e);
          let element = event.target;
          if (event.rightButton) {
            return;
          }
          while (element) {
            if (element === container) {
              return;
            }
            element = element.parentElement;
          }
          this.contextViewService.hideContextView(true);
        }));
        return combinedDisposable(menuDisposables, menu);
      }, "render"),
      focus: /* @__PURE__ */ __name(() => {
        menu?.focus(!!delegate.autoSelectFirstItem);
      }, "focus"),
      onHide: /* @__PURE__ */ __name((didCancel) => {
        delegate.onHide?.(!!didCancel);
        if (this.block) {
          this.block.remove();
          this.block = null;
        }
        this.blockDisposable?.dispose();
        this.blockDisposable = null;
        if (!!this.lastContainer && (getActiveElement() === this.lastContainer || isAncestor(getActiveElement(), this.lastContainer))) {
          this.focusToReturn?.focus();
        }
        this.lastContainer = null;
      }, "onHide")
    }, shadowRootElement, !!shadowRootElement);
  }
  onActionRun(e, logTelemetry) {
    if (logTelemetry) {
      this.telemetryService.publicLog2("workbenchActionExecuted", { id: e.action.id, from: "contextMenu" });
    }
    this.contextViewService.hideContextView(false);
  }
  onDidActionRun(e) {
    if (e.error && !isCancellationError(e.error)) {
      this.notificationService.error(e.error);
    }
  }
}
export {
  ContextMenuHandler
};
//# sourceMappingURL=contextMenuHandler.js.map
