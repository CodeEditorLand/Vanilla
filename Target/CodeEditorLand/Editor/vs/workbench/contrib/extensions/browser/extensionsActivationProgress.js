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
import { DeferredPromise, timeout } from "../../../../base/common/async.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { localize } from "../../../../nls.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import {
  IProgressService,
  ProgressLocation
} from "../../../../platform/progress/common/progress.js";
import { IExtensionService } from "../../../services/extensions/common/extensions.js";
let ExtensionActivationProgress = class {
  static {
    __name(this, "ExtensionActivationProgress");
  }
  _listener;
  constructor(extensionService, progressService, logService) {
    const options = {
      location: ProgressLocation.Window,
      title: localize("activation", "Activating Extensions...")
    };
    let deferred;
    let count = 0;
    this._listener = extensionService.onWillActivateByEvent((e) => {
      logService.trace("onWillActivateByEvent: ", e.event);
      if (!deferred) {
        deferred = new DeferredPromise();
        progressService.withProgress(options, (_) => deferred.p);
      }
      count++;
      Promise.race([
        e.activation,
        timeout(5e3, CancellationToken.None)
      ]).finally(() => {
        if (--count === 0) {
          deferred.complete(void 0);
          deferred = void 0;
        }
      });
    });
  }
  dispose() {
    this._listener.dispose();
  }
};
ExtensionActivationProgress = __decorateClass([
  __decorateParam(0, IExtensionService),
  __decorateParam(1, IProgressService),
  __decorateParam(2, ILogService)
], ExtensionActivationProgress);
export {
  ExtensionActivationProgress
};
//# sourceMappingURL=extensionsActivationProgress.js.map
