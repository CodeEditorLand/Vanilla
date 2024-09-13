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
import { RunOnceScheduler } from "../../../../base/common/async.js";
import { Emitter } from "../../../../base/common/event.js";
import { Iterable } from "../../../../base/common/iterator.js";
import {
  Disposable,
  toDisposable
} from "../../../../base/common/lifecycle.js";
import {
  IContextKeyService
} from "../../../../platform/contextkey/common/contextkey.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { IExtensionService } from "../../../services/extensions/common/extensions.js";
const ILanguageModelToolsService = createDecorator("ILanguageModelToolsService");
let LanguageModelToolsService = class extends Disposable {
  constructor(_extensionService, _contextKeyService) {
    super();
    this._extensionService = _extensionService;
    this._contextKeyService = _contextKeyService;
    this._register(this._contextKeyService.onDidChangeContext((e) => {
      if (e.affectsSome(this._toolContextKeys)) {
        this._onDidChangeToolsScheduler.schedule();
      }
    }));
  }
  static {
    __name(this, "LanguageModelToolsService");
  }
  _serviceBrand;
  _onDidChangeTools = new Emitter();
  onDidChangeTools = this._onDidChangeTools.event;
  /** Throttle tools updates because it sends all tools and runs on context key updates */
  _onDidChangeToolsScheduler = new RunOnceScheduler(
    () => this._onDidChangeTools.fire(),
    750
  );
  _tools = /* @__PURE__ */ new Map();
  _toolContextKeys = /* @__PURE__ */ new Set();
  registerToolData(toolData) {
    if (this._tools.has(toolData.id)) {
      throw new Error(`Tool "${toolData.id}" is already registered.`);
    }
    this._tools.set(toolData.id, { data: toolData });
    this._onDidChangeToolsScheduler.schedule();
    toolData.when?.keys().forEach((key) => this._toolContextKeys.add(key));
    return toDisposable(() => {
      this._tools.delete(toolData.id);
      this._refreshAllToolContextKeys();
      this._onDidChangeToolsScheduler.schedule();
    });
  }
  _refreshAllToolContextKeys() {
    this._toolContextKeys.clear();
    for (const tool of this._tools.values()) {
      tool.data.when?.keys().forEach((key) => this._toolContextKeys.add(key));
    }
  }
  registerToolImplementation(name, tool) {
    const entry = this._tools.get(name);
    if (!entry) {
      throw new Error(`Tool "${name}" was not contributed.`);
    }
    if (entry.impl) {
      throw new Error(`Tool "${name}" already has an implementation.`);
    }
    entry.impl = tool;
    return toDisposable(() => {
      entry.impl = void 0;
    });
  }
  getTools() {
    const toolDatas = Iterable.map(this._tools.values(), (i) => i.data);
    return Iterable.filter(
      toolDatas,
      (toolData) => !toolData.when || this._contextKeyService.contextMatchesRules(toolData.when)
    );
  }
  getTool(id) {
    return this._getToolEntry(id)?.data;
  }
  _getToolEntry(id) {
    const entry = this._tools.get(id);
    if (entry && (!entry.data.when || this._contextKeyService.contextMatchesRules(entry.data.when))) {
      return entry;
    } else {
      return void 0;
    }
  }
  getToolByName(name) {
    for (const toolData of this.getTools()) {
      if (toolData.name === name) {
        return toolData;
      }
    }
    return void 0;
  }
  async invokeTool(dto, countTokens, token) {
    let tool = this._tools.get(dto.toolId);
    if (!tool) {
      throw new Error(`Tool ${dto.toolId} was not contributed`);
    }
    if (!tool.impl) {
      await this._extensionService.activateByEvent(
        `onLanguageModelTool:${dto.toolId}`
      );
      tool = this._tools.get(dto.toolId);
      if (!tool?.impl) {
        throw new Error(
          `Tool ${dto.toolId} does not have an implementation registered.`
        );
      }
    }
    return tool.impl.invoke(dto, countTokens, token);
  }
};
LanguageModelToolsService = __decorateClass([
  __decorateParam(0, IExtensionService),
  __decorateParam(1, IContextKeyService)
], LanguageModelToolsService);
export {
  ILanguageModelToolsService,
  LanguageModelToolsService
};
//# sourceMappingURL=languageModelToolsService.js.map
