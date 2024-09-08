import { insert } from "../../../base/common/arrays.js";
import { ThrottledDelayer } from "../../../base/common/async.js";
import { onUnexpectedError } from "../../../base/common/errors.js";
import { Emitter } from "../../../base/common/event.js";
import { removeTrailingPathSeparator } from "../../../base/common/extpath.js";
import {
  Disposable,
  toDisposable
} from "../../../base/common/lifecycle.js";
import { normalize } from "../../../base/common/path.js";
import { LogLevel } from "../../log/common/log.js";
import {
  isRecursiveWatchRequest,
  reviveFileChanges
} from "./watcher.js";
class AbstractDiskFileSystemProvider extends Disposable {
  constructor(logService, options) {
    super();
    this.logService = logService;
    this.options = options;
  }
  _onDidChangeFile = this._register(
    new Emitter()
  );
  onDidChangeFile = this._onDidChangeFile.event;
  _onDidWatchError = this._register(new Emitter());
  onDidWatchError = this._onDidWatchError.event;
  watch(resource, opts) {
    if (opts.recursive || this.options?.watcher?.forceUniversal) {
      return this.watchUniversal(resource, opts);
    }
    return this.watchNonRecursive(resource, opts);
  }
  //#region File Watching (universal)
  universalWatcher;
  universalWatchRequests = [];
  universalWatchRequestDelayer = this._register(
    new ThrottledDelayer(0)
  );
  watchUniversal(resource, opts) {
    const request = {
      path: this.toWatchPath(resource),
      excludes: opts.excludes,
      includes: opts.includes,
      recursive: opts.recursive,
      filter: opts.filter,
      correlationId: opts.correlationId
    };
    const remove = insert(this.universalWatchRequests, request);
    this.refreshUniversalWatchers();
    return toDisposable(() => {
      remove();
      this.refreshUniversalWatchers();
    });
  }
  refreshUniversalWatchers() {
    this.universalWatchRequestDelayer.trigger(() => {
      return this.doRefreshUniversalWatchers();
    }).catch((error) => onUnexpectedError(error));
  }
  doRefreshUniversalWatchers() {
    if (!this.universalWatcher) {
      this.universalWatcher = this._register(
        this.createUniversalWatcher(
          (changes) => this._onDidChangeFile.fire(reviveFileChanges(changes)),
          (msg) => this.onWatcherLogMessage(msg),
          this.logService.getLevel() === LogLevel.Trace
        )
      );
      this._register(
        this.logService.onDidChangeLogLevel(() => {
          this.universalWatcher?.setVerboseLogging(
            this.logService.getLevel() === LogLevel.Trace
          );
        })
      );
    }
    const usePolling = this.options?.watcher?.recursive?.usePolling;
    if (usePolling === true) {
      for (const request of this.universalWatchRequests) {
        if (isRecursiveWatchRequest(request)) {
          request.pollingInterval = this.options?.watcher?.recursive?.pollingInterval ?? 5e3;
        }
      }
    } else if (Array.isArray(usePolling)) {
      for (const request of this.universalWatchRequests) {
        if (isRecursiveWatchRequest(request)) {
          if (usePolling.includes(request.path)) {
            request.pollingInterval = this.options?.watcher?.recursive?.pollingInterval ?? 5e3;
          }
        }
      }
    }
    return this.universalWatcher.watch(this.universalWatchRequests);
  }
  //#endregion
  //#region File Watching (non-recursive)
  nonRecursiveWatcher;
  nonRecursiveWatchRequests = [];
  nonRecursiveWatchRequestDelayer = this._register(
    new ThrottledDelayer(0)
  );
  watchNonRecursive(resource, opts) {
    const request = {
      path: this.toWatchPath(resource),
      excludes: opts.excludes,
      includes: opts.includes,
      recursive: false,
      filter: opts.filter,
      correlationId: opts.correlationId
    };
    const remove = insert(this.nonRecursiveWatchRequests, request);
    this.refreshNonRecursiveWatchers();
    return toDisposable(() => {
      remove();
      this.refreshNonRecursiveWatchers();
    });
  }
  refreshNonRecursiveWatchers() {
    this.nonRecursiveWatchRequestDelayer.trigger(() => {
      return this.doRefreshNonRecursiveWatchers();
    }).catch((error) => onUnexpectedError(error));
  }
  doRefreshNonRecursiveWatchers() {
    if (!this.nonRecursiveWatcher) {
      this.nonRecursiveWatcher = this._register(
        this.createNonRecursiveWatcher(
          (changes) => this._onDidChangeFile.fire(reviveFileChanges(changes)),
          (msg) => this.onWatcherLogMessage(msg),
          this.logService.getLevel() === LogLevel.Trace
        )
      );
      this._register(
        this.logService.onDidChangeLogLevel(() => {
          this.nonRecursiveWatcher?.setVerboseLogging(
            this.logService.getLevel() === LogLevel.Trace
          );
        })
      );
    }
    return this.nonRecursiveWatcher.watch(this.nonRecursiveWatchRequests);
  }
  //#endregion
  onWatcherLogMessage(msg) {
    if (msg.type === "error") {
      this._onDidWatchError.fire(msg.message);
    }
    this.logWatcherMessage(msg);
  }
  logWatcherMessage(msg) {
    this.logService[msg.type](msg.message);
  }
  toFilePath(resource) {
    return normalize(resource.fsPath);
  }
  toWatchPath(resource) {
    const filePath = this.toFilePath(resource);
    return removeTrailingPathSeparator(filePath);
  }
}
export {
  AbstractDiskFileSystemProvider
};
