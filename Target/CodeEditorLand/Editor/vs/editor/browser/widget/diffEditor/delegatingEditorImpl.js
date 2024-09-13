var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Emitter } from "../../../../base/common/event.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import {
  ScrollType
} from "../../../common/editorCommon.js";
class DelegatingEditor extends Disposable {
  static {
    __name(this, "DelegatingEditor");
  }
  static idCounter = 0;
  _id = ++DelegatingEditor.idCounter;
  _onDidDispose = this._register(new Emitter());
  onDidDispose = this._onDidDispose.event;
  getId() {
    return this.getEditorType() + ":v2:" + this._id;
  }
  // #region editorBrowser.IDiffEditor: Delegating to modified Editor
  getVisibleColumnFromPosition(position) {
    return this._targetEditor.getVisibleColumnFromPosition(position);
  }
  getStatusbarColumn(position) {
    return this._targetEditor.getStatusbarColumn(position);
  }
  getPosition() {
    return this._targetEditor.getPosition();
  }
  setPosition(position, source = "api") {
    this._targetEditor.setPosition(position, source);
  }
  revealLine(lineNumber, scrollType = ScrollType.Smooth) {
    this._targetEditor.revealLine(lineNumber, scrollType);
  }
  revealLineInCenter(lineNumber, scrollType = ScrollType.Smooth) {
    this._targetEditor.revealLineInCenter(lineNumber, scrollType);
  }
  revealLineInCenterIfOutsideViewport(lineNumber, scrollType = ScrollType.Smooth) {
    this._targetEditor.revealLineInCenterIfOutsideViewport(
      lineNumber,
      scrollType
    );
  }
  revealLineNearTop(lineNumber, scrollType = ScrollType.Smooth) {
    this._targetEditor.revealLineNearTop(lineNumber, scrollType);
  }
  revealPosition(position, scrollType = ScrollType.Smooth) {
    this._targetEditor.revealPosition(position, scrollType);
  }
  revealPositionInCenter(position, scrollType = ScrollType.Smooth) {
    this._targetEditor.revealPositionInCenter(position, scrollType);
  }
  revealPositionInCenterIfOutsideViewport(position, scrollType = ScrollType.Smooth) {
    this._targetEditor.revealPositionInCenterIfOutsideViewport(
      position,
      scrollType
    );
  }
  revealPositionNearTop(position, scrollType = ScrollType.Smooth) {
    this._targetEditor.revealPositionNearTop(position, scrollType);
  }
  getSelection() {
    return this._targetEditor.getSelection();
  }
  getSelections() {
    return this._targetEditor.getSelections();
  }
  setSelection(something, source = "api") {
    this._targetEditor.setSelection(something, source);
  }
  setSelections(ranges, source = "api") {
    this._targetEditor.setSelections(ranges, source);
  }
  revealLines(startLineNumber, endLineNumber, scrollType = ScrollType.Smooth) {
    this._targetEditor.revealLines(
      startLineNumber,
      endLineNumber,
      scrollType
    );
  }
  revealLinesInCenter(startLineNumber, endLineNumber, scrollType = ScrollType.Smooth) {
    this._targetEditor.revealLinesInCenter(
      startLineNumber,
      endLineNumber,
      scrollType
    );
  }
  revealLinesInCenterIfOutsideViewport(startLineNumber, endLineNumber, scrollType = ScrollType.Smooth) {
    this._targetEditor.revealLinesInCenterIfOutsideViewport(
      startLineNumber,
      endLineNumber,
      scrollType
    );
  }
  revealLinesNearTop(startLineNumber, endLineNumber, scrollType = ScrollType.Smooth) {
    this._targetEditor.revealLinesNearTop(
      startLineNumber,
      endLineNumber,
      scrollType
    );
  }
  revealRange(range, scrollType = ScrollType.Smooth, revealVerticalInCenter = false, revealHorizontal = true) {
    this._targetEditor.revealRange(
      range,
      scrollType,
      revealVerticalInCenter,
      revealHorizontal
    );
  }
  revealRangeInCenter(range, scrollType = ScrollType.Smooth) {
    this._targetEditor.revealRangeInCenter(range, scrollType);
  }
  revealRangeInCenterIfOutsideViewport(range, scrollType = ScrollType.Smooth) {
    this._targetEditor.revealRangeInCenterIfOutsideViewport(
      range,
      scrollType
    );
  }
  revealRangeNearTop(range, scrollType = ScrollType.Smooth) {
    this._targetEditor.revealRangeNearTop(range, scrollType);
  }
  revealRangeNearTopIfOutsideViewport(range, scrollType = ScrollType.Smooth) {
    this._targetEditor.revealRangeNearTopIfOutsideViewport(
      range,
      scrollType
    );
  }
  revealRangeAtTop(range, scrollType = ScrollType.Smooth) {
    this._targetEditor.revealRangeAtTop(range, scrollType);
  }
  getSupportedActions() {
    return this._targetEditor.getSupportedActions();
  }
  focus() {
    this._targetEditor.focus();
  }
  trigger(source, handlerId, payload) {
    this._targetEditor.trigger(source, handlerId, payload);
  }
  createDecorationsCollection(decorations) {
    return this._targetEditor.createDecorationsCollection(decorations);
  }
  changeDecorations(callback) {
    return this._targetEditor.changeDecorations(callback);
  }
  // #endregion
}
export {
  DelegatingEditor
};
//# sourceMappingURL=delegatingEditorImpl.js.map
