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
import { Emitter } from "../../../../base/common/event.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import {
  IStorageService,
  StorageScope,
  StorageTarget
} from "../../../../platform/storage/common/storage.js";
import { Memento } from "../../../common/memento.js";
import { ChatAgentLocation } from "./chatAgents.js";
import { CHAT_PROVIDER_ID } from "./chatParticipantContribTypes.js";
const IChatWidgetHistoryService = createDecorator("IChatWidgetHistoryService");
let ChatWidgetHistoryService = class {
  _serviceBrand;
  memento;
  viewState;
  _onDidClearHistory = new Emitter();
  onDidClearHistory = this._onDidClearHistory.event;
  constructor(storageService) {
    this.memento = new Memento("interactive-session", storageService);
    const loadedState = this.memento.getMemento(StorageScope.WORKSPACE, StorageTarget.MACHINE);
    for (const provider in loadedState.history) {
      loadedState.history[provider] = loadedState.history[provider].map((entry) => typeof entry === "string" ? { text: entry } : entry);
    }
    this.viewState = loadedState;
  }
  getHistory(location) {
    const key = this.getKey(location);
    return this.viewState.history?.[key] ?? [];
  }
  getKey(location) {
    return location === ChatAgentLocation.Panel ? CHAT_PROVIDER_ID : location;
  }
  saveHistory(location, history) {
    if (!this.viewState.history) {
      this.viewState.history = {};
    }
    const key = this.getKey(location);
    this.viewState.history[key] = history;
    this.memento.saveMemento();
  }
  clearHistory() {
    this.viewState.history = {};
    this.memento.saveMemento();
    this._onDidClearHistory.fire();
  }
};
ChatWidgetHistoryService = __decorateClass([
  __decorateParam(0, IStorageService)
], ChatWidgetHistoryService);
export {
  ChatWidgetHistoryService,
  IChatWidgetHistoryService
};
