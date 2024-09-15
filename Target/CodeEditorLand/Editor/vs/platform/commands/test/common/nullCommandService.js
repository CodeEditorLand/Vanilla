var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Disposable } from "../../../../base/common/lifecycle.js";
import { ICommandService } from "../../common/commands.js";
const NullCommandService = {
  _serviceBrand: void 0,
  onWillExecuteCommand: /* @__PURE__ */ __name(() => Disposable.None, "onWillExecuteCommand"),
  onDidExecuteCommand: /* @__PURE__ */ __name(() => Disposable.None, "onDidExecuteCommand"),
  executeCommand() {
    return Promise.resolve(void 0);
  }
};
export {
  NullCommandService
};
//# sourceMappingURL=nullCommandService.js.map
