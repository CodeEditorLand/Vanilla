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
import {
  Disposable
} from "../../../../../base/common/lifecycle.js";
import { localize } from "../../../../../nls.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import {
  IChatService
} from "../../common/chatService.js";
import { isResponseVM } from "../../common/chatViewModel.js";
import { ChatConfirmationWidget } from "./chatConfirmationWidget.js";
let ChatConfirmationContentPart = class extends Disposable {
  constructor(confirmation, context, instantiationService, chatService) {
    super();
    this.instantiationService = instantiationService;
    this.chatService = chatService;
    const element = context.element;
    const buttons = confirmation.buttons ? confirmation.buttons.map((button) => ({
      label: button,
      data: confirmation.data
    })) : [
      {
        label: localize("accept", "Accept"),
        data: confirmation.data
      },
      {
        label: localize("dismiss", "Dismiss"),
        data: confirmation.data,
        isSecondary: true
      }
    ];
    const confirmationWidget = this._register(
      this.instantiationService.createInstance(
        ChatConfirmationWidget,
        confirmation.title,
        confirmation.message,
        buttons
      )
    );
    confirmationWidget.setShowButtons(!confirmation.isUsed);
    this._register(
      confirmationWidget.onDidClick(async (e) => {
        if (isResponseVM(element)) {
          const prompt = `${e.label}: "${confirmation.title}"`;
          const data = e.isSecondary ? { rejectedConfirmationData: [e.data] } : { acceptedConfirmationData: [e.data] };
          data.agentId = element.agent?.id;
          data.slashCommand = element.slashCommand?.name;
          data.confirmation = e.label;
          if (await this.chatService.sendRequest(
            element.sessionId,
            prompt,
            data
          )) {
            confirmation.isUsed = true;
            confirmationWidget.setShowButtons(false);
            this._onDidChangeHeight.fire();
          }
        }
      })
    );
    this.domNode = confirmationWidget.domNode;
  }
  static {
    __name(this, "ChatConfirmationContentPart");
  }
  domNode;
  _onDidChangeHeight = this._register(new Emitter());
  onDidChangeHeight = this._onDidChangeHeight.event;
  hasSameContent(other) {
    return other.kind === "confirmation";
  }
  addDisposable(disposable) {
    this._register(disposable);
  }
};
ChatConfirmationContentPart = __decorateClass([
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IChatService)
], ChatConfirmationContentPart);
export {
  ChatConfirmationContentPart
};
//# sourceMappingURL=chatConfirmationContentPart.js.map
