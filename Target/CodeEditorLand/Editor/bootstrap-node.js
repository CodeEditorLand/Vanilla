var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as path from "path";
import * as fs from "fs";
import { fileURLToPath } from "url";
import { createRequire } from "node:module";
const require2 = createRequire(import.meta.url);
const module = { exports: {} };
const __dirname = path.dirname(fileURLToPath(import.meta.url));
Error.stackTraceLimit = 100;
if (!process.env["VSCODE_HANDLES_SIGPIPE"]) {
  let didLogAboutSIGPIPE = false;
  process.on("SIGPIPE", () => {
    if (!didLogAboutSIGPIPE) {
      didLogAboutSIGPIPE = true;
      console.error(new Error(`Unexpected SIGPIPE`));
    }
  });
}
function setupCurrentWorkingDirectory() {
  try {
    if (typeof process.env["VSCODE_CWD"] !== "string") {
      process.env["VSCODE_CWD"] = process.cwd();
    }
    if (process.platform === "win32") {
      process.chdir(path.dirname(process.execPath));
    }
  } catch (err) {
    console.error(err);
  }
}
__name(setupCurrentWorkingDirectory, "setupCurrentWorkingDirectory");
setupCurrentWorkingDirectory();
module.exports.devInjectNodeModuleLookupPath = function(injectPath) {
  if (!process.env["VSCODE_DEV"]) {
    return;
  }
  if (!injectPath) {
    throw new Error("Missing injectPath");
  }
  const Module = require2("node:module");
  Module.register("./bootstrap-import.js", { parentURL: import.meta.url, data: injectPath });
};
module.exports.removeGlobalNodeJsModuleLookupPaths = function() {
  if (typeof process?.versions?.electron === "string") {
    return;
  }
  const Module = require2("module");
  const globalPaths = Module.globalPaths;
  const originalResolveLookupPaths = Module._resolveLookupPaths;
  Module._resolveLookupPaths = function(moduleName, parent) {
    const paths = originalResolveLookupPaths(moduleName, parent);
    if (Array.isArray(paths)) {
      let commonSuffixLength = 0;
      while (commonSuffixLength < paths.length && paths[paths.length - 1 - commonSuffixLength] === globalPaths[globalPaths.length - 1 - commonSuffixLength]) {
        commonSuffixLength++;
      }
      return paths.slice(0, paths.length - commonSuffixLength);
    }
    return paths;
  };
};
module.exports.configurePortable = function(product) {
  const appRoot = path.dirname(__dirname);
  function getApplicationPath(path2) {
    if (process.env["VSCODE_DEV"]) {
      return appRoot;
    }
    if (process.platform === "darwin") {
      return path2.dirname(path2.dirname(path2.dirname(appRoot)));
    }
    return path2.dirname(path2.dirname(appRoot));
  }
  __name(getApplicationPath, "getApplicationPath");
  function getPortableDataPath(path2) {
    if (process.env["VSCODE_PORTABLE"]) {
      return process.env["VSCODE_PORTABLE"];
    }
    if (process.platform === "win32" || process.platform === "linux") {
      return path2.join(getApplicationPath(path2), "data");
    }
    const portableDataName = product.portable || `${product.applicationName}-portable-data`;
    return path2.join(path2.dirname(getApplicationPath(path2)), portableDataName);
  }
  __name(getPortableDataPath, "getPortableDataPath");
  const portableDataPath = getPortableDataPath(path);
  const isPortable = !("target" in product) && fs.existsSync(portableDataPath);
  const portableTempPath = path.join(portableDataPath, "tmp");
  const isTempPortable = isPortable && fs.existsSync(portableTempPath);
  if (isPortable) {
    process.env["VSCODE_PORTABLE"] = portableDataPath;
  } else {
    delete process.env["VSCODE_PORTABLE"];
  }
  if (isTempPortable) {
    if (process.platform === "win32") {
      process.env["TMP"] = portableTempPath;
      process.env["TEMP"] = portableTempPath;
    } else {
      process.env["TMPDIR"] = portableTempPath;
    }
  }
  return {
    portableDataPath,
    isPortable
  };
};
module.exports.enableASARSupport = function() {
};
module.exports.fileUriFromPath = function(path2, config) {
  let pathName = path2.replace(/\\/g, "/");
  if (pathName.length > 0 && pathName.charAt(0) !== "/") {
    pathName = `/${pathName}`;
  }
  let uri;
  if (config.isWindows && pathName.startsWith("//")) {
    uri = encodeURI(`${config.scheme || "file"}:${pathName}`);
  } else {
    uri = encodeURI(`${config.scheme || "file"}://${config.fallbackAuthority || ""}${pathName}`);
  }
  return uri.replace(/#/g, "%23");
};
const devInjectNodeModuleLookupPath = module.exports.devInjectNodeModuleLookupPath;
const removeGlobalNodeJsModuleLookupPaths = module.exports.removeGlobalNodeJsModuleLookupPaths;
const configurePortable = module.exports.configurePortable;
const enableASARSupport = module.exports.enableASARSupport;
const fileUriFromPath = module.exports.fileUriFromPath;
export {
  configurePortable,
  devInjectNodeModuleLookupPath,
  enableASARSupport,
  fileUriFromPath,
  removeGlobalNodeJsModuleLookupPaths
};
//# sourceMappingURL=bootstrap-node.js.map
