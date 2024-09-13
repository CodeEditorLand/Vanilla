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
import { IAction, Action, Separator } from "../../../base/common/actions.js";
import { localize } from "../../../nls.js";
import { IWorkbenchLayoutService } from "../../services/layout/browser/layoutService.js";
import { IContextMenuService } from "../../../platform/contextview/browser/contextView.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import { EventHelper, addDisposableListener, getActiveDocument, getWindow, isHTMLElement, isHTMLInputElement, isHTMLTextAreaElement } from "../../../base/browser/dom.js";
import { IWorkbenchContribution, WorkbenchPhase, registerWorkbenchContribution2 } from "../../common/contributions.js";
import { isNative } from "../../../base/common/platform.js";
import { IClipboardService } from "../../../platform/clipboard/common/clipboardService.js";
import { StandardMouseEvent } from "../../../base/browser/mouseEvent.js";
import { Event as BaseEvent } from "../../../base/common/event.js";
import { Lazy } from "../../../base/common/lazy.js";
let TextInputActionsProvider = class extends Disposable {
  constructor(layoutService, contextMenuService, clipboardService) {
    super();
    this.layoutService = layoutService;
    this.contextMenuService = contextMenuService;
    this.clipboardService = clipboardService;
    this.registerListeners();
  }
  static {
    __name(this, "TextInputActionsProvider");
  }
  static ID = "workbench.contrib.textInputActionsProvider";
  textInputActions = new Lazy(() => this.createActions());
  createActions() {
    return [
      // Undo/Redo
      new Action("undo", localize("undo", "Undo"), void 0, true, async () => getActiveDocument().execCommand("undo")),
      new Action("redo", localize("redo", "Redo"), void 0, true, async () => getActiveDocument().execCommand("redo")),
      new Separator(),
      // Cut / Copy / Paste
      new Action("editor.action.clipboardCutAction", localize("cut", "Cut"), void 0, true, async () => getActiveDocument().execCommand("cut")),
      new Action("editor.action.clipboardCopyAction", localize("copy", "Copy"), void 0, true, async () => getActiveDocument().execCommand("copy")),
      new Action("editor.action.clipboardPasteAction", localize("paste", "Paste"), void 0, true, async (element) => {
        if (isNative) {
          getActiveDocument().execCommand("paste");
        } else {
          const clipboardText = await this.clipboardService.readText();
          if (isHTMLTextAreaElement(element) || isHTMLInputElement(element)) {
            const selectionStart = element.selectionStart || 0;
            const selectionEnd = element.selectionEnd || 0;
            element.value = `${element.value.substring(0, selectionStart)}${clipboardText}${element.value.substring(selectionEnd, element.value.length)}`;
            element.selectionStart = selectionStart + clipboardText.length;
            element.selectionEnd = element.selectionStart;
            element.dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));
          }
        }
      }),
      new Separator(),
      // Select All
      new Action("editor.action.selectAll", localize("selectAll", "Select All"), void 0, true, async () => getActiveDocument().execCommand("selectAll"))
    ];
  }
  registerListeners() {
    this._register(BaseEvent.runAndSubscribe(this.layoutService.onDidAddContainer, ({ container, disposables }) => {
      disposables.add(addDisposableListener(container, "contextmenu", (e) => this.onContextMenu(getWindow(container), e)));
    }, { container: this.layoutService.mainContainer, disposables: this._store }));
  }
  onContextMenu(targetWindow, e) {
    if (e.defaultPrevented) {
      return;
    }
    const target = e.target;
    if (!isHTMLElement(target) || target.nodeName.toLowerCase() !== "input" && target.nodeName.toLowerCase() !== "textarea") {
      return;
    }
    EventHelper.stop(e, true);
    const event = new StandardMouseEvent(targetWindow, e);
    this.contextMenuService.showContextMenu({
      getAnchor: /* @__PURE__ */ __name(() => event, "getAnchor"),
      getActions: /* @__PURE__ */ __name(() => this.textInputActions.value, "getActions"),
      getActionsContext: /* @__PURE__ */ __name(() => target, "getActionsContext")
    });
  }
};
TextInputActionsProvider = __decorateClass([
  __decorateParam(0, IWorkbenchLayoutService),
  __decorateParam(1, IContextMenuService),
  __decorateParam(2, IClipboardService)
], TextInputActionsProvider);
registerWorkbenchContribution2(
  TextInputActionsProvider.ID,
  TextInputActionsProvider,
  WorkbenchPhase.BlockRestore
  // Block to allow right-click into input fields before restore finished
);
export {
  TextInputActionsProvider
};
//# sourceMappingURL=textInputActions.js.map
