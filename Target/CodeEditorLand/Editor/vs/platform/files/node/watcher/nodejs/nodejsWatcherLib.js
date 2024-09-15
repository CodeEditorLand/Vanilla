var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { watch, promises } from "fs";
import { RunOnceWorker, ThrottledWorker } from "../../../../../base/common/async.js";
import { CancellationToken, CancellationTokenSource } from "../../../../../base/common/cancellation.js";
import { isEqualOrParent } from "../../../../../base/common/extpath.js";
import { Disposable, DisposableStore, IDisposable, toDisposable } from "../../../../../base/common/lifecycle.js";
import { normalizeNFC } from "../../../../../base/common/normalization.js";
import { basename, dirname, join } from "../../../../../base/common/path.js";
import { isLinux, isMacintosh } from "../../../../../base/common/platform.js";
import { joinPath } from "../../../../../base/common/resources.js";
import { URI } from "../../../../../base/common/uri.js";
import { realcase } from "../../../../../base/node/extpath.js";
import { Promises } from "../../../../../base/node/pfs.js";
import { FileChangeType, IFileChange } from "../../../common/files.js";
import { ILogMessage, coalesceEvents, INonRecursiveWatchRequest, parseWatcherPatterns, IRecursiveWatcherWithSubscribe, isFiltered, isWatchRequestWithCorrelation } from "../../../common/watcher.js";
class NodeJSFileWatcherLibrary extends Disposable {
  constructor(request, recursiveWatcher, onDidFilesChange, onDidWatchFail, onLogMessage, verboseLogging) {
    super();
    this.request = request;
    this.recursiveWatcher = recursiveWatcher;
    this.onDidFilesChange = onDidFilesChange;
    this.onDidWatchFail = onDidWatchFail;
    this.onLogMessage = onLogMessage;
    this.verboseLogging = verboseLogging;
  }
  static {
    __name(this, "NodeJSFileWatcherLibrary");
  }
  // A delay in reacting to file deletes to support
  // atomic save operations where a tool may chose
  // to delete a file before creating it again for
  // an update.
  static FILE_DELETE_HANDLER_DELAY = 100;
  // A delay for collecting file changes from node.js
  // before collecting them for coalescing and emitting
  // Same delay as used for the recursive watcher.
  static FILE_CHANGES_HANDLER_DELAY = 75;
  // Reduce likelyhood of spam from file events via throttling.
  // These numbers are a bit more aggressive compared to the
  // recursive watcher because we can have many individual
  // node.js watchers per request.
  // (https://github.com/microsoft/vscode/issues/124723)
  throttledFileChangesEmitter = this._register(new ThrottledWorker(
    {
      maxWorkChunkSize: 100,
      // only process up to 100 changes at once before...
      throttleDelay: 200,
      // ...resting for 200ms until we process events again...
      maxBufferedWork: 1e4
      // ...but never buffering more than 10000 events in memory
    },
    (events) => this.onDidFilesChange(events)
  ));
  // Aggregate file changes over FILE_CHANGES_HANDLER_DELAY
  // to coalesce events and reduce spam.
  fileChangesAggregator = this._register(new RunOnceWorker((events) => this.handleFileChanges(events), NodeJSFileWatcherLibrary.FILE_CHANGES_HANDLER_DELAY));
  excludes = parseWatcherPatterns(this.request.path, this.request.excludes);
  includes = this.request.includes ? parseWatcherPatterns(this.request.path, this.request.includes) : void 0;
  filter = isWatchRequestWithCorrelation(this.request) ? this.request.filter : void 0;
  // TODO@bpasero filtering for now is only enabled when correlating because watchers are otherwise potentially reused
  cts = new CancellationTokenSource();
  ready = this.watch();
  _isReusingRecursiveWatcher = false;
  get isReusingRecursiveWatcher() {
    return this._isReusingRecursiveWatcher;
  }
  didFail = false;
  get failed() {
    return this.didFail;
  }
  async watch() {
    try {
      const realPath = await this.normalizePath(this.request);
      if (this.cts.token.isCancellationRequested) {
        return;
      }
      const stat = await promises.stat(realPath);
      if (this.cts.token.isCancellationRequested) {
        return;
      }
      this._register(await this.doWatch(realPath, stat.isDirectory()));
    } catch (error) {
      if (error.code !== "ENOENT") {
        this.error(error);
      } else {
        this.trace(`ignoring a path for watching who's stat info failed to resolve: ${this.request.path} (error: ${error})`);
      }
      this.notifyWatchFailed();
    }
  }
  notifyWatchFailed() {
    this.didFail = true;
    this.onDidWatchFail?.();
  }
  async normalizePath(request) {
    let realPath = request.path;
    try {
      realPath = await Promises.realpath(request.path);
      if (request.path === realPath) {
        realPath = await realcase(request.path, this.cts.token) ?? request.path;
      }
      if (request.path !== realPath) {
        this.trace(`correcting a path to watch that seems to be a symbolic link or wrong casing (original: ${request.path}, real: ${realPath})`);
      }
    } catch (error) {
    }
    return realPath;
  }
  async doWatch(realPath, isDirectory) {
    const disposables = new DisposableStore();
    if (this.doWatchWithExistingWatcher(realPath, isDirectory, disposables)) {
      this.trace(`reusing an existing recursive watcher for ${this.request.path}`);
      this._isReusingRecursiveWatcher = true;
    } else {
      this._isReusingRecursiveWatcher = false;
      await this.doWatchWithNodeJS(realPath, isDirectory, disposables);
    }
    return disposables;
  }
  doWatchWithExistingWatcher(realPath, isDirectory, disposables) {
    if (isDirectory) {
      return false;
    }
    const resource = URI.file(this.request.path);
    const subscription = this.recursiveWatcher?.subscribe(this.request.path, async (error, change) => {
      if (disposables.isDisposed) {
        return;
      }
      if (error) {
        const watchDisposable = await this.doWatch(realPath, isDirectory);
        if (!disposables.isDisposed) {
          disposables.add(watchDisposable);
        } else {
          watchDisposable.dispose();
        }
      } else if (change) {
        if (typeof change.cId === "number" || typeof this.request.correlationId === "number") {
          this.onFileChange(
            { resource, type: change.type, cId: this.request.correlationId },
            true
            /* skip excludes/includes (file is explicitly watched) */
          );
        }
      }
    });
    if (subscription) {
      disposables.add(subscription);
      return true;
    }
    return false;
  }
  async doWatchWithNodeJS(realPath, isDirectory, disposables) {
    if (isMacintosh && isEqualOrParent(realPath, "/Volumes/", true)) {
      this.error(`Refusing to watch ${realPath} for changes using fs.watch() for possibly being a network share where watching is unreliable and unstable.`);
      return;
    }
    const cts = new CancellationTokenSource(this.cts.token);
    disposables.add(toDisposable(() => cts.dispose(true)));
    const watcherDisposables = new DisposableStore();
    disposables.add(watcherDisposables);
    try {
      const requestResource = URI.file(this.request.path);
      const pathBasename = basename(realPath);
      const watcher = watch(realPath);
      watcherDisposables.add(toDisposable(() => {
        watcher.removeAllListeners();
        watcher.close();
      }));
      this.trace(`Started watching: '${realPath}'`);
      const folderChildren = /* @__PURE__ */ new Set();
      if (isDirectory) {
        try {
          for (const child of await Promises.readdir(realPath)) {
            folderChildren.add(child);
          }
        } catch (error) {
          this.error(error);
        }
      }
      if (cts.token.isCancellationRequested) {
        return;
      }
      const mapPathToStatDisposable = /* @__PURE__ */ new Map();
      watcherDisposables.add(toDisposable(() => {
        for (const [, disposable] of mapPathToStatDisposable) {
          disposable.dispose();
        }
        mapPathToStatDisposable.clear();
      }));
      watcher.on("error", (code, signal) => {
        if (cts.token.isCancellationRequested) {
          return;
        }
        this.error(`Failed to watch ${realPath} for changes using fs.watch() (${code}, ${signal})`);
        this.notifyWatchFailed();
      });
      watcher.on("change", (type, raw) => {
        if (cts.token.isCancellationRequested) {
          return;
        }
        if (this.verboseLogging) {
          this.traceWithCorrelation(`[raw] ["${type}"] ${raw}`);
        }
        let changedFileName = "";
        if (raw) {
          changedFileName = raw.toString();
          if (isMacintosh) {
            changedFileName = normalizeNFC(changedFileName);
          }
        }
        if (!changedFileName || type !== "change" && type !== "rename") {
          return;
        }
        if (isDirectory) {
          if (type === "rename") {
            mapPathToStatDisposable.get(changedFileName)?.dispose();
            const timeoutHandle = setTimeout(async () => {
              mapPathToStatDisposable.delete(changedFileName);
              if (changedFileName === pathBasename && !await Promises.exists(realPath)) {
                this.onWatchedPathDeleted(requestResource);
                return;
              }
              if (cts.token.isCancellationRequested) {
                return;
              }
              const fileExists = await this.existsChildStrictCase(join(realPath, changedFileName));
              if (cts.token.isCancellationRequested) {
                return;
              }
              let type2;
              if (fileExists) {
                if (folderChildren.has(changedFileName)) {
                  type2 = FileChangeType.UPDATED;
                } else {
                  type2 = FileChangeType.ADDED;
                  folderChildren.add(changedFileName);
                }
              } else {
                folderChildren.delete(changedFileName);
                type2 = FileChangeType.DELETED;
              }
              this.onFileChange({ resource: joinPath(requestResource, changedFileName), type: type2, cId: this.request.correlationId });
            }, NodeJSFileWatcherLibrary.FILE_DELETE_HANDLER_DELAY);
            mapPathToStatDisposable.set(changedFileName, toDisposable(() => clearTimeout(timeoutHandle)));
          } else {
            let type2;
            if (folderChildren.has(changedFileName)) {
              type2 = FileChangeType.UPDATED;
            } else {
              type2 = FileChangeType.ADDED;
              folderChildren.add(changedFileName);
            }
            this.onFileChange({ resource: joinPath(requestResource, changedFileName), type: type2, cId: this.request.correlationId });
          }
        } else {
          if (type === "rename" || changedFileName !== pathBasename) {
            const timeoutHandle = setTimeout(async () => {
              const fileExists = await Promises.exists(realPath);
              if (cts.token.isCancellationRequested) {
                return;
              }
              if (fileExists) {
                this.onFileChange(
                  { resource: requestResource, type: FileChangeType.UPDATED, cId: this.request.correlationId },
                  true
                  /* skip excludes/includes (file is explicitly watched) */
                );
                watcherDisposables.add(await this.doWatch(realPath, false));
              } else {
                this.onWatchedPathDeleted(requestResource);
              }
            }, NodeJSFileWatcherLibrary.FILE_DELETE_HANDLER_DELAY);
            watcherDisposables.clear();
            watcherDisposables.add(toDisposable(() => clearTimeout(timeoutHandle)));
          } else {
            this.onFileChange(
              { resource: requestResource, type: FileChangeType.UPDATED, cId: this.request.correlationId },
              true
              /* skip excludes/includes (file is explicitly watched) */
            );
          }
        }
      });
    } catch (error) {
      if (!cts.token.isCancellationRequested) {
        this.error(`Failed to watch ${realPath} for changes using fs.watch() (${error.toString()})`);
      }
      this.notifyWatchFailed();
    }
  }
  onWatchedPathDeleted(resource) {
    this.warn("Watcher shutdown because watched path got deleted");
    this.onFileChange(
      { resource, type: FileChangeType.DELETED, cId: this.request.correlationId },
      true
      /* skip excludes/includes (file is explicitly watched) */
    );
    this.fileChangesAggregator.flush();
    this.notifyWatchFailed();
  }
  onFileChange(event, skipIncludeExcludeChecks = false) {
    if (this.cts.token.isCancellationRequested) {
      return;
    }
    if (this.verboseLogging) {
      this.traceWithCorrelation(`${event.type === FileChangeType.ADDED ? "[ADDED]" : event.type === FileChangeType.DELETED ? "[DELETED]" : "[CHANGED]"} ${event.resource.fsPath}`);
    }
    if (!skipIncludeExcludeChecks && this.excludes.some((exclude) => exclude(event.resource.fsPath))) {
      if (this.verboseLogging) {
        this.traceWithCorrelation(` >> ignored (excluded) ${event.resource.fsPath}`);
      }
    } else if (!skipIncludeExcludeChecks && this.includes && this.includes.length > 0 && !this.includes.some((include) => include(event.resource.fsPath))) {
      if (this.verboseLogging) {
        this.traceWithCorrelation(` >> ignored (not included) ${event.resource.fsPath}`);
      }
    } else {
      this.fileChangesAggregator.work(event);
    }
  }
  handleFileChanges(fileChanges) {
    const coalescedFileChanges = coalesceEvents(fileChanges);
    const filteredEvents = [];
    for (const event of coalescedFileChanges) {
      if (isFiltered(event, this.filter)) {
        if (this.verboseLogging) {
          this.traceWithCorrelation(` >> ignored (filtered) ${event.resource.fsPath}`);
        }
        continue;
      }
      filteredEvents.push(event);
    }
    if (filteredEvents.length === 0) {
      return;
    }
    if (this.verboseLogging) {
      for (const event of filteredEvents) {
        this.traceWithCorrelation(` >> normalized ${event.type === FileChangeType.ADDED ? "[ADDED]" : event.type === FileChangeType.DELETED ? "[DELETED]" : "[CHANGED]"} ${event.resource.fsPath}`);
      }
    }
    const worked = this.throttledFileChangesEmitter.work(filteredEvents);
    if (!worked) {
      this.warn(`started ignoring events due to too many file change events at once (incoming: ${filteredEvents.length}, most recent change: ${filteredEvents[0].resource.fsPath}). Use 'files.watcherExclude' setting to exclude folders with lots of changing files (e.g. compilation output).`);
    } else {
      if (this.throttledFileChangesEmitter.pending > 0) {
        this.trace(`started throttling events due to large amount of file change events at once (pending: ${this.throttledFileChangesEmitter.pending}, most recent change: ${filteredEvents[0].resource.fsPath}). Use 'files.watcherExclude' setting to exclude folders with lots of changing files (e.g. compilation output).`);
      }
    }
  }
  async existsChildStrictCase(path) {
    if (isLinux) {
      return Promises.exists(path);
    }
    try {
      const pathBasename = basename(path);
      const children = await Promises.readdir(dirname(path));
      return children.some((child) => child === pathBasename);
    } catch (error) {
      this.trace(error);
      return false;
    }
  }
  setVerboseLogging(verboseLogging) {
    this.verboseLogging = verboseLogging;
  }
  error(error) {
    if (!this.cts.token.isCancellationRequested) {
      this.onLogMessage?.({ type: "error", message: `[File Watcher (node.js)] ${error}` });
    }
  }
  warn(message) {
    if (!this.cts.token.isCancellationRequested) {
      this.onLogMessage?.({ type: "warn", message: `[File Watcher (node.js)] ${message}` });
    }
  }
  trace(message) {
    if (!this.cts.token.isCancellationRequested && this.verboseLogging) {
      this.onLogMessage?.({ type: "trace", message: `[File Watcher (node.js)] ${message}` });
    }
  }
  traceWithCorrelation(message) {
    if (!this.cts.token.isCancellationRequested && this.verboseLogging) {
      this.trace(`${message}${typeof this.request.correlationId === "number" ? ` <${this.request.correlationId}> ` : ``}`);
    }
  }
  dispose() {
    this.cts.dispose(true);
    super.dispose();
  }
}
async function watchFileContents(path, onData, onReady, token, bufferSize = 512) {
  const handle = await Promises.open(path, "r");
  const buffer = Buffer.allocUnsafe(bufferSize);
  const cts = new CancellationTokenSource(token);
  let error = void 0;
  let isReading = false;
  const request = { path, excludes: [], recursive: false };
  const watcher = new NodeJSFileWatcherLibrary(request, void 0, (changes) => {
    (async () => {
      for (const { type } of changes) {
        if (type === FileChangeType.UPDATED) {
          if (isReading) {
            return;
          }
          isReading = true;
          try {
            while (!cts.token.isCancellationRequested) {
              const { bytesRead } = await Promises.read(handle, buffer, 0, bufferSize, null);
              if (!bytesRead || cts.token.isCancellationRequested) {
                break;
              }
              onData(buffer.slice(0, bytesRead));
            }
          } catch (err) {
            error = new Error(err);
            cts.dispose(true);
          } finally {
            isReading = false;
          }
        }
      }
    })();
  });
  await watcher.ready;
  onReady();
  return new Promise((resolve, reject) => {
    cts.token.onCancellationRequested(async () => {
      watcher.dispose();
      try {
        await Promises.close(handle);
      } catch (err) {
        error = new Error(err);
      }
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}
__name(watchFileContents, "watchFileContents");
export {
  NodeJSFileWatcherLibrary,
  watchFileContents
};
//# sourceMappingURL=nodejsWatcherLib.js.map
