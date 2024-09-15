var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as fs from "fs";
import * as url from "url";
import * as cp from "child_process";
import * as http from "http";
import { cwd } from "../../base/common/process.js";
import { dirname, extname, resolve, join } from "../../base/common/path.js";
import { parseArgs, buildHelpMessage, buildVersionMessage, OPTIONS, OptionDescriptions, ErrorReporter } from "../../platform/environment/node/argv.js";
import { NativeParsedArgs } from "../../platform/environment/common/argv.js";
import { createWaitMarkerFileSync } from "../../platform/environment/node/wait.js";
import { PipeCommand } from "../../workbench/api/node/extHostCLIServer.js";
import { hasStdinWithoutTty, getStdinFilePath, readFromStdin } from "../../platform/environment/node/stdin.js";
import { DeferredPromise } from "../../base/common/async.js";
const isSupportedForCmd = /* @__PURE__ */ __name((optionId) => {
  switch (optionId) {
    case "user-data-dir":
    case "extensions-dir":
    case "export-default-configuration":
    case "install-source":
    case "enable-smoke-test-driver":
    case "extensions-download-dir":
    case "builtin-extensions-dir":
    case "telemetry":
      return false;
    default:
      return true;
  }
}, "isSupportedForCmd");
const isSupportedForPipe = /* @__PURE__ */ __name((optionId) => {
  switch (optionId) {
    case "version":
    case "help":
    case "folder-uri":
    case "file-uri":
    case "add":
    case "diff":
    case "merge":
    case "wait":
    case "goto":
    case "reuse-window":
    case "new-window":
    case "status":
    case "install-extension":
    case "uninstall-extension":
    case "update-extensions":
    case "list-extensions":
    case "force":
    case "show-versions":
    case "category":
    case "verbose":
    case "remote":
    case "locate-shell-integration-path":
      return true;
    default:
      return false;
  }
}, "isSupportedForPipe");
const cliPipe = process.env["VSCODE_IPC_HOOK_CLI"];
const cliCommand = process.env["VSCODE_CLIENT_COMMAND"];
const cliCommandCwd = process.env["VSCODE_CLIENT_COMMAND_CWD"];
const cliRemoteAuthority = process.env["VSCODE_CLI_AUTHORITY"];
const cliStdInFilePath = process.env["VSCODE_STDIN_FILE_PATH"];
async function main(desc, args) {
  if (!cliPipe && !cliCommand) {
    console.log("Command is only available in WSL or inside a Visual Studio Code terminal.");
    return;
  }
  const options = { ...OPTIONS, gitCredential: { type: "string" }, openExternal: { type: "boolean" } };
  const isSupported = cliCommand ? isSupportedForCmd : isSupportedForPipe;
  for (const optionId in OPTIONS) {
    const optId = optionId;
    if (!isSupported(optId)) {
      delete options[optId];
    }
  }
  if (cliPipe) {
    options["openExternal"] = { type: "boolean" };
  }
  const errorReporter = {
    onMultipleValues: /* @__PURE__ */ __name((id, usedValue) => {
      console.error(`Option '${id}' can only be defined once. Using value ${usedValue}.`);
    }, "onMultipleValues"),
    onEmptyValue: /* @__PURE__ */ __name((id) => {
      console.error(`Ignoring option '${id}': Value must not be empty.`);
    }, "onEmptyValue"),
    onUnknownOption: /* @__PURE__ */ __name((id) => {
      console.error(`Ignoring option '${id}': not supported for ${desc.executableName}.`);
    }, "onUnknownOption"),
    onDeprecatedOption: /* @__PURE__ */ __name((deprecatedOption, message) => {
      console.warn(`Option '${deprecatedOption}' is deprecated: ${message}`);
    }, "onDeprecatedOption")
  };
  const parsedArgs = parseArgs(args, options, errorReporter);
  const mapFileUri = cliRemoteAuthority ? mapFileToRemoteUri : (uri) => uri;
  const verbose = !!parsedArgs["verbose"];
  if (parsedArgs.help) {
    console.log(buildHelpMessage(desc.productName, desc.executableName, desc.version, options));
    return;
  }
  if (parsedArgs.version) {
    console.log(buildVersionMessage(desc.version, desc.commit));
    return;
  }
  if (parsedArgs["locate-shell-integration-path"]) {
    let file;
    switch (parsedArgs["locate-shell-integration-path"]) {
      // Usage: `[[ "$TERM_PROGRAM" == "vscode" ]] && . "$(code --locate-shell-integration-path bash)"`
      case "bash":
        file = "shellIntegration-bash.sh";
        break;
      // Usage: `if ($env:TERM_PROGRAM -eq "vscode") { . "$(code --locate-shell-integration-path pwsh)" }`
      case "pwsh":
        file = "shellIntegration.ps1";
        break;
      // Usage: `[[ "$TERM_PROGRAM" == "vscode" ]] && . "$(code --locate-shell-integration-path zsh)"`
      case "zsh":
        file = "shellIntegration-rc.zsh";
        break;
      // Usage: `string match -q "$TERM_PROGRAM" "vscode"; and . (code --locate-shell-integration-path fish)`
      case "fish":
        file = "fish_xdg_data/fish/vendor_conf.d/shellIntegration.fish";
        break;
      default:
        throw new Error("Error using --locate-shell-integration-path: Invalid shell type");
    }
    console.log(resolve(__dirname, "../..", "workbench", "contrib", "terminal", "browser", "media", file));
    return;
  }
  if (cliPipe) {
    if (parsedArgs["openExternal"]) {
      openInBrowser(parsedArgs["_"], verbose);
      return;
    }
  }
  let remote = parsedArgs.remote;
  if (remote === "local" || remote === "false" || remote === "") {
    remote = null;
  }
  const folderURIs = (parsedArgs["folder-uri"] || []).map(mapFileUri);
  parsedArgs["folder-uri"] = folderURIs;
  const fileURIs = (parsedArgs["file-uri"] || []).map(mapFileUri);
  parsedArgs["file-uri"] = fileURIs;
  const inputPaths = parsedArgs["_"];
  let hasReadStdinArg = false;
  for (const input of inputPaths) {
    if (input === "-") {
      hasReadStdinArg = true;
    } else {
      translatePath(input, mapFileUri, folderURIs, fileURIs);
    }
  }
  parsedArgs["_"] = [];
  let readFromStdinPromise;
  if (hasReadStdinArg && hasStdinWithoutTty()) {
    try {
      let stdinFilePath = cliStdInFilePath;
      if (!stdinFilePath) {
        stdinFilePath = getStdinFilePath();
        const readFromStdinDone = new DeferredPromise();
        await readFromStdin(stdinFilePath, verbose, () => readFromStdinDone.complete());
        if (!parsedArgs.wait) {
          readFromStdinPromise = readFromStdinDone.p;
        }
      }
      translatePath(stdinFilePath, mapFileUri, folderURIs, fileURIs);
      parsedArgs["skip-add-to-recently-opened"] = true;
      console.log(`Reading from stdin via: ${stdinFilePath}`);
    } catch (e) {
      console.log(`Failed to create file to read via stdin: ${e.toString()}`);
    }
  }
  if (parsedArgs.extensionDevelopmentPath) {
    parsedArgs.extensionDevelopmentPath = parsedArgs.extensionDevelopmentPath.map((p) => mapFileUri(pathToURI(p).href));
  }
  if (parsedArgs.extensionTestsPath) {
    parsedArgs.extensionTestsPath = mapFileUri(pathToURI(parsedArgs["extensionTestsPath"]).href);
  }
  const crashReporterDirectory = parsedArgs["crash-reporter-directory"];
  if (crashReporterDirectory !== void 0 && !crashReporterDirectory.match(/^([a-zA-Z]:[\\\/])/)) {
    console.log(`The crash reporter directory '${crashReporterDirectory}' must be an absolute Windows path (e.g. c:/crashes)`);
    return;
  }
  if (cliCommand) {
    if (parsedArgs["install-extension"] !== void 0 || parsedArgs["uninstall-extension"] !== void 0 || parsedArgs["list-extensions"] || parsedArgs["update-extensions"]) {
      const cmdLine = [];
      parsedArgs["install-extension"]?.forEach((id) => cmdLine.push("--install-extension", id));
      parsedArgs["uninstall-extension"]?.forEach((id) => cmdLine.push("--uninstall-extension", id));
      ["list-extensions", "force", "show-versions", "category"].forEach((opt) => {
        const value = parsedArgs[opt];
        if (value !== void 0) {
          cmdLine.push(`--${opt}=${value}`);
        }
      });
      if (parsedArgs["update-extensions"]) {
        cmdLine.push("--update-extensions");
      }
      const childProcess = cp.fork(join(__dirname, "../../../server-main.js"), cmdLine, { stdio: "inherit" });
      childProcess.on("error", (err) => console.log(err));
      return;
    }
    const newCommandline = [];
    for (const key in parsedArgs) {
      const val = parsedArgs[key];
      if (typeof val === "boolean") {
        if (val) {
          newCommandline.push("--" + key);
        }
      } else if (Array.isArray(val)) {
        for (const entry of val) {
          newCommandline.push(`--${key}=${entry.toString()}`);
        }
      } else if (val) {
        newCommandline.push(`--${key}=${val.toString()}`);
      }
    }
    if (remote !== null) {
      newCommandline.push(`--remote=${remote || cliRemoteAuthority}`);
    }
    const ext = extname(cliCommand);
    if (ext === ".bat" || ext === ".cmd") {
      const processCwd = cliCommandCwd || cwd();
      if (verbose) {
        console.log(`Invoking: cmd.exe /C ${cliCommand} ${newCommandline.join(" ")} in ${processCwd}`);
      }
      cp.spawn("cmd.exe", ["/C", cliCommand, ...newCommandline], {
        stdio: "inherit",
        cwd: processCwd
      });
    } else {
      const cliCwd = dirname(cliCommand);
      const env = { ...process.env, ELECTRON_RUN_AS_NODE: "1" };
      newCommandline.unshift("resources/app/out/cli.js");
      if (verbose) {
        console.log(`Invoking: cd "${cliCwd}" && ELECTRON_RUN_AS_NODE=1 "${cliCommand}" "${newCommandline.join('" "')}"`);
      }
      if (runningInWSL2()) {
        if (verbose) {
          console.log(`Using pipes for output.`);
        }
        const childProcess = cp.spawn(cliCommand, newCommandline, { cwd: cliCwd, env, stdio: ["inherit", "pipe", "pipe"] });
        childProcess.stdout.on("data", (data) => process.stdout.write(data));
        childProcess.stderr.on("data", (data) => process.stderr.write(data));
      } else {
        cp.spawn(cliCommand, newCommandline, { cwd: cliCwd, env, stdio: "inherit" });
      }
    }
  } else {
    if (parsedArgs.status) {
      sendToPipe({
        type: "status"
      }, verbose).then((res) => {
        console.log(res);
      }).catch((e) => {
        console.error("Error when requesting status:", e);
      });
      return;
    }
    if (parsedArgs["install-extension"] !== void 0 || parsedArgs["uninstall-extension"] !== void 0 || parsedArgs["list-extensions"] || parsedArgs["update-extensions"]) {
      sendToPipe({
        type: "extensionManagement",
        list: parsedArgs["list-extensions"] ? { showVersions: parsedArgs["show-versions"], category: parsedArgs["category"] } : void 0,
        install: asExtensionIdOrVSIX(parsedArgs["install-extension"]),
        uninstall: asExtensionIdOrVSIX(parsedArgs["uninstall-extension"]),
        force: parsedArgs["force"]
      }, verbose).then((res) => {
        console.log(res);
      }).catch((e) => {
        console.error("Error when invoking the extension management command:", e);
      });
      return;
    }
    let waitMarkerFilePath = void 0;
    if (parsedArgs["wait"]) {
      if (!fileURIs.length) {
        console.log("At least one file must be provided to wait for.");
        return;
      }
      waitMarkerFilePath = createWaitMarkerFileSync(verbose);
    }
    sendToPipe({
      type: "open",
      fileURIs,
      folderURIs,
      diffMode: parsedArgs.diff,
      mergeMode: parsedArgs.merge,
      addMode: parsedArgs.add,
      gotoLineMode: parsedArgs.goto,
      forceReuseWindow: parsedArgs["reuse-window"],
      forceNewWindow: parsedArgs["new-window"],
      waitMarkerFilePath,
      remoteAuthority: remote
    }, verbose).catch((e) => {
      console.error("Error when invoking the open command:", e);
    });
    if (waitMarkerFilePath) {
      waitForFileDeleted(waitMarkerFilePath);
    }
    if (readFromStdinPromise) {
      await readFromStdinPromise;
    }
  }
}
__name(main, "main");
function runningInWSL2() {
  if (!!process.env["WSL_DISTRO_NAME"]) {
    try {
      return cp.execSync("uname -r", { encoding: "utf8" }).includes("-microsoft-");
    } catch (_e) {
    }
  }
  return false;
}
__name(runningInWSL2, "runningInWSL2");
async function waitForFileDeleted(path) {
  while (fs.existsSync(path)) {
    await new Promise((res) => setTimeout(res, 1e3));
  }
}
__name(waitForFileDeleted, "waitForFileDeleted");
function openInBrowser(args, verbose) {
  const uris = [];
  for (const location of args) {
    try {
      if (/^(http|https|file):\/\//.test(location)) {
        uris.push(url.parse(location).href);
      } else {
        uris.push(pathToURI(location).href);
      }
    } catch (e) {
      console.log(`Invalid url: ${location}`);
    }
  }
  if (uris.length) {
    sendToPipe({
      type: "openExternal",
      uris
    }, verbose).catch((e) => {
      console.error("Error when invoking the open external command:", e);
    });
  }
}
__name(openInBrowser, "openInBrowser");
function sendToPipe(args, verbose) {
  if (verbose) {
    console.log(JSON.stringify(args, null, "  "));
  }
  return new Promise((resolve2, reject) => {
    const message = JSON.stringify(args);
    if (!cliPipe) {
      console.log("Message " + message);
      resolve2("");
      return;
    }
    const opts = {
      socketPath: cliPipe,
      path: "/",
      method: "POST",
      headers: {
        "content-type": "application/json",
        "accept": "application/json"
      }
    };
    const req = http.request(opts, (res) => {
      if (res.headers["content-type"] !== "application/json") {
        reject("Error in response: Invalid content type: Expected 'application/json', is: " + res.headers["content-type"]);
        return;
      }
      const chunks = [];
      res.setEncoding("utf8");
      res.on("data", (chunk) => {
        chunks.push(chunk);
      });
      res.on("error", (err) => fatal("Error in response.", err));
      res.on("end", () => {
        const content = chunks.join("");
        try {
          const obj = JSON.parse(content);
          if (res.statusCode === 200) {
            resolve2(obj);
          } else {
            reject(obj);
          }
        } catch (e) {
          reject("Error in response: Unable to parse response as JSON: " + content);
        }
      });
    });
    req.on("error", (err) => fatal("Error in request.", err));
    req.write(message);
    req.end();
  });
}
__name(sendToPipe, "sendToPipe");
function asExtensionIdOrVSIX(inputs) {
  return inputs?.map((input) => /\.vsix$/i.test(input) ? pathToURI(input).href : input);
}
__name(asExtensionIdOrVSIX, "asExtensionIdOrVSIX");
function fatal(message, err) {
  console.error("Unable to connect to VS Code server: " + message);
  console.error(err);
  process.exit(1);
}
__name(fatal, "fatal");
const preferredCwd = process.env.PWD || cwd();
function pathToURI(input) {
  input = input.trim();
  input = resolve(preferredCwd, input);
  return url.pathToFileURL(input);
}
__name(pathToURI, "pathToURI");
function translatePath(input, mapFileUri, folderURIS, fileURIS) {
  const url2 = pathToURI(input);
  const mappedUri = mapFileUri(url2.href);
  try {
    const stat = fs.lstatSync(fs.realpathSync(input));
    if (stat.isFile()) {
      fileURIS.push(mappedUri);
    } else if (stat.isDirectory()) {
      folderURIS.push(mappedUri);
    } else if (input === "/dev/null") {
      fileURIS.push(mappedUri);
    }
  } catch (e) {
    if (e.code === "ENOENT") {
      fileURIS.push(mappedUri);
    } else {
      console.log(`Problem accessing file ${input}. Ignoring file`, e);
    }
  }
}
__name(translatePath, "translatePath");
function mapFileToRemoteUri(uri) {
  return uri.replace(/^file:\/\//, "vscode-remote://" + cliRemoteAuthority);
}
__name(mapFileToRemoteUri, "mapFileToRemoteUri");
const [, , productName, version, commit, executableName, ...remainingArgs] = process.argv;
main({ productName, version, commit, executableName }, remainingArgs).then(null, (err) => {
  console.error(err.message || err.stack || err);
});
export {
  main
};
//# sourceMappingURL=server.cli.js.map
