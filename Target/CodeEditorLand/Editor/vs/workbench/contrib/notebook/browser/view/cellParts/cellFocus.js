import * as DOM from "../../../../../../base/browser/dom.js";
import { CellContentPart } from "../cellPart.js";
class CellFocusPart extends CellContentPart {
  constructor(containerElement, focusSinkElement, notebookEditor) {
    super();
    this._register(
      DOM.addDisposableListener(
        containerElement,
        DOM.EventType.FOCUS,
        () => {
          if (this.currentCell) {
            notebookEditor.focusElement(this.currentCell);
          }
        },
        true
      )
    );
    if (focusSinkElement) {
      this._register(
        DOM.addDisposableListener(
          focusSinkElement,
          DOM.EventType.FOCUS,
          () => {
            if (this.currentCell && this.currentCell.outputsViewModels.length) {
              notebookEditor.focusNotebookCell(
                this.currentCell,
                "output"
              );
            }
          }
        )
      );
    }
  }
}
export {
  CellFocusPart
};
