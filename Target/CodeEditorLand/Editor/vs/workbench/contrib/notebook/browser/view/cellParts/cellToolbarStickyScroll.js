import { clamp } from "../../../../../../base/common/numbers.js";
function registerCellToolbarStickyScroll(notebookEditor, cell, element, opts) {
  const extraOffset = opts?.extraOffset ?? 0;
  const min = opts?.min ?? 0;
  const updateForScroll = () => {
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
  };
  updateForScroll();
  return notebookEditor.onDidScroll(() => updateForScroll());
}
export {
  registerCellToolbarStickyScroll
};
