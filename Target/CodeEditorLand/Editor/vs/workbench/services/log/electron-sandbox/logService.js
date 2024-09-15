var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { ConsoleLogger, ILogger } from "../../../../platform/log/common/log.js";
import { INativeWorkbenchEnvironmentService } from "../../environment/electron-sandbox/environmentService.js";
import { LoggerChannelClient } from "../../../../platform/log/common/logIpc.js";
import { DisposableStore } from "../../../../base/common/lifecycle.js";
import { localize } from "../../../../nls.js";
import { windowLogId } from "../common/logConstants.js";
import { LogService } from "../../../../platform/log/common/logService.js";
class NativeLogService extends LogService {
  static {
    __name(this, "NativeLogService");
  }
  constructor(loggerService, environmentService) {
    const disposables = new DisposableStore();
    const fileLogger = disposables.add(loggerService.createLogger(environmentService.logFile, { id: windowLogId, name: localize("rendererLog", "Window") }));
    let consoleLogger;
    if (environmentService.isExtensionDevelopment && !!environmentService.extensionTestsLocationURI) {
      consoleLogger = loggerService.createConsoleMainLogger();
    } else {
      consoleLogger = new ConsoleLogger(fileLogger.getLevel());
    }
    super(fileLogger, [consoleLogger]);
    this._register(disposables);
  }
}
export {
  NativeLogService
};
//# sourceMappingURL=logService.js.map
