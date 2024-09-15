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
import "./media/chatConfirmationWidget.css";
import { Button } from "../../../../../base/browser/ui/button/button.js";
import { Emitter, Event } from "../../../../../base/common/event.js";
import { MarkdownString } from "../../../../../base/common/htmlContent.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { MarkdownRenderer } from "../../../../../editor/browser/widget/markdownRenderer/browser/markdownRenderer.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { defaultButtonStyles } from "../../../../../platform/theme/browser/defaultStyles.js";
let ChatConfirmationWidget = class extends Disposable {
  constructor(title, message, buttons, instantiationService) {
    super();
    this.instantiationService = instantiationService;
    const elements = dom.h(".chat-confirmation-widget@root", [
      dom.h(".chat-confirmation-widget-title@title"),
      dom.h(".chat-confirmation-widget-message@message"),
      dom.h(".chat-confirmation-buttons-container@buttonsContainer")
    ]);
    this._domNode = elements.root;
    const renderer = this._register(this.instantiationService.createInstance(MarkdownRenderer, {}));
    const renderedTitle = this._register(renderer.render(new MarkdownString(title)));
    elements.title.appendChild(renderedTitle.element);
    const renderedMessage = this._register(renderer.render(new MarkdownString(message)));
    elements.message.appendChild(renderedMessage.element);
    buttons.forEach((buttonData) => {
      const button = new Button(elements.buttonsContainer, { ...defaultButtonStyles, secondary: buttonData.isSecondary });
      button.label = buttonData.label;
      this._register(button.onDidClick(() => this._onDidClick.fire(buttonData)));
    });
  }
  static {
    __name(this, "ChatConfirmationWidget");
  }
  _onDidClick = this._register(new Emitter());
  get onDidClick() {
    return this._onDidClick.event;
  }
  _domNode;
  get domNode() {
    return this._domNode;
  }
  setShowButtons(showButton) {
    this.domNode.classList.toggle("hideButtons", !showButton);
  }
};
ChatConfirmationWidget = __decorateClass([
  __decorateParam(3, IInstantiationService)
], ChatConfirmationWidget);
export {
  ChatConfirmationWidget
};
//# sourceMappingURL=chatConfirmationWidget.js.map
