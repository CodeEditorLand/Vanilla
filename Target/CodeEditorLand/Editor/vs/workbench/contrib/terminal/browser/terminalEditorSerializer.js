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
import {
  ITerminalEditorService
} from "./terminal.js";
let TerminalInputSerializer = class {
  constructor(_terminalEditorService) {
    this._terminalEditorService = _terminalEditorService;
  }
  canSerialize(editorInput) {
    return typeof editorInput.terminalInstance?.persistentProcessId === "number" && editorInput.terminalInstance.shouldPersist;
  }
  serialize(editorInput) {
    if (!this.canSerialize(editorInput)) {
      return;
    }
    return JSON.stringify(this._toJson(editorInput.terminalInstance));
  }
  deserialize(instantiationService, serializedEditorInput) {
    const terminalInstance = JSON.parse(serializedEditorInput);
    return this._terminalEditorService.reviveInput(terminalInstance);
  }
  _toJson(instance) {
    return {
      id: instance.persistentProcessId,
      pid: instance.processId || 0,
      title: instance.title,
      titleSource: instance.titleSource,
      cwd: "",
      icon: instance.icon,
      color: instance.color,
      hasChildProcesses: instance.hasChildProcesses,
      isFeatureTerminal: instance.shellLaunchConfig.isFeatureTerminal,
      hideFromUser: instance.shellLaunchConfig.hideFromUser,
      reconnectionProperties: instance.shellLaunchConfig.reconnectionProperties,
      shellIntegrationNonce: instance.shellIntegrationNonce
    };
  }
};
TerminalInputSerializer = __decorateClass([
  __decorateParam(0, ITerminalEditorService)
], TerminalInputSerializer);
export {
  TerminalInputSerializer
};
