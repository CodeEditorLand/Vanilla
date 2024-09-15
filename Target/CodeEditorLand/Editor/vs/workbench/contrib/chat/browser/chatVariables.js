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
import { basename } from "../../../../base/common/path.js";
import { coalesce } from "../../../../base/common/arrays.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { onUnexpectedExternalError } from "../../../../base/common/errors.js";
import { Iterable } from "../../../../base/common/iterator.js";
import { IDisposable, toDisposable } from "../../../../base/common/lifecycle.js";
import { URI } from "../../../../base/common/uri.js";
import { Location } from "../../../../editor/common/languages.js";
import { IChatWidgetService, showChatView } from "./chat.js";
import { ChatDynamicVariableModel } from "./contrib/chatDynamicVariables.js";
import { ChatAgentLocation } from "../common/chatAgents.js";
import { IChatModel, IChatRequestVariableData, IChatRequestVariableEntry } from "../common/chatModel.js";
import { ChatRequestDynamicVariablePart, ChatRequestToolPart, ChatRequestVariablePart, IParsedChatRequest } from "../common/chatParserTypes.js";
import { IChatContentReference } from "../common/chatService.js";
import { IChatRequestVariableValue, IChatVariableData, IChatVariableResolver, IChatVariableResolverProgress, IChatVariablesService, IDynamicVariable } from "../common/chatVariables.js";
import { ChatContextAttachments } from "./contrib/chatContextAttachments.js";
import { IViewsService } from "../../../services/views/common/viewsService.js";
import { ILanguageModelToolsService } from "../common/languageModelToolsService.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
let ChatVariablesService = class {
  constructor(chatWidgetService, viewsService, toolsService) {
    this.chatWidgetService = chatWidgetService;
    this.viewsService = viewsService;
    this.toolsService = toolsService;
  }
  static {
    __name(this, "ChatVariablesService");
  }
  _resolver = /* @__PURE__ */ new Map();
  async resolveVariables(prompt, attachedContextVariables, model, progress, token) {
    let resolvedVariables = [];
    const jobs = [];
    prompt.parts.forEach((part, i) => {
      if (part instanceof ChatRequestVariablePart) {
        const data = this._resolver.get(part.variableName.toLowerCase());
        if (data) {
          const references = [];
          const variableProgressCallback = /* @__PURE__ */ __name((item) => {
            if (item.kind === "reference") {
              references.push(item);
              return;
            }
            progress(item);
          }, "variableProgressCallback");
          jobs.push(data.resolver(prompt.text, part.variableArg, model, variableProgressCallback, token).then((value) => {
            if (value) {
              resolvedVariables[i] = { id: data.data.id, modelDescription: data.data.modelDescription, name: part.variableName, range: part.range, value, references, fullName: data.data.fullName, icon: data.data.icon };
            }
          }).catch(onUnexpectedExternalError));
        }
      } else if (part instanceof ChatRequestDynamicVariablePart) {
        resolvedVariables[i] = { id: part.id, name: part.referenceText, range: part.range, value: part.data };
      } else if (part instanceof ChatRequestToolPart) {
        const tool = this.toolsService.getTool(part.toolId);
        if (tool) {
          resolvedVariables[i] = { id: part.toolId, name: part.toolName, range: part.range, value: void 0, isTool: true, icon: ThemeIcon.isThemeIcon(tool.icon) ? tool.icon : void 0, fullName: tool.displayName };
        }
      }
    });
    const resolvedAttachedContext = [];
    attachedContextVariables?.forEach((attachment, i) => {
      const data = this._resolver.get(attachment.name?.toLowerCase());
      if (data) {
        const references = [];
        const variableProgressCallback = /* @__PURE__ */ __name((item) => {
          if (item.kind === "reference") {
            references.push(item);
            return;
          }
          progress(item);
        }, "variableProgressCallback");
        jobs.push(data.resolver(prompt.text, "", model, variableProgressCallback, token).then((value) => {
          if (value) {
            resolvedAttachedContext[i] = { id: data.data.id, modelDescription: data.data.modelDescription, name: attachment.name, fullName: attachment.fullName, range: attachment.range, value, references, icon: attachment.icon };
          }
        }).catch(onUnexpectedExternalError));
      } else if (attachment.isDynamic || attachment.isTool) {
        resolvedAttachedContext[i] = { ...attachment };
      }
    });
    await Promise.allSettled(jobs);
    resolvedVariables = coalesce(resolvedVariables);
    resolvedVariables.sort((a, b) => b.range.start - a.range.start);
    resolvedVariables.push(...coalesce(resolvedAttachedContext));
    return {
      variables: resolvedVariables
    };
  }
  async resolveVariable(variableName, promptText, model, progress, token) {
    const data = this._resolver.get(variableName.toLowerCase());
    if (!data) {
      return void 0;
    }
    return await data.resolver(promptText, void 0, model, progress, token);
  }
  hasVariable(name) {
    return this._resolver.has(name.toLowerCase());
  }
  getVariable(name) {
    return this._resolver.get(name.toLowerCase())?.data;
  }
  getVariables(location) {
    const all = Iterable.map(this._resolver.values(), (data) => data.data);
    return Iterable.filter(all, (data) => {
      return location !== ChatAgentLocation.Editor || !(/* @__PURE__ */ new Set(["selection", "editor"])).has(data.name);
    });
  }
  getDynamicVariables(sessionId) {
    const widget = this.chatWidgetService.getWidgetBySessionId(sessionId);
    if (!widget || !widget.viewModel || !widget.supportsFileReferences) {
      return [];
    }
    const model = widget.getContrib(ChatDynamicVariableModel.ID);
    if (!model) {
      return [];
    }
    return model.variables;
  }
  registerVariable(data, resolver) {
    const key = data.name.toLowerCase();
    if (this._resolver.has(key)) {
      throw new Error(`A chat variable with the name '${data.name}' already exists.`);
    }
    this._resolver.set(key, { data, resolver });
    return toDisposable(() => {
      this._resolver.delete(key);
    });
  }
  async attachContext(name, value, location) {
    if (location !== ChatAgentLocation.Panel) {
      return;
    }
    const widget = this.chatWidgetService.lastFocusedWidget ?? await showChatView(this.viewsService);
    if (!widget || !widget.viewModel) {
      return;
    }
    const key = name.toLowerCase();
    if (key === "file" && typeof value !== "string") {
      const uri = URI.isUri(value) ? value : value.uri;
      const range = "range" in value ? value.range : void 0;
      widget.getContrib(ChatContextAttachments.ID)?.setContext(false, { value, id: uri.toString() + (range?.toString() ?? ""), name: basename(uri.path), isFile: true, isDynamic: true });
      return;
    }
    const resolved = this._resolver.get(key);
    if (!resolved) {
      return;
    }
    widget.getContrib(ChatContextAttachments.ID)?.setContext(false, { ...resolved.data, value });
  }
};
ChatVariablesService = __decorateClass([
  __decorateParam(0, IChatWidgetService),
  __decorateParam(1, IViewsService),
  __decorateParam(2, ILanguageModelToolsService)
], ChatVariablesService);
export {
  ChatVariablesService
};
//# sourceMappingURL=chatVariables.js.map
