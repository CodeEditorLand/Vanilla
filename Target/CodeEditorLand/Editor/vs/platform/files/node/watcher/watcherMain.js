import { DisposableStore } from "../../../../base/common/lifecycle.js";
import { ProxyChannel } from "../../../../base/parts/ipc/common/ipc.js";
import { Server as ChildProcessServer } from "../../../../base/parts/ipc/node/ipc.cp.js";
import { Server as UtilityProcessServer } from "../../../../base/parts/ipc/node/ipc.mp.js";
import { isUtilityProcess } from "../../../../base/parts/sandbox/node/electronTypes.js";
import { UniversalWatcher } from "./watcher.js";
let server;
if (isUtilityProcess(process)) {
  server = new UtilityProcessServer();
} else {
  server = new ChildProcessServer("watcher");
}
const service = new UniversalWatcher();
server.registerChannel("watcher", ProxyChannel.fromService(service, new DisposableStore()));
//# sourceMappingURL=watcherMain.js.map
