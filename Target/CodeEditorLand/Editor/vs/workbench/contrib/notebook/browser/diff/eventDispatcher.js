import { Emitter } from "../../../../../base/common/event.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
var NotebookDiffViewEventType = /* @__PURE__ */ ((NotebookDiffViewEventType2) => {
  NotebookDiffViewEventType2[NotebookDiffViewEventType2["LayoutChanged"] = 1] = "LayoutChanged";
  NotebookDiffViewEventType2[NotebookDiffViewEventType2["CellLayoutChanged"] = 2] = "CellLayoutChanged";
  return NotebookDiffViewEventType2;
})(NotebookDiffViewEventType || {});
class NotebookDiffLayoutChangedEvent {
  constructor(source, value) {
    this.source = source;
    this.value = value;
  }
  type = 1 /* LayoutChanged */;
}
class NotebookCellLayoutChangedEvent {
  constructor(source) {
    this.source = source;
  }
  type = 2 /* CellLayoutChanged */;
}
class NotebookDiffEditorEventDispatcher extends Disposable {
  _onDidChangeLayout = this._register(
    new Emitter()
  );
  onDidChangeLayout = this._onDidChangeLayout.event;
  _onDidChangeCellLayout = this._register(
    new Emitter()
  );
  onDidChangeCellLayout = this._onDidChangeCellLayout.event;
  emit(events) {
    for (let i = 0, len = events.length; i < len; i++) {
      const e = events[i];
      switch (e.type) {
        case 1 /* LayoutChanged */:
          this._onDidChangeLayout.fire(e);
          break;
        case 2 /* CellLayoutChanged */:
          this._onDidChangeCellLayout.fire(e);
          break;
      }
    }
  }
}
export {
  NotebookCellLayoutChangedEvent,
  NotebookDiffEditorEventDispatcher,
  NotebookDiffLayoutChangedEvent,
  NotebookDiffViewEventType
};
