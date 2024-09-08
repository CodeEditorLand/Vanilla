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
import { memoize } from "../../../base/common/decorators.js";
import { join } from "../../../base/common/path.js";
import { isLinux } from "../../../base/common/platform.js";
import { createStaticIPCHandle } from "../../../base/parts/ipc/node/ipc.net.js";
import { refineServiceDecorator } from "../../instantiation/common/instantiation.js";
import {
  IEnvironmentService
} from "../common/environment.js";
import { NativeEnvironmentService } from "../node/environmentService.js";
const IEnvironmentMainService = refineServiceDecorator(IEnvironmentService);
class EnvironmentMainService extends NativeEnvironmentService {
  _snapEnv = {};
  get backupHome() {
    return join(this.userDataPath, "Backups");
  }
  get mainIPCHandle() {
    return createStaticIPCHandle(
      this.userDataPath,
      "main",
      this.productService.version
    );
  }
  get mainLockfile() {
    return join(this.userDataPath, "code.lock");
  }
  get disableUpdates() {
    return !!this.args["disable-updates"];
  }
  get crossOriginIsolated() {
    return !!this.args["enable-coi"];
  }
  get codeCachePath() {
    return process.env["VSCODE_CODE_CACHE_PATH"] || void 0;
  }
  get useCodeCache() {
    return !!this.codeCachePath;
  }
  unsetSnapExportedVariables() {
    if (!isLinux) {
      return;
    }
    for (const key in process.env) {
      if (key.endsWith("_VSCODE_SNAP_ORIG")) {
        const originalKey = key.slice(0, -17);
        if (this._snapEnv[originalKey]) {
          continue;
        }
        if (process.env[originalKey]) {
          this._snapEnv[originalKey] = process.env[originalKey];
        }
        if (process.env[key]) {
          process.env[originalKey] = process.env[key];
        } else {
          delete process.env[originalKey];
        }
      }
    }
  }
  restoreSnapExportedVariables() {
    if (!isLinux) {
      return;
    }
    for (const key in this._snapEnv) {
      process.env[key] = this._snapEnv[key];
      delete this._snapEnv[key];
    }
  }
}
__decorateClass([
  memoize
], EnvironmentMainService.prototype, "backupHome", 1);
__decorateClass([
  memoize
], EnvironmentMainService.prototype, "mainIPCHandle", 1);
__decorateClass([
  memoize
], EnvironmentMainService.prototype, "mainLockfile", 1);
__decorateClass([
  memoize
], EnvironmentMainService.prototype, "disableUpdates", 1);
__decorateClass([
  memoize
], EnvironmentMainService.prototype, "crossOriginIsolated", 1);
__decorateClass([
  memoize
], EnvironmentMainService.prototype, "codeCachePath", 1);
__decorateClass([
  memoize
], EnvironmentMainService.prototype, "useCodeCache", 1);
export {
  EnvironmentMainService,
  IEnvironmentMainService
};
