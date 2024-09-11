var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { illegalArgument } from "../../../base/common/errors.js";
import { MainThreadNotebookEditorsShape } from "./extHost.protocol.js";
import * as extHostConverter from "./extHostTypeConverters.js";
import * as extHostTypes from "./extHostTypes.js";
import * as vscode from "vscode";
import { ExtHostNotebookDocument } from "./extHostNotebookDocument.js";
class ExtHostNotebookEditor {
  constructor(id, _proxy, notebookData, visibleRanges, selections, viewColumn) {
    this.id = id;
    this._proxy = _proxy;
    this.notebookData = notebookData;
    this._selections = selections;
    this._visibleRanges = visibleRanges;
    this._viewColumn = viewColumn;
  }
  static {
    __name(this, "ExtHostNotebookEditor");
  }
  static apiEditorsToExtHost = /* @__PURE__ */ new WeakMap();
  _selections = [];
  _visibleRanges = [];
  _viewColumn;
  _visible = false;
  _editor;
  get apiEditor() {
    if (!this._editor) {
      const that = this;
      this._editor = {
        get notebook() {
          return that.notebookData.apiNotebook;
        },
        get selection() {
          return that._selections[0];
        },
        set selection(selection) {
          this.selections = [selection];
        },
        get selections() {
          return that._selections;
        },
        set selections(value) {
          if (!Array.isArray(value) || !value.every(extHostTypes.NotebookRange.isNotebookRange)) {
            throw illegalArgument("selections");
          }
          that._selections = value;
          that._trySetSelections(value);
        },
        get visibleRanges() {
          return that._visibleRanges;
        },
        revealRange(range, revealType) {
          that._proxy.$tryRevealRange(
            that.id,
            extHostConverter.NotebookRange.from(range),
            revealType ?? extHostTypes.NotebookEditorRevealType.Default
          );
        },
        get viewColumn() {
          return that._viewColumn;
        },
        [Symbol.for("debug.description")]() {
          return `NotebookEditor(${this.notebook.uri.toString()})`;
        }
      };
      ExtHostNotebookEditor.apiEditorsToExtHost.set(this._editor, this);
    }
    return this._editor;
  }
  get visible() {
    return this._visible;
  }
  _acceptVisibility(value) {
    this._visible = value;
  }
  _acceptVisibleRanges(value) {
    this._visibleRanges = value;
  }
  _acceptSelections(selections) {
    this._selections = selections;
  }
  _trySetSelections(value) {
    this._proxy.$trySetSelections(this.id, value.map(extHostConverter.NotebookRange.from));
  }
  _acceptViewColumn(value) {
    this._viewColumn = value;
  }
}
export {
  ExtHostNotebookEditor
};
//# sourceMappingURL=extHostNotebookEditor.js.map
