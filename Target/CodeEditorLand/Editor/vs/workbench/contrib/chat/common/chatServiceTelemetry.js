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
import { CommandsRegistry } from "../../../../platform/commands/common/commands.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import {
  ChatAgentVoteDirection,
  ChatCopyKind
} from "./chatService.js";
let ChatServiceTelemetry = class {
  constructor(telemetryService) {
    this.telemetryService = telemetryService;
  }
  static {
    __name(this, "ChatServiceTelemetry");
  }
  notifyUserAction(action) {
    if (action.action.kind === "vote") {
      this.telemetryService.publicLog2("interactiveSessionVote", {
        direction: action.action.direction === ChatAgentVoteDirection.Up ? "up" : "down",
        agentId: action.agentId ?? "",
        command: action.command,
        reason: action.action.reason
      });
    } else if (action.action.kind === "copy") {
      this.telemetryService.publicLog2("interactiveSessionCopy", {
        copyKind: action.action.copyKind === ChatCopyKind.Action ? "action" : "toolbar",
        agentId: action.agentId ?? "",
        command: action.command
      });
    } else if (action.action.kind === "insert") {
      this.telemetryService.publicLog2("interactiveSessionInsert", {
        newFile: !!action.action.newFile,
        userAction: action.action.userAction,
        codeMapper: action.action.codeMapper,
        agentId: action.agentId ?? "",
        command: action.command
      });
    } else if (action.action.kind === "command") {
      const command = CommandsRegistry.getCommand(
        action.action.commandButton.command.id
      );
      const commandId = command ? action.action.commandButton.command.id : "INVALID";
      this.telemetryService.publicLog2("interactiveSessionCommand", {
        commandId,
        agentId: action.agentId ?? "",
        command: action.command
      });
    } else if (action.action.kind === "runInTerminal") {
      this.telemetryService.publicLog2("interactiveSessionRunInTerminal", {
        languageId: action.action.languageId ?? "",
        agentId: action.agentId ?? "",
        command: action.command
      });
    } else if (action.action.kind === "followUp") {
      this.telemetryService.publicLog2("chatFollowupClicked", {
        agentId: action.agentId ?? "",
        command: action.command
      });
    }
  }
  retrievedFollowups(agentId, command, numFollowups) {
    this.telemetryService.publicLog2("chatFollowupsRetrieved", {
      agentId,
      command,
      numFollowups
    });
  }
};
ChatServiceTelemetry = __decorateClass([
  __decorateParam(0, ITelemetryService)
], ChatServiceTelemetry);
export {
  ChatServiceTelemetry
};
//# sourceMappingURL=chatServiceTelemetry.js.map
