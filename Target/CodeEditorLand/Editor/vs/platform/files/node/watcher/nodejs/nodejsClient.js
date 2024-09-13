var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import {
  AbstractNonRecursiveWatcherClient
} from "../../../common/watcher.js";
import { NodeJSWatcher } from "./nodejsWatcher.js";
class NodeJSWatcherClient extends AbstractNonRecursiveWatcherClient {
  static {
    __name(this, "NodeJSWatcherClient");
  }
  constructor(onFileChanges, onLogMessage, verboseLogging) {
    super(onFileChanges, onLogMessage, verboseLogging);
    this.init();
  }
  createWatcher(disposables) {
    return disposables.add(
      new NodeJSWatcher(
        void 0
      )
    );
  }
}
export {
  NodeJSWatcherClient
};
//# sourceMappingURL=nodejsClient.js.map
