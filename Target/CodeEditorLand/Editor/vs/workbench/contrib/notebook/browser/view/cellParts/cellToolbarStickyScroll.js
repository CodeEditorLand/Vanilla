var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IDisposable } from "../../../../../../base/common/lifecycle.js";
import { clamp } from "../../../../../../base/common/numbers.js";
import { ICellViewModel, INotebookEditor } from "../../notebookBrowser.js";
function registerCellToolbarStickyScroll(notebookEditor, cell, element, opts) {
  const extraOffset = opts?.extraOffset ?? 0;
  const min = opts?.min ?? 0;
  const updateForScroll = /* @__PURE__ */ __name(() => {
    if (cell.isInputCollapsed) {
      element.style.top = "";
    } else {
      const scrollTop = notebookEditor.scrollTop;
      const elementTop = notebookEditor.getAbsoluteTopOfElement(cell);
      const diff = scrollTop - elementTop + extraOffset;
      const maxTop = cell.layoutInfo.editorHeight + cell.layoutInfo.statusBarHeight - 45;
      const top = maxTop > 20 ? (
        // Don't move the run button if it can only move a very short distance
        clamp(min, diff, maxTop)
      ) : min;
      element.style.top = `${top}px`;
    }
  }, "updateForScroll");
  updateForScroll();
  return notebookEditor.onDidScroll(() => updateForScroll());
}
__name(registerCellToolbarStickyScroll, "registerCellToolbarStickyScroll");
export {
  registerCellToolbarStickyScroll
};
//# sourceMappingURL=cellToolbarStickyScroll.js.map
