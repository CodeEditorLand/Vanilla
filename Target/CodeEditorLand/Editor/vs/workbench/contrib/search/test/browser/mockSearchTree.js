var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { ITreeNavigator } from "../../../../../base/browser/ui/tree/tree.js";
import { Emitter } from "../../../../../base/common/event.js";
import { IDisposable } from "../../../../../base/common/lifecycle.js";
import { RenderableMatch } from "../../browser/searchModel.js";
const someEvent = new Emitter().event;
class MockObjectTree {
  constructor(elements) {
    this.elements = elements;
  }
  static {
    __name(this, "MockObjectTree");
  }
  get onDidChangeFocus() {
    return someEvent;
  }
  get onDidChangeSelection() {
    return someEvent;
  }
  get onDidOpen() {
    return someEvent;
  }
  get onMouseClick() {
    return someEvent;
  }
  get onMouseDblClick() {
    return someEvent;
  }
  get onContextMenu() {
    return someEvent;
  }
  get onKeyDown() {
    return someEvent;
  }
  get onKeyUp() {
    return someEvent;
  }
  get onKeyPress() {
    return someEvent;
  }
  get onDidFocus() {
    return someEvent;
  }
  get onDidBlur() {
    return someEvent;
  }
  get onDidChangeCollapseState() {
    return someEvent;
  }
  get onDidChangeRenderNodeCount() {
    return someEvent;
  }
  get onDidDispose() {
    return someEvent;
  }
  get lastVisibleElement() {
    return this.elements[this.elements.length - 1];
  }
  domFocus() {
  }
  collapse(location, recursive = false) {
    return true;
  }
  expand(location, recursive = false) {
    return true;
  }
  navigate(start) {
    const startIdx = start ? this.elements.indexOf(start) : void 0;
    return new ArrayNavigator(this.elements, startIdx);
  }
  getParentElement(elem) {
    return elem.parent();
  }
  dispose() {
  }
}
class ArrayNavigator {
  constructor(elements, index = 0) {
    this.elements = elements;
    this.index = index;
  }
  static {
    __name(this, "ArrayNavigator");
  }
  current() {
    return this.elements[this.index];
  }
  previous() {
    return this.elements[--this.index];
  }
  first() {
    this.index = 0;
    return this.elements[this.index];
  }
  last() {
    this.index = this.elements.length - 1;
    return this.elements[this.index];
  }
  next() {
    return this.elements[++this.index];
  }
}
export {
  MockObjectTree
};
//# sourceMappingURL=mockSearchTree.js.map
