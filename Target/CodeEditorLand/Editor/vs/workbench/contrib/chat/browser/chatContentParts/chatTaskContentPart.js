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
import * as dom from "../../../../../base/browser/dom.js";
import { Event } from "../../../../../base/common/event.js";
import {
  Disposable
} from "../../../../../base/common/lifecycle.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { ChatProgressContentPart } from "./chatProgressContentPart.js";
import {
  ChatCollapsibleListContentPart
} from "./chatReferencesContentPart.js";
let ChatTaskContentPart = class extends Disposable {
  constructor(task, contentReferencesListPool, renderer, context, instantiationService) {
    super();
    this.task = task;
    if (task.progress.length) {
      const refsPart = this._register(
        instantiationService.createInstance(
          ChatCollapsibleListContentPart,
          task.progress,
          task.content.value,
          context.element,
          contentReferencesListPool
        )
      );
      this.domNode = dom.$(".chat-progress-task");
      this.domNode.appendChild(refsPart.domNode);
      this.onDidChangeHeight = refsPart.onDidChangeHeight;
    } else {
      const isSettled = task.isSettled?.() ?? true;
      const progressPart = this._register(
        instantiationService.createInstance(
          ChatProgressContentPart,
          task,
          renderer,
          context,
          !isSettled,
          true
        )
      );
      this.domNode = progressPart.domNode;
      this.onDidChangeHeight = Event.None;
    }
  }
  static {
    __name(this, "ChatTaskContentPart");
  }
  domNode;
  onDidChangeHeight;
  hasSameContent(other) {
    return other.kind === "progressTask" && other.progress.length === this.task.progress.length && other.isSettled() === this.task.isSettled();
  }
  addDisposable(disposable) {
    this._register(disposable);
  }
};
ChatTaskContentPart = __decorateClass([
  __decorateParam(4, IInstantiationService)
], ChatTaskContentPart);
export {
  ChatTaskContentPart
};
//# sourceMappingURL=chatTaskContentPart.js.map
