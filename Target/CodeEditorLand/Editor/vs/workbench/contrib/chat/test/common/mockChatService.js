var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { CancellationToken } from "../../../../../base/common/cancellation.js";
import { Event } from "../../../../../base/common/event.js";
import { URI } from "../../../../../base/common/uri.js";
import { ChatAgentLocation } from "../../common/chatAgents.js";
import { ChatModel, IChatModel, IChatRequestModel, IChatRequestVariableData, ISerializableChatData } from "../../common/chatModel.js";
import { IParsedChatRequest } from "../../common/chatParserTypes.js";
import { IChatCompleteResponse, IChatDetail, IChatProviderInfo, IChatSendRequestData, IChatSendRequestOptions, IChatService, IChatTransferredSessionData, IChatUserActionEvent } from "../../common/chatService.js";
class MockChatService {
  static {
    __name(this, "MockChatService");
  }
  _serviceBrand;
  transferredSessionData;
  isEnabled(location) {
    throw new Error("Method not implemented.");
  }
  hasSessions() {
    throw new Error("Method not implemented.");
  }
  getProviderInfos() {
    throw new Error("Method not implemented.");
  }
  startSession(location, token) {
    throw new Error("Method not implemented.");
  }
  getSession(sessionId) {
    return {};
  }
  getOrRestoreSession(sessionId) {
    throw new Error("Method not implemented.");
  }
  loadSessionFromContent(data) {
    throw new Error("Method not implemented.");
  }
  /**
   * Returns whether the request was accepted.
   */
  sendRequest(sessionId, message) {
    throw new Error("Method not implemented.");
  }
  resendRequest(request, options) {
    throw new Error("Method not implemented.");
  }
  adoptRequest(sessionId, request) {
    throw new Error("Method not implemented.");
  }
  removeRequest(sessionid, requestId) {
    throw new Error("Method not implemented.");
  }
  cancelCurrentRequestForSession(sessionId) {
    throw new Error("Method not implemented.");
  }
  clearSession(sessionId) {
    throw new Error("Method not implemented.");
  }
  addCompleteRequest(sessionId, message, variableData, attempt, response) {
    throw new Error("Method not implemented.");
  }
  getHistory() {
    throw new Error("Method not implemented.");
  }
  clearAllHistoryEntries() {
    throw new Error("Method not implemented.");
  }
  removeHistoryEntry(sessionId) {
    throw new Error("Method not implemented.");
  }
  onDidPerformUserAction = void 0;
  notifyUserAction(event) {
    throw new Error("Method not implemented.");
  }
  onDidDisposeSession = void 0;
  transferChatSession(transferredSessionData, toWorkspace) {
    throw new Error("Method not implemented.");
  }
  setChatSessionTitle(sessionId, title) {
    throw new Error("Method not implemented.");
  }
}
export {
  MockChatService
};
//# sourceMappingURL=mockChatService.js.map
