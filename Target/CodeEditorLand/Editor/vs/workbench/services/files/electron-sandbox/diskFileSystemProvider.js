var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { isLinux } from "../../../../base/common/platform.js";
import { localize } from "../../../../nls.js";
import { AbstractDiskFileSystemProvider } from "../../../../platform/files/common/diskFileSystemProvider.js";
import {
  DiskFileSystemProviderClient,
  LOCAL_FILE_SYSTEM_CHANNEL_NAME
} from "../../../../platform/files/common/diskFileSystemProviderClient.js";
import { LogService } from "../../../../platform/log/common/logService.js";
import { UniversalWatcherClient } from "./watcherClient.js";
class DiskFileSystemProvider extends AbstractDiskFileSystemProvider {
  constructor(mainProcessService, utilityProcessWorkerWorkbenchService, logService, loggerService) {
    super(logService, {
      watcher: {
        forceUniversal: true
      }
    });
    this.mainProcessService = mainProcessService;
    this.utilityProcessWorkerWorkbenchService = utilityProcessWorkerWorkbenchService;
    this.loggerService = loggerService;
    this.registerListeners();
  }
  static {
    __name(this, "DiskFileSystemProvider");
  }
  provider = this._register(
    new DiskFileSystemProviderClient(
      this.mainProcessService.getChannel(LOCAL_FILE_SYSTEM_CHANNEL_NAME),
      { pathCaseSensitive: isLinux, trash: true }
    )
  );
  registerListeners() {
    this._register(
      this.provider.onDidChangeFile(
        (changes) => this._onDidChangeFile.fire(changes)
      )
    );
    this._register(
      this.provider.onDidWatchError(
        (error) => this._onDidWatchError.fire(error)
      )
    );
  }
  //#region File Capabilities
  get onDidChangeCapabilities() {
    return this.provider.onDidChangeCapabilities;
  }
  get capabilities() {
    return this.provider.capabilities;
  }
  //#endregion
  //#region File Metadata Resolving
  stat(resource) {
    return this.provider.stat(resource);
  }
  readdir(resource) {
    return this.provider.readdir(resource);
  }
  //#endregion
  //#region File Reading/Writing
  readFile(resource, opts) {
    return this.provider.readFile(resource, opts);
  }
  readFileStream(resource, opts, token) {
    return this.provider.readFileStream(resource, opts, token);
  }
  writeFile(resource, content, opts) {
    return this.provider.writeFile(resource, content, opts);
  }
  open(resource, opts) {
    return this.provider.open(resource, opts);
  }
  close(fd) {
    return this.provider.close(fd);
  }
  read(fd, pos, data, offset, length) {
    return this.provider.read(fd, pos, data, offset, length);
  }
  write(fd, pos, data, offset, length) {
    return this.provider.write(fd, pos, data, offset, length);
  }
  //#endregion
  //#region Move/Copy/Delete/Create Folder
  mkdir(resource) {
    return this.provider.mkdir(resource);
  }
  delete(resource, opts) {
    return this.provider.delete(resource, opts);
  }
  rename(from, to, opts) {
    return this.provider.rename(from, to, opts);
  }
  copy(from, to, opts) {
    return this.provider.copy(from, to, opts);
  }
  //#endregion
  //#region Clone File
  cloneFile(from, to) {
    return this.provider.cloneFile(from, to);
  }
  //#endregion
  //#region File Watching
  createUniversalWatcher(onChange, onLogMessage, verboseLogging) {
    return new UniversalWatcherClient(
      (changes) => onChange(changes),
      (msg) => onLogMessage(msg),
      verboseLogging,
      this.utilityProcessWorkerWorkbenchService
    );
  }
  createNonRecursiveWatcher() {
    throw new Error("Method not implemented in sandbox.");
  }
  _watcherLogService = void 0;
  get watcherLogService() {
    if (!this._watcherLogService) {
      this._watcherLogService = new LogService(
        this.loggerService.createLogger("fileWatcher", {
          name: localize("fileWatcher", "File Watcher")
        })
      );
    }
    return this._watcherLogService;
  }
  logWatcherMessage(msg) {
    this.watcherLogService[msg.type](msg.message);
    if (msg.type !== "trace" && msg.type !== "debug") {
      super.logWatcherMessage(msg);
    }
  }
  //#endregion
}
export {
  DiskFileSystemProvider
};
//# sourceMappingURL=diskFileSystemProvider.js.map
