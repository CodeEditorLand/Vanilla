var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as os from "os";
import * as path from "path";
const module = { exports: {} };
(() => {
  const isESM = true;
  function factory(path2, os2, cwd) {
    function getUserDataPath2(cliArgs, productName) {
      const userDataPath = doGetUserDataPath(cliArgs, productName);
      const pathsToResolve = [userDataPath];
      if (!path2.isAbsolute(userDataPath)) {
        pathsToResolve.unshift(cwd);
      }
      return path2.resolve(...pathsToResolve);
    }
    __name(getUserDataPath2, "getUserDataPath");
    function doGetUserDataPath(cliArgs, productName) {
      if (process.env["VSCODE_DEV"]) {
        productName = "code-oss-dev";
      }
      const portablePath = process.env["VSCODE_PORTABLE"];
      if (portablePath) {
        return path2.join(portablePath, "user-data");
      }
      let appDataPath = process.env["VSCODE_APPDATA"];
      if (appDataPath) {
        return path2.join(appDataPath, productName);
      }
      const cliPath = cliArgs["user-data-dir"];
      if (cliPath) {
        return cliPath;
      }
      switch (process.platform) {
        case "win32":
          appDataPath = process.env["APPDATA"];
          if (!appDataPath) {
            const userProfile = process.env["USERPROFILE"];
            if (typeof userProfile !== "string") {
              throw new Error(
                "Windows: Unexpected undefined %USERPROFILE% environment variable"
              );
            }
            appDataPath = path2.join(
              userProfile,
              "AppData",
              "Roaming"
            );
          }
          break;
        case "darwin":
          appDataPath = path2.join(
            os2.homedir(),
            "Library",
            "Application Support"
          );
          break;
        case "linux":
          appDataPath = process.env["XDG_CONFIG_HOME"] || path2.join(os2.homedir(), ".config");
          break;
        default:
          throw new Error("Platform not supported");
      }
      return path2.join(appDataPath, productName);
    }
    __name(doGetUserDataPath, "doGetUserDataPath");
    return {
      getUserDataPath: getUserDataPath2
    };
  }
  __name(factory, "factory");
  if (!isESM && typeof define === "function") {
    define(["path", "os", "vs/base/common/process"], (path2, os2, process2) => {
      return factory(path2, os2, process2.cwd());
    });
  } else if (typeof module === "object" && typeof module.exports === "object") {
    module.exports = factory(
      path,
      os,
      process.env["VSCODE_CWD"] || process.cwd()
    );
  } else {
    throw new Error("Unknown context");
  }
})();
const getUserDataPath = module.exports.getUserDataPath;
export {
  getUserDataPath
};
//# sourceMappingURL=userDataPath.js.map
