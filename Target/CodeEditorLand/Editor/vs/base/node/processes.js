var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { promises } from "fs";
import * as path from "../common/path.js";
import * as Platform from "../common/platform.js";
import * as process from "../common/process.js";
import {
  Source,
  TerminateResponseCode
} from "../common/processes.js";
import * as Types from "../common/types.js";
import * as pfs from "./pfs.js";
function getWindowsShell(env = process.env) {
  return env["comspec"] || "cmd.exe";
}
__name(getWindowsShell, "getWindowsShell");
function createQueuedSender(childProcess) {
  let msgQueue = [];
  let useQueue = false;
  const send = /* @__PURE__ */ __name((msg) => {
    if (useQueue) {
      msgQueue.push(msg);
      return;
    }
    const result = childProcess.send(msg, (error) => {
      if (error) {
        console.error(error);
      }
      useQueue = false;
      if (msgQueue.length > 0) {
        const msgQueueCopy = msgQueue.slice(0);
        msgQueue = [];
        msgQueueCopy.forEach((entry) => send(entry));
      }
    });
    if (!result || Platform.isWindows) {
      useQueue = true;
    }
  }, "send");
  return { send };
}
__name(createQueuedSender, "createQueuedSender");
var win32;
((win322) => {
  async function findExecutable(command, cwd, paths) {
    if (path.isAbsolute(command)) {
      return command;
    }
    if (cwd === void 0) {
      cwd = process.cwd();
    }
    const dir = path.dirname(command);
    if (dir !== ".") {
      return path.join(cwd, command);
    }
    if (paths === void 0 && Types.isString(process.env["PATH"])) {
      paths = process.env["PATH"].split(path.delimiter);
    }
    if (paths === void 0 || paths.length === 0) {
      return path.join(cwd, command);
    }
    async function fileExists(path2) {
      if (await pfs.Promises.exists(path2)) {
        let statValue;
        try {
          statValue = await promises.stat(path2);
        } catch (e) {
          if (e.message.startsWith("EACCES")) {
            statValue = await promises.lstat(path2);
          }
        }
        return statValue ? !statValue.isDirectory() : false;
      }
      return false;
    }
    __name(fileExists, "fileExists");
    for (const pathEntry of paths) {
      let fullPath;
      if (path.isAbsolute(pathEntry)) {
        fullPath = path.join(pathEntry, command);
      } else {
        fullPath = path.join(cwd, pathEntry, command);
      }
      if (await fileExists(fullPath)) {
        return fullPath;
      }
      let withExtension = fullPath + ".com";
      if (await fileExists(withExtension)) {
        return withExtension;
      }
      withExtension = fullPath + ".exe";
      if (await fileExists(withExtension)) {
        return withExtension;
      }
    }
    return path.join(cwd, command);
  }
  win322.findExecutable = findExecutable;
  __name(findExecutable, "findExecutable");
})(win32 || (win32 = {}));
export {
  Source,
  TerminateResponseCode,
  createQueuedSender,
  getWindowsShell,
  win32
};
//# sourceMappingURL=processes.js.map
