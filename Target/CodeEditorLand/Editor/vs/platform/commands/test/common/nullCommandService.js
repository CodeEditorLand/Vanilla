import { Disposable } from "../../../../base/common/lifecycle.js";
const NullCommandService = {
  _serviceBrand: void 0,
  onWillExecuteCommand: () => Disposable.None,
  onDidExecuteCommand: () => Disposable.None,
  executeCommand() {
    return Promise.resolve(void 0);
  }
};
export {
  NullCommandService
};
