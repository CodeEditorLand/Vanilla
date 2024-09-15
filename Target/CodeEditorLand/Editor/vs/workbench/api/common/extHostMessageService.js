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
import { ILogService } from "../../../platform/log/common/log.js";
import { checkProposedApiEnabled } from "../../services/extensions/common/extensions.js";
import {
  MainContext
} from "./extHost.protocol.js";
function isMessageItem(item) {
  return item && item.title;
}
__name(isMessageItem, "isMessageItem");
let ExtHostMessageService = class {
  constructor(mainContext, _logService) {
    this._logService = _logService;
    this._proxy = mainContext.getProxy(
      MainContext.MainThreadMessageService
    );
  }
  static {
    __name(this, "ExtHostMessageService");
  }
  _proxy;
  showMessage(extension, severity, message, optionsOrFirstItem, rest) {
    const options = {
      source: {
        identifier: extension.identifier,
        label: extension.displayName || extension.name
      }
    };
    let items;
    if (typeof optionsOrFirstItem === "string" || isMessageItem(optionsOrFirstItem)) {
      items = [optionsOrFirstItem, ...rest];
    } else {
      options.modal = optionsOrFirstItem?.modal;
      options.useCustom = optionsOrFirstItem?.useCustom;
      options.detail = optionsOrFirstItem?.detail;
      items = rest;
    }
    if (options.useCustom) {
      checkProposedApiEnabled(extension, "resolvers");
    }
    const commands = [];
    let hasCloseAffordance = false;
    for (let handle = 0; handle < items.length; handle++) {
      const command = items[handle];
      if (typeof command === "string") {
        commands.push({
          title: command,
          handle,
          isCloseAffordance: false
        });
      } else if (typeof command === "object") {
        const { title, isCloseAffordance } = command;
        commands.push({
          title,
          isCloseAffordance: !!isCloseAffordance,
          handle
        });
        if (isCloseAffordance) {
          if (hasCloseAffordance) {
            this._logService.warn(
              `[${extension.identifier}] Only one message item can have 'isCloseAffordance':`,
              command
            );
          } else {
            hasCloseAffordance = true;
          }
        }
      } else {
        this._logService.warn(
          `[${extension.identifier}] Invalid message item:`,
          command
        );
      }
    }
    return this._proxy.$showMessage(severity, message, options, commands).then((handle) => {
      if (typeof handle === "number") {
        return items[handle];
      }
      return void 0;
    });
  }
};
ExtHostMessageService = __decorateClass([
  __decorateParam(1, ILogService)
], ExtHostMessageService);
export {
  ExtHostMessageService
};
//# sourceMappingURL=extHostMessageService.js.map
