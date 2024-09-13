var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { unwatchFile, watchFile } from "fs";
import {
  DeferredPromise,
  ThrottledDelayer
} from "../../../../base/common/async.js";
import { Emitter } from "../../../../base/common/event.js";
import {
  Disposable,
  DisposableMap,
  DisposableStore,
  toDisposable
} from "../../../../base/common/lifecycle.js";
import { URI } from "../../../../base/common/uri.js";
import { FileChangeType } from "../../common/files.js";
import {
  isWatchRequestWithCorrelation,
  requestFilterToString
} from "../../common/watcher.js";
class BaseWatcher extends Disposable {
  static {
    __name(this, "BaseWatcher");
  }
  _onDidChangeFile = this._register(
    new Emitter()
  );
  onDidChangeFile = this._onDidChangeFile.event;
  _onDidLogMessage = this._register(
    new Emitter()
  );
  onDidLogMessage = this._onDidLogMessage.event;
  _onDidWatchFail = this._register(
    new Emitter()
  );
  onDidWatchFail = this._onDidWatchFail.event;
  allNonCorrelatedWatchRequests = /* @__PURE__ */ new Set();
  allCorrelatedWatchRequests = /* @__PURE__ */ new Map();
  suspendedWatchRequests = this._register(
    new DisposableMap()
  );
  suspendedWatchRequestsWithPolling = /* @__PURE__ */ new Set();
  updateWatchersDelayer = this._register(
    new ThrottledDelayer(this.getUpdateWatchersDelay())
  );
  suspendedWatchRequestPollingInterval = 5007;
  // node.js default
  joinWatch = new DeferredPromise();
  constructor() {
    super();
    this._register(
      this.onDidWatchFail((request) => this.handleDidWatchFail(request))
    );
  }
  handleDidWatchFail(request) {
    if (!this.isCorrelated(request)) {
      return;
    }
    this.suspendWatchRequest(request);
  }
  isCorrelated(request) {
    return isWatchRequestWithCorrelation(request);
  }
  async watch(requests) {
    if (!this.joinWatch.isSettled) {
      this.joinWatch.complete();
    }
    this.joinWatch = new DeferredPromise();
    try {
      this.allCorrelatedWatchRequests.clear();
      this.allNonCorrelatedWatchRequests.clear();
      for (const request of requests) {
        if (this.isCorrelated(request)) {
          this.allCorrelatedWatchRequests.set(
            request.correlationId,
            request
          );
        } else {
          this.allNonCorrelatedWatchRequests.add(request);
        }
      }
      for (const [correlationId] of this.suspendedWatchRequests) {
        if (!this.allCorrelatedWatchRequests.has(correlationId)) {
          this.suspendedWatchRequests.deleteAndDispose(correlationId);
          this.suspendedWatchRequestsWithPolling.delete(
            correlationId
          );
        }
      }
      return await this.updateWatchers(
        false
        /* not delayed */
      );
    } finally {
      this.joinWatch.complete();
    }
  }
  updateWatchers(delayed) {
    return this.updateWatchersDelayer.trigger(
      () => this.doWatch([
        ...this.allNonCorrelatedWatchRequests,
        ...Array.from(
          this.allCorrelatedWatchRequests.values()
        ).filter(
          (request) => !this.suspendedWatchRequests.has(
            request.correlationId
          )
        )
      ]),
      delayed ? this.getUpdateWatchersDelay() : 0
    );
  }
  getUpdateWatchersDelay() {
    return 800;
  }
  isSuspended(request) {
    if (typeof request.correlationId !== "number") {
      return false;
    }
    return this.suspendedWatchRequestsWithPolling.has(request.correlationId) ? "polling" : this.suspendedWatchRequests.has(request.correlationId);
  }
  async suspendWatchRequest(request) {
    if (this.suspendedWatchRequests.has(request.correlationId)) {
      return;
    }
    const disposables = new DisposableStore();
    this.suspendedWatchRequests.set(request.correlationId, disposables);
    await this.joinWatch.p;
    if (disposables.isDisposed) {
      return;
    }
    this.monitorSuspendedWatchRequest(request, disposables);
    this.updateWatchers(
      true
    );
  }
  resumeWatchRequest(request) {
    this.suspendedWatchRequests.deleteAndDispose(request.correlationId);
    this.suspendedWatchRequestsWithPolling.delete(request.correlationId);
    this.updateWatchers(false);
  }
  monitorSuspendedWatchRequest(request, disposables) {
    if (this.doMonitorWithExistingWatcher(request, disposables)) {
      this.trace(
        `reusing an existing recursive watcher to monitor ${request.path}`
      );
      this.suspendedWatchRequestsWithPolling.delete(
        request.correlationId
      );
    } else {
      this.doMonitorWithNodeJS(request, disposables);
      this.suspendedWatchRequestsWithPolling.add(request.correlationId);
    }
  }
  doMonitorWithExistingWatcher(request, disposables) {
    const subscription = this.recursiveWatcher?.subscribe(
      request.path,
      (error, change) => {
        if (disposables.isDisposed) {
          return;
        }
        if (error) {
          this.monitorSuspendedWatchRequest(request, disposables);
        } else if (change?.type === FileChangeType.ADDED) {
          this.onMonitoredPathAdded(request);
        }
      }
    );
    if (subscription) {
      disposables.add(subscription);
      return true;
    }
    return false;
  }
  doMonitorWithNodeJS(request, disposables) {
    let pathNotFound = false;
    const watchFileCallback = /* @__PURE__ */ __name((curr, prev) => {
      if (disposables.isDisposed) {
        return;
      }
      const currentPathNotFound = this.isPathNotFound(curr);
      const previousPathNotFound = this.isPathNotFound(prev);
      const oldPathNotFound = pathNotFound;
      pathNotFound = currentPathNotFound;
      if (!currentPathNotFound && (previousPathNotFound || oldPathNotFound)) {
        this.onMonitoredPathAdded(request);
      }
    }, "watchFileCallback");
    this.trace(
      `starting fs.watchFile() on ${request.path} (correlationId: ${request.correlationId})`
    );
    try {
      watchFile(
        request.path,
        {
          persistent: false,
          interval: this.suspendedWatchRequestPollingInterval
        },
        watchFileCallback
      );
    } catch (error) {
      this.warn(
        `fs.watchFile() failed with error ${error} on path ${request.path} (correlationId: ${request.correlationId})`
      );
    }
    disposables.add(
      toDisposable(() => {
        this.trace(
          `stopping fs.watchFile() on ${request.path} (correlationId: ${request.correlationId})`
        );
        try {
          unwatchFile(request.path, watchFileCallback);
        } catch (error) {
          this.warn(
            `fs.unwatchFile() failed with error ${error} on path ${request.path} (correlationId: ${request.correlationId})`
          );
        }
      })
    );
  }
  onMonitoredPathAdded(request) {
    this.trace(
      `detected ${request.path} exists again, resuming watcher (correlationId: ${request.correlationId})`
    );
    const event = {
      resource: URI.file(request.path),
      type: FileChangeType.ADDED,
      cId: request.correlationId
    };
    this._onDidChangeFile.fire([event]);
    this.traceEvent(event, request);
    this.resumeWatchRequest(request);
  }
  isPathNotFound(stats) {
    return stats.ctimeMs === 0 && stats.ino === 0;
  }
  async stop() {
    this.suspendedWatchRequests.clearAndDisposeAll();
    this.suspendedWatchRequestsWithPolling.clear();
  }
  traceEvent(event, request) {
    if (this.verboseLogging) {
      const traceMsg = ` >> normalized ${event.type === FileChangeType.ADDED ? "[ADDED]" : event.type === FileChangeType.DELETED ? "[DELETED]" : "[CHANGED]"} ${event.resource.fsPath}`;
      this.traceWithCorrelation(traceMsg, request);
    }
  }
  traceWithCorrelation(message, request) {
    if (this.verboseLogging) {
      this.trace(
        `${message}${typeof request.correlationId === "number" ? ` <${request.correlationId}> ` : ``}`
      );
    }
  }
  requestToString(request) {
    return `${request.path} (excludes: ${request.excludes.length > 0 ? request.excludes : "<none>"}, includes: ${request.includes && request.includes.length > 0 ? JSON.stringify(request.includes) : "<all>"}, filter: ${requestFilterToString(request.filter)}, correlationId: ${typeof request.correlationId === "number" ? request.correlationId : "<none>"})`;
  }
  verboseLogging = false;
  async setVerboseLogging(enabled) {
    this.verboseLogging = enabled;
  }
}
export {
  BaseWatcher
};
//# sourceMappingURL=baseWatcher.js.map
