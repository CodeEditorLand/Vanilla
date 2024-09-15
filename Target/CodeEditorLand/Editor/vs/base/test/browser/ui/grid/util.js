var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { IView } from "../../../../browser/ui/grid/grid.js";
import { GridNode, isGridBranchNode } from "../../../../browser/ui/grid/gridview.js";
import { Emitter, Event } from "../../../../common/event.js";
class TestView {
  constructor(_minimumWidth, _maximumWidth, _minimumHeight, _maximumHeight) {
    this._minimumWidth = _minimumWidth;
    this._maximumWidth = _maximumWidth;
    this._minimumHeight = _minimumHeight;
    this._maximumHeight = _maximumHeight;
    assert(_minimumWidth <= _maximumWidth, "gridview view minimum width must be <= maximum width");
    assert(_minimumHeight <= _maximumHeight, "gridview view minimum height must be <= maximum height");
  }
  static {
    __name(this, "TestView");
  }
  _onDidChange = new Emitter();
  onDidChange = this._onDidChange.event;
  get minimumWidth() {
    return this._minimumWidth;
  }
  set minimumWidth(size) {
    this._minimumWidth = size;
    this._onDidChange.fire(void 0);
  }
  get maximumWidth() {
    return this._maximumWidth;
  }
  set maximumWidth(size) {
    this._maximumWidth = size;
    this._onDidChange.fire(void 0);
  }
  get minimumHeight() {
    return this._minimumHeight;
  }
  set minimumHeight(size) {
    this._minimumHeight = size;
    this._onDidChange.fire(void 0);
  }
  get maximumHeight() {
    return this._maximumHeight;
  }
  set maximumHeight(size) {
    this._maximumHeight = size;
    this._onDidChange.fire(void 0);
  }
  _element = document.createElement("div");
  get element() {
    this._onDidGetElement.fire();
    return this._element;
  }
  _onDidGetElement = new Emitter();
  onDidGetElement = this._onDidGetElement.event;
  _width = 0;
  get width() {
    return this._width;
  }
  _height = 0;
  get height() {
    return this._height;
  }
  _top = 0;
  get top() {
    return this._top;
  }
  _left = 0;
  get left() {
    return this._left;
  }
  get size() {
    return [this.width, this.height];
  }
  _onDidLayout = new Emitter();
  onDidLayout = this._onDidLayout.event;
  _onDidFocus = new Emitter();
  onDidFocus = this._onDidFocus.event;
  layout(width, height, top, left) {
    this._width = width;
    this._height = height;
    this._top = top;
    this._left = left;
    this._onDidLayout.fire({ width, height, top, left });
  }
  focus() {
    this._onDidFocus.fire();
  }
  dispose() {
    this._onDidChange.dispose();
    this._onDidGetElement.dispose();
    this._onDidLayout.dispose();
    this._onDidFocus.dispose();
  }
}
function nodesToArrays(node) {
  if (isGridBranchNode(node)) {
    return node.children.map(nodesToArrays);
  } else {
    return node.view;
  }
}
__name(nodesToArrays, "nodesToArrays");
export {
  TestView,
  nodesToArrays
};
//# sourceMappingURL=util.js.map
