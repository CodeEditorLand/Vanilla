var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { Emitter } from "../../../../../base/common/event.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { ICodeEditor } from "../../../../../editor/browser/editorBrowser.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { AnyStackFrame, CallStackFrame, CallStackWidget } from "../../../debug/browser/callStackWidget.js";
import { ITestMessageStackFrame } from "../../common/testTypes.js";
let TestResultStackWidget = class extends Disposable {
  constructor(container, containingEditor, instantiationService) {
    super();
    this.container = container;
    this.widget = this._register(instantiationService.createInstance(
      CallStackWidget,
      container,
      containingEditor
    ));
  }
  static {
    __name(this, "TestResultStackWidget");
  }
  widget;
  changeStackFrameEmitter = this._register(new Emitter());
  onDidChangeStackFrame = this.changeStackFrameEmitter.event;
  collapseAll() {
    this.widget.collapseAll();
  }
  update(messageFrame, stack) {
    this.widget.setFrames([messageFrame, ...stack.map((frame) => new CallStackFrame(
      frame.label,
      frame.uri,
      frame.position?.lineNumber,
      frame.position?.column
    ))]);
  }
  layout(height, width) {
    this.widget.layout(height ?? this.container.clientHeight, width);
  }
};
TestResultStackWidget = __decorateClass([
  __decorateParam(2, IInstantiationService)
], TestResultStackWidget);
export {
  TestResultStackWidget
};
//# sourceMappingURL=testMessageStack.js.map
