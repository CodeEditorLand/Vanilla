import * as fs from "fs";
import * as os from "os";
import { performance } from "perf_hooks";
import { FileAccess } from "../../base/common/network.js";
import { dirname, join } from "../../base/common/path.js";
import * as perf from "../../base/common/performance.js";
import {
  parseArgs
} from "../../platform/environment/node/argv.js";
import product from "../../platform/product/common/product.js";
import { run as runCli } from "./remoteExtensionHostAgentCli.js";
import {
  createServer as doCreateServer
} from "./remoteExtensionHostAgentServer.js";
import { serverOptions } from "./serverEnvironmentService.js";
perf.mark("code/server/codeLoaded");
global.vscodeServerCodeLoadedTime = performance.now();
const errorReporter = {
  onMultipleValues: (id, usedValue) => {
    console.error(
      `Option '${id}' can only be defined once. Using value ${usedValue}.`
    );
  },
  onEmptyValue: (id) => {
    console.error(`Ignoring option '${id}': Value must not be empty.`);
  },
  onUnknownOption: (id) => {
    console.error(`Ignoring option '${id}': not supported for server.`);
  },
  onDeprecatedOption: (deprecatedOption, message) => {
    console.warn(`Option '${deprecatedOption}' is deprecated: ${message}`);
  }
};
const args = parseArgs(process.argv.slice(2), serverOptions, errorReporter);
const REMOTE_DATA_FOLDER = args["server-data-dir"] || process.env["VSCODE_AGENT_FOLDER"] || join(os.homedir(), product.serverDataFolderName || ".vscode-remote");
const USER_DATA_PATH = join(REMOTE_DATA_FOLDER, "data");
const APP_SETTINGS_HOME = join(USER_DATA_PATH, "User");
const GLOBAL_STORAGE_HOME = join(APP_SETTINGS_HOME, "globalStorage");
const LOCAL_HISTORY_HOME = join(APP_SETTINGS_HOME, "History");
const MACHINE_SETTINGS_HOME = join(USER_DATA_PATH, "Machine");
args["user-data-dir"] = USER_DATA_PATH;
const APP_ROOT = dirname(FileAccess.asFileUri("").fsPath);
const BUILTIN_EXTENSIONS_FOLDER_PATH = join(APP_ROOT, "extensions");
args["builtin-extensions-dir"] = BUILTIN_EXTENSIONS_FOLDER_PATH;
args["extensions-dir"] = args["extensions-dir"] || join(REMOTE_DATA_FOLDER, "extensions");
[
  REMOTE_DATA_FOLDER,
  args["extensions-dir"],
  USER_DATA_PATH,
  APP_SETTINGS_HOME,
  MACHINE_SETTINGS_HOME,
  GLOBAL_STORAGE_HOME,
  LOCAL_HISTORY_HOME
].forEach((f) => {
  try {
    if (!fs.existsSync(f)) {
      fs.mkdirSync(f, { mode: 448 });
    }
  } catch (err) {
    console.error(err);
  }
});
function spawnCli() {
  runCli(args, REMOTE_DATA_FOLDER, serverOptions);
}
function createServer(address) {
  return doCreateServer(address, args, REMOTE_DATA_FOLDER);
}
export {
  createServer,
  spawnCli
};
