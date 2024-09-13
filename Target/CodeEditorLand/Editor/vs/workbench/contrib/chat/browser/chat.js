var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { localize } from "../../../../nls.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { CHAT_PROVIDER_ID } from "../common/chatParticipantContribTypes.js";
const IChatWidgetService = createDecorator("chatWidgetService");
async function showChatView(viewsService) {
  return (await viewsService.openView(CHAT_VIEW_ID))?.widget;
}
__name(showChatView, "showChatView");
const IQuickChatService = createDecorator("quickChatService");
const IChatAccessibilityService = createDecorator("chatAccessibilityService");
const IChatCodeBlockContextProviderService = createDecorator(
  "chatCodeBlockContextProviderService"
);
const GeneratingPhrase = localize("generating", "Generating");
const CHAT_VIEW_ID = `workbench.panel.chat.view.${CHAT_PROVIDER_ID}`;
export {
  CHAT_VIEW_ID,
  GeneratingPhrase,
  IChatAccessibilityService,
  IChatCodeBlockContextProviderService,
  IChatWidgetService,
  IQuickChatService,
  showChatView
};
//# sourceMappingURL=chat.js.map
