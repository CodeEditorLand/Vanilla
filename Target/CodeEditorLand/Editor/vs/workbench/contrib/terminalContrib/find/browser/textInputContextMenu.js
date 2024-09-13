var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import {
  getActiveWindow,
  isHTMLInputElement,
  isHTMLTextAreaElement
} from "../../../../../base/browser/dom.js";
import { StandardMouseEvent } from "../../../../../base/browser/mouseEvent.js";
import {
  Action,
  Separator
} from "../../../../../base/common/actions.js";
import { isNative } from "../../../../../base/common/platform.js";
import { localize } from "../../../../../nls.js";
function openContextMenu(targetWindow, event, clipboardService, contextMenuService) {
  const standardEvent = new StandardMouseEvent(targetWindow, event);
  const actions = [];
  actions.push(
    // Undo/Redo
    new Action(
      "undo",
      localize("undo", "Undo"),
      void 0,
      true,
      async () => getActiveWindow().document.execCommand("undo")
    ),
    new Action(
      "redo",
      localize("redo", "Redo"),
      void 0,
      true,
      async () => getActiveWindow().document.execCommand("redo")
    ),
    new Separator(),
    // Cut / Copy / Paste
    new Action(
      "editor.action.clipboardCutAction",
      localize("cut", "Cut"),
      void 0,
      true,
      async () => getActiveWindow().document.execCommand("cut")
    ),
    new Action(
      "editor.action.clipboardCopyAction",
      localize("copy", "Copy"),
      void 0,
      true,
      async () => getActiveWindow().document.execCommand("copy")
    ),
    new Action(
      "editor.action.clipboardPasteAction",
      localize("paste", "Paste"),
      void 0,
      true,
      async (element) => {
        if (isNative) {
          getActiveWindow().document.execCommand("paste");
        } else {
          const clipboardText = await clipboardService.readText();
          if (isHTMLTextAreaElement(element) || isHTMLInputElement(element)) {
            const selectionStart = element.selectionStart || 0;
            const selectionEnd = element.selectionEnd || 0;
            element.value = `${element.value.substring(0, selectionStart)}${clipboardText}${element.value.substring(selectionEnd, element.value.length)}`;
            element.selectionStart = selectionStart + clipboardText.length;
            element.selectionEnd = element.selectionStart;
          }
        }
      }
    ),
    new Separator(),
    // Select All
    new Action(
      "editor.action.selectAll",
      localize("selectAll", "Select All"),
      void 0,
      true,
      async () => getActiveWindow().document.execCommand("selectAll")
    )
  );
  contextMenuService.showContextMenu({
    getAnchor: /* @__PURE__ */ __name(() => standardEvent, "getAnchor"),
    getActions: /* @__PURE__ */ __name(() => actions, "getActions"),
    getActionsContext: /* @__PURE__ */ __name(() => event.target, "getActionsContext")
  });
}
__name(openContextMenu, "openContextMenu");
export {
  openContextMenu
};
//# sourceMappingURL=textInputContextMenu.js.map
