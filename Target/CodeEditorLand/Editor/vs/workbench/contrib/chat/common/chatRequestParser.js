var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { OffsetRange } from "../../../../editor/common/core/offsetRange.js";
import {
  Position
} from "../../../../editor/common/core/position.js";
import { Range } from "../../../../editor/common/core/range.js";
import {
  ChatAgentLocation,
  IChatAgentService
} from "./chatAgents.js";
import {
  ChatRequestAgentPart,
  ChatRequestAgentSubcommandPart,
  ChatRequestDynamicVariablePart,
  ChatRequestSlashCommandPart,
  ChatRequestTextPart,
  ChatRequestToolPart,
  ChatRequestVariablePart,
  chatAgentLeader,
  chatSubcommandLeader,
  chatVariableLeader
} from "./chatParserTypes.js";
import { IChatSlashCommandService } from "./chatSlashCommands.js";
import {
  IChatVariablesService
} from "./chatVariables.js";
import { ILanguageModelToolsService } from "./languageModelToolsService.js";
const agentReg = /^@([\w_\-\.]+)(?=(\s|$|\b))/i;
const variableReg = /^#([\w_\-]+)(:\d+)?(?=(\s|$|\b))/i;
const slashReg = /\/([\w_\-]+)(?=(\s|$|\b))/i;
let ChatRequestParser = class {
  constructor(agentService, variableService, slashCommandService, toolsService) {
    this.agentService = agentService;
    this.variableService = variableService;
    this.slashCommandService = slashCommandService;
    this.toolsService = toolsService;
  }
  parseChatRequest(sessionId, message, location = ChatAgentLocation.Panel, context) {
    const parts = [];
    const references = this.variableService.getDynamicVariables(sessionId);
    let lineNumber = 1;
    let column = 1;
    for (let i = 0; i < message.length; i++) {
      const previousChar = message.charAt(i - 1);
      const char = message.charAt(i);
      let newPart;
      if (previousChar.match(/\s/) || i === 0) {
        if (char === chatVariableLeader) {
          newPart = this.tryToParseVariable(
            message.slice(i),
            i,
            new Position(lineNumber, column),
            parts
          );
        } else if (char === chatAgentLeader) {
          newPart = this.tryToParseAgent(
            message.slice(i),
            message,
            i,
            new Position(lineNumber, column),
            parts,
            location,
            context
          );
        } else if (char === chatSubcommandLeader) {
          newPart = this.tryToParseSlashCommand(
            message.slice(i),
            message,
            i,
            new Position(lineNumber, column),
            parts,
            location
          );
        }
        if (!newPart) {
          newPart = this.tryToParseDynamicVariable(
            message.slice(i),
            i,
            new Position(lineNumber, column),
            references
          );
        }
      }
      if (newPart) {
        if (i !== 0) {
          const previousPart = parts.at(-1);
          const previousPartEnd = previousPart?.range.endExclusive ?? 0;
          const previousPartEditorRangeEndLine = previousPart?.editorRange.endLineNumber ?? 1;
          const previousPartEditorRangeEndCol = previousPart?.editorRange.endColumn ?? 1;
          parts.push(
            new ChatRequestTextPart(
              new OffsetRange(previousPartEnd, i),
              new Range(
                previousPartEditorRangeEndLine,
                previousPartEditorRangeEndCol,
                lineNumber,
                column
              ),
              message.slice(previousPartEnd, i)
            )
          );
        }
        parts.push(newPart);
      }
      if (char === "\n") {
        lineNumber++;
        column = 1;
      } else {
        column++;
      }
    }
    const lastPart = parts.at(-1);
    const lastPartEnd = lastPart?.range.endExclusive ?? 0;
    if (lastPartEnd < message.length) {
      parts.push(
        new ChatRequestTextPart(
          new OffsetRange(lastPartEnd, message.length),
          new Range(
            lastPart?.editorRange.endLineNumber ?? 1,
            lastPart?.editorRange.endColumn ?? 1,
            lineNumber,
            column
          ),
          message.slice(lastPartEnd, message.length)
        )
      );
    }
    return {
      parts,
      text: message
    };
  }
  tryToParseAgent(message, fullMessage, offset, position, parts, location, context) {
    const nextAgentMatch = message.match(agentReg);
    if (!nextAgentMatch) {
      return;
    }
    const [full, name] = nextAgentMatch;
    const agentRange = new OffsetRange(offset, offset + full.length);
    const agentEditorRange = new Range(
      position.lineNumber,
      position.column,
      position.lineNumber,
      position.column + full.length
    );
    let agents = this.agentService.getAgentsByName(name);
    if (!agents.length) {
      const fqAgent = this.agentService.getAgentByFullyQualifiedId(name);
      if (fqAgent) {
        agents = [fqAgent];
      }
    }
    const agent = agents.length > 1 && context?.selectedAgent ? context.selectedAgent : agents.find((a) => a.locations.includes(location));
    if (!agent) {
      return;
    }
    if (parts.some((p) => p instanceof ChatRequestAgentPart)) {
      return;
    }
    if (parts.some(
      (p) => p instanceof ChatRequestTextPart && p.text.trim() !== "" || !(p instanceof ChatRequestAgentPart)
    )) {
      return;
    }
    const previousPart = parts.at(-1);
    const previousPartEnd = previousPart?.range.endExclusive ?? 0;
    const textSincePreviousPart = fullMessage.slice(
      previousPartEnd,
      offset
    );
    if (textSincePreviousPart.trim() !== "") {
      return;
    }
    return new ChatRequestAgentPart(agentRange, agentEditorRange, agent);
  }
  tryToParseVariable(message, offset, position, parts) {
    const nextVariableMatch = message.match(variableReg);
    if (!nextVariableMatch) {
      return;
    }
    const [full, name] = nextVariableMatch;
    const variableArg = nextVariableMatch[2] ?? "";
    const varRange = new OffsetRange(offset, offset + full.length);
    const varEditorRange = new Range(
      position.lineNumber,
      position.column,
      position.lineNumber,
      position.column + full.length
    );
    const usedAgent = parts.find(
      (p) => p instanceof ChatRequestAgentPart
    );
    const allowSlow = !usedAgent || usedAgent.agent.metadata.supportsSlowVariables;
    const variable = this.variableService.getVariable(name);
    if (variable && (!variable.isSlow || allowSlow)) {
      return new ChatRequestVariablePart(
        varRange,
        varEditorRange,
        name,
        variableArg,
        variable.id
      );
    }
    const tool = this.toolsService.getToolByName(name);
    if (tool && tool.canBeInvokedManually && (!usedAgent || usedAgent.agent.supportsToolReferences)) {
      return new ChatRequestToolPart(
        varRange,
        varEditorRange,
        name,
        tool.id
      );
    }
    return;
  }
  tryToParseSlashCommand(remainingMessage, fullMessage, offset, position, parts, location) {
    const nextSlashMatch = remainingMessage.match(slashReg);
    if (!nextSlashMatch) {
      return;
    }
    if (parts.some((p) => p instanceof ChatRequestSlashCommandPart)) {
      return;
    }
    const [full, command] = nextSlashMatch;
    const slashRange = new OffsetRange(offset, offset + full.length);
    const slashEditorRange = new Range(
      position.lineNumber,
      position.column,
      position.lineNumber,
      position.column + full.length
    );
    const usedAgent = parts.find(
      (p) => p instanceof ChatRequestAgentPart
    );
    if (usedAgent) {
      if (parts.some(
        (p) => p instanceof ChatRequestTextPart && p.text.trim() !== "" || !(p instanceof ChatRequestAgentPart) && !(p instanceof ChatRequestTextPart)
      )) {
        return;
      }
      const previousPart = parts.at(-1);
      const previousPartEnd = previousPart?.range.endExclusive ?? 0;
      const textSincePreviousPart = fullMessage.slice(
        previousPartEnd,
        offset
      );
      if (textSincePreviousPart.trim() !== "") {
        return;
      }
      const subCommand = usedAgent.agent.slashCommands.find(
        (c) => c.name === command
      );
      if (subCommand) {
        return new ChatRequestAgentSubcommandPart(
          slashRange,
          slashEditorRange,
          subCommand
        );
      }
    } else {
      const slashCommands = this.slashCommandService.getCommands(location);
      const slashCommand = slashCommands.find(
        (c) => c.command === command
      );
      if (slashCommand) {
        return new ChatRequestSlashCommandPart(
          slashRange,
          slashEditorRange,
          slashCommand
        );
      } else {
        const defaultAgent = this.agentService.getDefaultAgent(location);
        const subCommand = defaultAgent?.slashCommands.find(
          (c) => c.name === command
        );
        if (subCommand) {
          return new ChatRequestAgentSubcommandPart(
            slashRange,
            slashEditorRange,
            subCommand
          );
        }
      }
    }
    return;
  }
  tryToParseDynamicVariable(message, offset, position, references) {
    const refAtThisPosition = references.find(
      (r) => r.range.startLineNumber === position.lineNumber && r.range.startColumn === position.column
    );
    if (refAtThisPosition) {
      const length = refAtThisPosition.range.endColumn - refAtThisPosition.range.startColumn;
      const text = message.substring(0, length);
      const range = new OffsetRange(offset, offset + length);
      return new ChatRequestDynamicVariablePart(
        range,
        refAtThisPosition.range,
        text,
        refAtThisPosition.id,
        refAtThisPosition.modelDescription,
        refAtThisPosition.data
      );
    }
    return;
  }
};
ChatRequestParser = __decorateClass([
  __decorateParam(0, IChatAgentService),
  __decorateParam(1, IChatVariablesService),
  __decorateParam(2, IChatSlashCommandService),
  __decorateParam(3, ILanguageModelToolsService)
], ChatRequestParser);
export {
  ChatRequestParser
};
