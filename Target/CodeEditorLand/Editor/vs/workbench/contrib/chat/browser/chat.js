var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Event } from "../../../../base/common/event.js";
import { IDisposable } from "../../../../base/common/lifecycle.js";
import { URI } from "../../../../base/common/uri.js";
import { ICodeEditor } from "../../../../editor/browser/editorBrowser.js";
import { Selection } from "../../../../editor/common/core/selection.js";
import { localize } from "../../../../nls.js";
import { MenuId } from "../../../../platform/actions/common/actions.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { ChatViewPane } from "./chatViewPane.js";
import { IChatViewState, IChatWidgetContrib } from "./chatWidget.js";
import { ICodeBlockActionContext } from "./codeBlockPart.js";
import { ChatAgentLocation, IChatAgentCommand, IChatAgentData } from "../common/chatAgents.js";
import { IChatRequestVariableEntry, IChatResponseModel } from "../common/chatModel.js";
import { IParsedChatRequest } from "../common/chatParserTypes.js";
import { CHAT_PROVIDER_ID } from "../common/chatParticipantContribTypes.js";
import { IChatRequestViewModel, IChatResponseViewModel, IChatViewModel, IChatWelcomeMessageViewModel } from "../common/chatViewModel.js";
import { IViewsService } from "../../../services/views/common/viewsService.js";
const IChatWidgetService = createDecorator("chatWidgetService");
async function showChatView(viewsService) {
  return (await viewsService.openView(CHAT_VIEW_ID))?.widget;
}
__name(showChatView, "showChatView");
const IQuickChatService = createDecorator("quickChatService");
const IChatAccessibilityService = createDecorator("chatAccessibilityService");
const IChatCodeBlockContextProviderService = createDecorator("chatCodeBlockContextProviderService");
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
