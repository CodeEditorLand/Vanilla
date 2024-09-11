var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as os from "os";
import { FileAccess } from "../../../base/common/network.js";
import { getCaseInsensitive } from "../../../base/common/objects.js";
import * as path from "../../../base/common/path.js";
import { IProcessEnvironment, isMacintosh, isWindows } from "../../../base/common/platform.js";
import * as process from "../../../base/common/process.js";
import { format } from "../../../base/common/strings.js";
import { isString } from "../../../base/common/types.js";
import * as pfs from "../../../base/node/pfs.js";
import { ILogService } from "../../log/common/log.js";
import { IProductService } from "../../product/common/productService.js";
import { IShellLaunchConfig, ITerminalEnvironment, ITerminalProcessOptions } from "../common/terminal.js";
import { EnvironmentVariableMutatorType } from "../common/environmentVariable.js";
import { deserializeEnvironmentVariableCollections } from "../common/environmentVariableShared.js";
import { MergedEnvironmentVariableCollection } from "../common/environmentVariableCollection.js";
function getWindowsBuildNumber() {
  const osVersion = /(\d+)\.(\d+)\.(\d+)/g.exec(os.release());
  let buildNumber = 0;
  if (osVersion && osVersion.length === 4) {
    buildNumber = parseInt(osVersion[3]);
  }
  return buildNumber;
}
__name(getWindowsBuildNumber, "getWindowsBuildNumber");
async function findExecutable(command, cwd, paths, env = process.env, exists = pfs.Promises.exists) {
  if (path.isAbsolute(command)) {
    return await exists(command) ? command : void 0;
  }
  if (cwd === void 0) {
    cwd = process.cwd();
  }
  const dir = path.dirname(command);
  if (dir !== ".") {
    const fullPath2 = path.join(cwd, command);
    return await exists(fullPath2) ? fullPath2 : void 0;
  }
  const envPath = getCaseInsensitive(env, "PATH");
  if (paths === void 0 && isString(envPath)) {
    paths = envPath.split(path.delimiter);
  }
  if (paths === void 0 || paths.length === 0) {
    const fullPath2 = path.join(cwd, command);
    return await exists(fullPath2) ? fullPath2 : void 0;
  }
  for (const pathEntry of paths) {
    let fullPath2;
    if (path.isAbsolute(pathEntry)) {
      fullPath2 = path.join(pathEntry, command);
    } else {
      fullPath2 = path.join(cwd, pathEntry, command);
    }
    if (await exists(fullPath2)) {
      return fullPath2;
    }
    if (isWindows) {
      let withExtension = fullPath2 + ".com";
      if (await exists(withExtension)) {
        return withExtension;
      }
      withExtension = fullPath2 + ".exe";
      if (await exists(withExtension)) {
        return withExtension;
      }
    }
  }
  const fullPath = path.join(cwd, command);
  return await exists(fullPath) ? fullPath : void 0;
}
__name(findExecutable, "findExecutable");
function getShellIntegrationInjection(shellLaunchConfig, options, env, logService, productService) {
  const useWinpty = isWindows && (!options.windowsEnableConpty || getWindowsBuildNumber() < 18309);
  if (
    // The global setting is disabled
    !options.shellIntegration.enabled || // There is no executable (so there's no way to determine how to inject)
    !shellLaunchConfig.executable || // It's a feature terminal (tasks, debug), unless it's explicitly being forced
    shellLaunchConfig.isFeatureTerminal && !shellLaunchConfig.forceShellIntegration || // The ignoreShellIntegration flag is passed (eg. relaunching without shell integration)
    shellLaunchConfig.ignoreShellIntegration || // Winpty is unsupported
    useWinpty
  ) {
    return void 0;
  }
  const originalArgs = shellLaunchConfig.args;
  const shell = process.platform === "win32" ? path.basename(shellLaunchConfig.executable).toLowerCase() : path.basename(shellLaunchConfig.executable);
  const appRoot = path.dirname(FileAccess.asFileUri("").fsPath);
  let newArgs;
  const envMixin = {
    "VSCODE_INJECTION": "1"
  };
  if (options.shellIntegration.nonce) {
    envMixin["VSCODE_NONCE"] = options.shellIntegration.nonce;
  }
  if (isWindows) {
    if (shell === "pwsh.exe" || shell === "powershell.exe") {
      if (!originalArgs || arePwshImpliedArgs(originalArgs)) {
        newArgs = shellIntegrationArgs.get("windows-pwsh" /* WindowsPwsh */);
      } else if (arePwshLoginArgs(originalArgs)) {
        newArgs = shellIntegrationArgs.get("windows-pwsh-login" /* WindowsPwshLogin */);
      }
      if (!newArgs) {
        return void 0;
      }
      newArgs = [...newArgs];
      newArgs[newArgs.length - 1] = format(newArgs[newArgs.length - 1], appRoot, "");
      envMixin["VSCODE_STABLE"] = productService.quality === "stable" ? "1" : "0";
      if (options.shellIntegration.suggestEnabled) {
        envMixin["VSCODE_SUGGEST"] = "1";
      }
      return { newArgs, envMixin };
    } else if (shell === "bash.exe") {
      if (!originalArgs || originalArgs.length === 0) {
        newArgs = shellIntegrationArgs.get("bash" /* Bash */);
      } else if (areZshBashLoginArgs(originalArgs)) {
        envMixin["VSCODE_SHELL_LOGIN"] = "1";
        addEnvMixinPathPrefix(options, envMixin);
        newArgs = shellIntegrationArgs.get("bash" /* Bash */);
      }
      if (!newArgs) {
        return void 0;
      }
      newArgs = [...newArgs];
      newArgs[newArgs.length - 1] = format(newArgs[newArgs.length - 1], appRoot);
      envMixin["VSCODE_STABLE"] = productService.quality === "stable" ? "1" : "0";
      return { newArgs, envMixin };
    }
    logService.warn(`Shell integration cannot be enabled for executable "${shellLaunchConfig.executable}" and args`, shellLaunchConfig.args);
    return void 0;
  }
  switch (shell) {
    case "bash": {
      if (!originalArgs || originalArgs.length === 0) {
        newArgs = shellIntegrationArgs.get("bash" /* Bash */);
      } else if (areZshBashLoginArgs(originalArgs)) {
        envMixin["VSCODE_SHELL_LOGIN"] = "1";
        addEnvMixinPathPrefix(options, envMixin);
        newArgs = shellIntegrationArgs.get("bash" /* Bash */);
      }
      if (!newArgs) {
        return void 0;
      }
      newArgs = [...newArgs];
      newArgs[newArgs.length - 1] = format(newArgs[newArgs.length - 1], appRoot);
      envMixin["VSCODE_STABLE"] = productService.quality === "stable" ? "1" : "0";
      return { newArgs, envMixin };
    }
    case "fish": {
      const oldDataDirs = env?.XDG_DATA_DIRS ?? "/usr/local/share:/usr/share";
      const newDataDir = path.join(appRoot, "out/vs/workbench/contrib/terminal/common/scripts/fish_xdg_data");
      envMixin["XDG_DATA_DIRS"] = `${oldDataDirs}:${newDataDir}`;
      addEnvMixinPathPrefix(options, envMixin);
      return { newArgs: void 0, envMixin };
    }
    case "pwsh": {
      if (!originalArgs || arePwshImpliedArgs(originalArgs)) {
        newArgs = shellIntegrationArgs.get("pwsh" /* Pwsh */);
      } else if (arePwshLoginArgs(originalArgs)) {
        newArgs = shellIntegrationArgs.get("pwsh-login" /* PwshLogin */);
      }
      if (!newArgs) {
        return void 0;
      }
      if (options.shellIntegration.suggestEnabled) {
        envMixin["VSCODE_SUGGEST"] = "1";
      }
      newArgs = [...newArgs];
      newArgs[newArgs.length - 1] = format(newArgs[newArgs.length - 1], appRoot, "");
      envMixin["VSCODE_STABLE"] = productService.quality === "stable" ? "1" : "0";
      return { newArgs, envMixin };
    }
    case "zsh": {
      if (!originalArgs || originalArgs.length === 0) {
        newArgs = shellIntegrationArgs.get("zsh" /* Zsh */);
      } else if (areZshBashLoginArgs(originalArgs)) {
        newArgs = shellIntegrationArgs.get("zsh-login" /* ZshLogin */);
        addEnvMixinPathPrefix(options, envMixin);
      } else if (originalArgs === shellIntegrationArgs.get("zsh" /* Zsh */) || originalArgs === shellIntegrationArgs.get("zsh-login" /* ZshLogin */)) {
        newArgs = originalArgs;
      }
      if (!newArgs) {
        return void 0;
      }
      newArgs = [...newArgs];
      newArgs[newArgs.length - 1] = format(newArgs[newArgs.length - 1], appRoot);
      let username;
      try {
        username = os.userInfo().username;
      } catch {
        username = "unknown";
      }
      const zdotdir = path.join(os.tmpdir(), `${username}-${productService.applicationName}-zsh`);
      envMixin["ZDOTDIR"] = zdotdir;
      const userZdotdir = env?.ZDOTDIR ?? os.homedir() ?? `~`;
      envMixin["USER_ZDOTDIR"] = userZdotdir;
      const filesToCopy = [];
      filesToCopy.push({
        source: path.join(appRoot, "out/vs/workbench/contrib/terminal/common/scripts/shellIntegration-rc.zsh"),
        dest: path.join(zdotdir, ".zshrc")
      });
      filesToCopy.push({
        source: path.join(appRoot, "out/vs/workbench/contrib/terminal/common/scripts/shellIntegration-profile.zsh"),
        dest: path.join(zdotdir, ".zprofile")
      });
      filesToCopy.push({
        source: path.join(appRoot, "out/vs/workbench/contrib/terminal/common/scripts/shellIntegration-env.zsh"),
        dest: path.join(zdotdir, ".zshenv")
      });
      filesToCopy.push({
        source: path.join(appRoot, "out/vs/workbench/contrib/terminal/common/scripts/shellIntegration-login.zsh"),
        dest: path.join(zdotdir, ".zlogin")
      });
      return { newArgs, envMixin, filesToCopy };
    }
  }
  logService.warn(`Shell integration cannot be enabled for executable "${shellLaunchConfig.executable}" and args`, shellLaunchConfig.args);
  return void 0;
}
__name(getShellIntegrationInjection, "getShellIntegrationInjection");
function addEnvMixinPathPrefix(options, envMixin) {
  if (isMacintosh && options.environmentVariableCollections) {
    const deserialized = deserializeEnvironmentVariableCollections(options.environmentVariableCollections);
    const merged = new MergedEnvironmentVariableCollection(deserialized);
    const pathEntry = merged.getVariableMap({ workspaceFolder: options.workspaceFolder }).get("PATH");
    const prependToPath = [];
    if (pathEntry) {
      for (const mutator of pathEntry) {
        if (mutator.type === EnvironmentVariableMutatorType.Prepend) {
          prependToPath.push(mutator.value);
        }
      }
    }
    if (prependToPath.length > 0) {
      envMixin["VSCODE_PATH_PREFIX"] = prependToPath.join("");
    }
  }
}
__name(addEnvMixinPathPrefix, "addEnvMixinPathPrefix");
var ShellIntegrationExecutable = /* @__PURE__ */ ((ShellIntegrationExecutable2) => {
  ShellIntegrationExecutable2["WindowsPwsh"] = "windows-pwsh";
  ShellIntegrationExecutable2["WindowsPwshLogin"] = "windows-pwsh-login";
  ShellIntegrationExecutable2["Pwsh"] = "pwsh";
  ShellIntegrationExecutable2["PwshLogin"] = "pwsh-login";
  ShellIntegrationExecutable2["Zsh"] = "zsh";
  ShellIntegrationExecutable2["ZshLogin"] = "zsh-login";
  ShellIntegrationExecutable2["Bash"] = "bash";
  return ShellIntegrationExecutable2;
})(ShellIntegrationExecutable || {});
const shellIntegrationArgs = /* @__PURE__ */ new Map();
shellIntegrationArgs.set("windows-pwsh" /* WindowsPwsh */, ["-noexit", "-command", 'try { . "{0}\\out\\vs\\workbench\\contrib\\terminal\\common\\scripts\\shellIntegration.ps1" } catch {}{1}']);
shellIntegrationArgs.set("windows-pwsh-login" /* WindowsPwshLogin */, ["-l", "-noexit", "-command", 'try { . "{0}\\out\\vs\\workbench\\contrib\\terminal\\common\\scripts\\shellIntegration.ps1" } catch {}{1}']);
shellIntegrationArgs.set("pwsh" /* Pwsh */, ["-noexit", "-command", '. "{0}/out/vs/workbench/contrib/terminal/common/scripts/shellIntegration.ps1"{1}']);
shellIntegrationArgs.set("pwsh-login" /* PwshLogin */, ["-l", "-noexit", "-command", '. "{0}/out/vs/workbench/contrib/terminal/common/scripts/shellIntegration.ps1"']);
shellIntegrationArgs.set("zsh" /* Zsh */, ["-i"]);
shellIntegrationArgs.set("zsh-login" /* ZshLogin */, ["-il"]);
shellIntegrationArgs.set("bash" /* Bash */, ["--init-file", "{0}/out/vs/workbench/contrib/terminal/common/scripts/shellIntegration-bash.sh"]);
const pwshLoginArgs = ["-login", "-l"];
const shLoginArgs = ["--login", "-l"];
const shInteractiveArgs = ["-i", "--interactive"];
const pwshImpliedArgs = ["-nol", "-nologo"];
function arePwshLoginArgs(originalArgs) {
  if (typeof originalArgs === "string") {
    return pwshLoginArgs.includes(originalArgs.toLowerCase());
  } else {
    return originalArgs.length === 1 && pwshLoginArgs.includes(originalArgs[0].toLowerCase()) || originalArgs.length === 2 && (pwshLoginArgs.includes(originalArgs[0].toLowerCase()) || pwshLoginArgs.includes(originalArgs[1].toLowerCase())) && (pwshImpliedArgs.includes(originalArgs[0].toLowerCase()) || pwshImpliedArgs.includes(originalArgs[1].toLowerCase()));
  }
}
__name(arePwshLoginArgs, "arePwshLoginArgs");
function arePwshImpliedArgs(originalArgs) {
  if (typeof originalArgs === "string") {
    return pwshImpliedArgs.includes(originalArgs.toLowerCase());
  } else {
    return originalArgs.length === 0 || originalArgs?.length === 1 && pwshImpliedArgs.includes(originalArgs[0].toLowerCase());
  }
}
__name(arePwshImpliedArgs, "arePwshImpliedArgs");
function areZshBashLoginArgs(originalArgs) {
  if (typeof originalArgs !== "string") {
    originalArgs = originalArgs.filter((arg) => !shInteractiveArgs.includes(arg.toLowerCase()));
  }
  return originalArgs === "string" && shLoginArgs.includes(originalArgs.toLowerCase()) || typeof originalArgs !== "string" && originalArgs.length === 1 && shLoginArgs.includes(originalArgs[0].toLowerCase());
}
__name(areZshBashLoginArgs, "areZshBashLoginArgs");
export {
  findExecutable,
  getShellIntegrationInjection,
  getWindowsBuildNumber
};
//# sourceMappingURL=terminalEnvironment.js.map
