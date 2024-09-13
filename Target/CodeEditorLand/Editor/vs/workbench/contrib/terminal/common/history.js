var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { Disposable } from "../../../../base/common/lifecycle.js";
import { LRUCache } from "../../../../base/common/map.js";
import { Schemas } from "../../../../base/common/network.js";
import { join } from "../../../../base/common/path.js";
import {
  OperatingSystem,
  isWindows
} from "../../../../base/common/platform.js";
import { env } from "../../../../base/common/process.js";
import { URI } from "../../../../base/common/uri.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import {
  FileOperationError,
  FileOperationResult,
  IFileService
} from "../../../../platform/files/common/files.js";
import {
  IInstantiationService
} from "../../../../platform/instantiation/common/instantiation.js";
import {
  IStorageService,
  StorageScope,
  StorageTarget
} from "../../../../platform/storage/common/storage.js";
import {
  GeneralShellType,
  PosixShellType,
  TerminalSettingId
} from "../../../../platform/terminal/common/terminal.js";
import { IRemoteAgentService } from "../../../services/remote/common/remoteAgentService.js";
var Constants = /* @__PURE__ */ ((Constants2) => {
  Constants2[Constants2["DefaultHistoryLimit"] = 100] = "DefaultHistoryLimit";
  return Constants2;
})(Constants || {});
var StorageKeys = /* @__PURE__ */ ((StorageKeys2) => {
  StorageKeys2["Entries"] = "terminal.history.entries";
  StorageKeys2["Timestamp"] = "terminal.history.timestamp";
  return StorageKeys2;
})(StorageKeys || {});
let commandHistory;
function getCommandHistory(accessor) {
  if (!commandHistory) {
    commandHistory = accessor.get(IInstantiationService).createInstance(
      TerminalPersistedHistory,
      "commands"
    );
  }
  return commandHistory;
}
__name(getCommandHistory, "getCommandHistory");
let directoryHistory;
function getDirectoryHistory(accessor) {
  if (!directoryHistory) {
    directoryHistory = accessor.get(IInstantiationService).createInstance(
      TerminalPersistedHistory,
      "dirs"
    );
  }
  return directoryHistory;
}
__name(getDirectoryHistory, "getDirectoryHistory");
const shellFileHistory = /* @__PURE__ */ new Map();
async function getShellFileHistory(accessor, shellType) {
  const cached = shellFileHistory.get(shellType);
  if (cached === null) {
    return [];
  }
  if (cached !== void 0) {
    return cached;
  }
  let result;
  switch (shellType) {
    case PosixShellType.Bash:
      result = await fetchBashHistory(accessor);
      break;
    case GeneralShellType.PowerShell:
      result = await fetchPwshHistory(accessor);
      break;
    case PosixShellType.Zsh:
      result = await fetchZshHistory(accessor);
      break;
    case PosixShellType.Fish:
      result = await fetchFishHistory(accessor);
      break;
    case GeneralShellType.Python:
      result = await fetchPythonHistory(accessor);
      break;
    default:
      return [];
  }
  if (result === void 0) {
    shellFileHistory.set(shellType, null);
    return [];
  }
  const array = Array.from(result);
  shellFileHistory.set(shellType, array);
  return array;
}
__name(getShellFileHistory, "getShellFileHistory");
function clearShellFileHistory() {
  shellFileHistory.clear();
}
__name(clearShellFileHistory, "clearShellFileHistory");
let TerminalPersistedHistory = class extends Disposable {
  constructor(_storageDataKey, _configurationService, _storageService) {
    super();
    this._storageDataKey = _storageDataKey;
    this._configurationService = _configurationService;
    this._storageService = _storageService;
    this._entries = new LRUCache(this._getHistoryLimit());
    this._register(this._configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(TerminalSettingId.ShellIntegrationCommandHistory)) {
        this._entries.limit = this._getHistoryLimit();
      }
    }));
    this._register(this._storageService.onDidChangeValue(StorageScope.APPLICATION, this._getTimestampStorageKey(), this._store)(() => {
      if (!this._isStale) {
        this._isStale = this._storageService.getNumber(this._getTimestampStorageKey(), StorageScope.APPLICATION, 0) !== this._timestamp;
      }
    }));
  }
  static {
    __name(this, "TerminalPersistedHistory");
  }
  _entries;
  _timestamp = 0;
  _isReady = false;
  _isStale = true;
  get entries() {
    this._ensureUpToDate();
    return this._entries.entries();
  }
  add(key, value) {
    this._ensureUpToDate();
    this._entries.set(key, value);
    this._saveState();
  }
  remove(key) {
    this._ensureUpToDate();
    this._entries.delete(key);
    this._saveState();
  }
  clear() {
    this._ensureUpToDate();
    this._entries.clear();
    this._saveState();
  }
  _ensureUpToDate() {
    if (!this._isReady) {
      this._loadState();
      this._isReady = true;
    }
    if (this._isStale) {
      this._entries.clear();
      this._loadState();
      this._isStale = false;
    }
  }
  _loadState() {
    this._timestamp = this._storageService.getNumber(
      this._getTimestampStorageKey(),
      StorageScope.APPLICATION,
      0
    );
    const serialized = this._loadPersistedState();
    if (serialized) {
      for (const entry of serialized.entries) {
        this._entries.set(entry.key, entry.value);
      }
    }
  }
  _loadPersistedState() {
    const raw = this._storageService.get(
      this._getEntriesStorageKey(),
      StorageScope.APPLICATION
    );
    if (raw === void 0 || raw.length === 0) {
      return void 0;
    }
    let serialized;
    try {
      serialized = JSON.parse(raw);
    } catch {
      return void 0;
    }
    return serialized;
  }
  _saveState() {
    const serialized = { entries: [] };
    this._entries.forEach(
      (value, key) => serialized.entries.push({ key, value })
    );
    this._storageService.store(
      this._getEntriesStorageKey(),
      JSON.stringify(serialized),
      StorageScope.APPLICATION,
      StorageTarget.MACHINE
    );
    this._timestamp = Date.now();
    this._storageService.store(
      this._getTimestampStorageKey(),
      this._timestamp,
      StorageScope.APPLICATION,
      StorageTarget.MACHINE
    );
  }
  _getHistoryLimit() {
    const historyLimit = this._configurationService.getValue(
      TerminalSettingId.ShellIntegrationCommandHistory
    );
    return typeof historyLimit === "number" ? historyLimit : 100 /* DefaultHistoryLimit */;
  }
  _getTimestampStorageKey() {
    return `${"terminal.history.timestamp" /* Timestamp */}.${this._storageDataKey}`;
  }
  _getEntriesStorageKey() {
    return `${"terminal.history.entries" /* Entries */}.${this._storageDataKey}`;
  }
};
TerminalPersistedHistory = __decorateClass([
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IStorageService)
], TerminalPersistedHistory);
async function fetchBashHistory(accessor) {
  const fileService = accessor.get(IFileService);
  const remoteAgentService = accessor.get(IRemoteAgentService);
  const remoteEnvironment = await remoteAgentService.getEnvironment();
  if (remoteEnvironment?.os === OperatingSystem.Windows || !remoteEnvironment && isWindows) {
    return void 0;
  }
  const content = await fetchFileContents(
    env["HOME"],
    ".bash_history",
    false,
    fileService,
    remoteAgentService
  );
  if (content === void 0) {
    return void 0;
  }
  const fileLines = content.split("\n");
  const result = /* @__PURE__ */ new Set();
  let currentLine;
  let currentCommand;
  let wrapChar;
  for (let i = 0; i < fileLines.length; i++) {
    currentLine = fileLines[i];
    if (currentCommand === void 0) {
      currentCommand = currentLine;
    } else {
      currentCommand += `
${currentLine}`;
    }
    for (let c = 0; c < currentLine.length; c++) {
      if (wrapChar) {
        if (currentLine[c] === wrapChar) {
          wrapChar = void 0;
        }
      } else if (currentLine[c].match(/['"]/)) {
        wrapChar = currentLine[c];
      }
    }
    if (wrapChar === void 0) {
      if (currentCommand.length > 0) {
        result.add(currentCommand.trim());
      }
      currentCommand = void 0;
    }
  }
  return result.values();
}
__name(fetchBashHistory, "fetchBashHistory");
async function fetchZshHistory(accessor) {
  const fileService = accessor.get(IFileService);
  const remoteAgentService = accessor.get(IRemoteAgentService);
  const remoteEnvironment = await remoteAgentService.getEnvironment();
  if (remoteEnvironment?.os === OperatingSystem.Windows || !remoteEnvironment && isWindows) {
    return void 0;
  }
  const content = await fetchFileContents(
    env["HOME"],
    ".zsh_history",
    false,
    fileService,
    remoteAgentService
  );
  if (content === void 0) {
    return void 0;
  }
  const fileLines = content.split(/:\s\d+:\d+;/);
  const result = /* @__PURE__ */ new Set();
  for (let i = 0; i < fileLines.length; i++) {
    const sanitized = fileLines[i].replace(/\\\n/g, "\n").trim();
    if (sanitized.length > 0) {
      result.add(sanitized);
    }
  }
  return result.values();
}
__name(fetchZshHistory, "fetchZshHistory");
async function fetchPythonHistory(accessor) {
  const fileService = accessor.get(IFileService);
  const remoteAgentService = accessor.get(IRemoteAgentService);
  const content = await fetchFileContents(
    env["HOME"],
    ".python_history",
    false,
    fileService,
    remoteAgentService
  );
  if (content === void 0) {
    return void 0;
  }
  const fileLines = content.split("\n");
  const result = /* @__PURE__ */ new Set();
  fileLines.forEach((line) => {
    if (line.trim().length > 0) {
      result.add(line.trim());
    }
  });
  return result.values();
}
__name(fetchPythonHistory, "fetchPythonHistory");
async function fetchPwshHistory(accessor) {
  const fileService = accessor.get(IFileService);
  const remoteAgentService = accessor.get(IRemoteAgentService);
  let folderPrefix;
  let filePath;
  const remoteEnvironment = await remoteAgentService.getEnvironment();
  const isFileWindows = remoteEnvironment?.os === OperatingSystem.Windows || !remoteEnvironment && isWindows;
  if (isFileWindows) {
    folderPrefix = env["APPDATA"];
    filePath = "Microsoft\\Windows\\PowerShell\\PSReadLine\\ConsoleHost_history.txt";
  } else {
    folderPrefix = env["HOME"];
    filePath = ".local/share/powershell/PSReadline/ConsoleHost_history.txt";
  }
  const content = await fetchFileContents(
    folderPrefix,
    filePath,
    isFileWindows,
    fileService,
    remoteAgentService
  );
  if (content === void 0) {
    return void 0;
  }
  const fileLines = content.split("\n");
  const result = /* @__PURE__ */ new Set();
  let currentLine;
  let currentCommand;
  let wrapChar;
  for (let i = 0; i < fileLines.length; i++) {
    currentLine = fileLines[i];
    if (currentCommand === void 0) {
      currentCommand = currentLine;
    } else {
      currentCommand += `
${currentLine}`;
    }
    if (!currentLine.endsWith("`")) {
      const sanitized = currentCommand.trim();
      if (sanitized.length > 0) {
        result.add(sanitized);
      }
      currentCommand = void 0;
      continue;
    }
    for (let c = 0; c < currentLine.length; c++) {
      if (wrapChar) {
        if (currentLine[c] === wrapChar) {
          wrapChar = void 0;
        }
      } else if (currentLine[c].match(/`/)) {
        wrapChar = currentLine[c];
      }
    }
    if (wrapChar) {
      currentCommand = currentCommand.replace(/`$/, "");
      wrapChar = void 0;
    } else {
      const sanitized = currentCommand.trim();
      if (sanitized.length > 0) {
        result.add(sanitized);
      }
      currentCommand = void 0;
    }
  }
  return result.values();
}
__name(fetchPwshHistory, "fetchPwshHistory");
async function fetchFishHistory(accessor) {
  const fileService = accessor.get(IFileService);
  const remoteAgentService = accessor.get(IRemoteAgentService);
  const remoteEnvironment = await remoteAgentService.getEnvironment();
  if (remoteEnvironment?.os === OperatingSystem.Windows || !remoteEnvironment && isWindows) {
    return void 0;
  }
  const overridenDataHome = env["XDG_DATA_HOME"];
  const content = await (overridenDataHome ? fetchFileContents(
    env["XDG_DATA_HOME"],
    "fish/fish_history",
    false,
    fileService,
    remoteAgentService
  ) : fetchFileContents(
    env["HOME"],
    ".local/share/fish/fish_history",
    false,
    fileService,
    remoteAgentService
  ));
  if (content === void 0) {
    return void 0;
  }
  const result = /* @__PURE__ */ new Set();
  const cmds = content.split("\n").filter((x) => x.startsWith("- cmd:")).map((x) => x.substring(6).trimStart());
  for (let i = 0; i < cmds.length; i++) {
    const sanitized = sanitizeFishHistoryCmd(cmds[i]).trim();
    if (sanitized.length > 0) {
      result.add(sanitized);
    }
  }
  return result.values();
}
__name(fetchFishHistory, "fetchFishHistory");
function sanitizeFishHistoryCmd(cmd) {
  return repeatedReplace(/(^|[^\\])((?:\\\\)*)(\\n)/g, cmd, "$1$2\n");
}
__name(sanitizeFishHistoryCmd, "sanitizeFishHistoryCmd");
function repeatedReplace(pattern, value, replaceValue) {
  let last;
  let current = value;
  while (true) {
    last = current;
    current = current.replace(pattern, replaceValue);
    if (current === last) {
      return current;
    }
  }
}
__name(repeatedReplace, "repeatedReplace");
async function fetchFileContents(folderPrefix, filePath, isFileWindows, fileService, remoteAgentService) {
  if (!folderPrefix) {
    return void 0;
  }
  const connection = remoteAgentService.getConnection();
  const isRemote = !!connection?.remoteAuthority;
  const historyFileUri = URI.from({
    scheme: isRemote ? Schemas.vscodeRemote : Schemas.file,
    authority: isRemote ? connection.remoteAuthority : void 0,
    path: URI.file(join(folderPrefix, filePath)).path
  });
  let content;
  try {
    content = await fileService.readFile(historyFileUri);
  } catch (e) {
    if (e instanceof FileOperationError && e.fileOperationResult === FileOperationResult.FILE_NOT_FOUND) {
      return void 0;
    }
    throw e;
  }
  if (content === void 0) {
    return void 0;
  }
  return content.value.toString();
}
__name(fetchFileContents, "fetchFileContents");
export {
  TerminalPersistedHistory,
  clearShellFileHistory,
  fetchBashHistory,
  fetchFishHistory,
  fetchPwshHistory,
  fetchPythonHistory,
  fetchZshHistory,
  getCommandHistory,
  getDirectoryHistory,
  getShellFileHistory,
  sanitizeFishHistoryCmd
};
//# sourceMappingURL=history.js.map
