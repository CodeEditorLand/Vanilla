import { CellContentPart } from "../../cellPart.js";
class CellChatPart extends CellContentPart {
  // private _controller: NotebookCellChatController | undefined;
  get activeCell() {
    return this.currentCell;
  }
  constructor(_notebookEditor, _partContainer) {
    super();
  }
  didRenderCell(element) {
    super.didRenderCell(element);
  }
  unrenderCell(element) {
    super.unrenderCell(element);
  }
  updateInternalLayoutNow(element) {
  }
  dispose() {
    super.dispose();
  }
}
export {
  CellChatPart
};
