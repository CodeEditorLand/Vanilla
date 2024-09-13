var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import {
  ProxyChannel,
  getDelayedChannel
} from "../../../../base/parts/ipc/common/ipc.js";
import {
  AbstractUniversalWatcherClient
} from "../../../../platform/files/common/watcher.js";
class UniversalWatcherClient extends AbstractUniversalWatcherClient {
  constructor(onFileChanges, onLogMessage, verboseLogging, utilityProcessWorkerWorkbenchService) {
    super(onFileChanges, onLogMessage, verboseLogging);
    this.utilityProcessWorkerWorkbenchService = utilityProcessWorkerWorkbenchService;
    this.init();
  }
  static {
    __name(this, "UniversalWatcherClient");
  }
  createWatcher(disposables) {
    const watcher = ProxyChannel.toService(
      getDelayedChannel(
        (async () => {
          const { client, onDidTerminate } = disposables.add(
            await this.utilityProcessWorkerWorkbenchService.createWorker(
              {
                moduleId: "vs/platform/files/node/watcher/watcherMain",
                type: "fileWatcher"
              }
            )
          );
          onDidTerminate.then(({ reason }) => {
            if (reason?.code === 0) {
              this.trace(
                `terminated by itself with code ${reason.code}, signal: ${reason.signal}`
              );
            } else {
              this.onError(
                `terminated by itself unexpectedly with code ${reason?.code}, signal: ${reason?.signal} (ETERM)`
              );
            }
          });
          return client.getChannel("watcher");
        })()
      )
    );
    return watcher;
  }
}
export {
  UniversalWatcherClient
};
//# sourceMappingURL=watcherClient.js.map
