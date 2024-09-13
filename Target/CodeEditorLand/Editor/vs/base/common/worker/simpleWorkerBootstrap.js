var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IRequestHandlerFactory, SimpleWorkerServer } from "./simpleWorker.js";
let initialized = false;
function initialize(factory) {
  if (initialized) {
    return;
  }
  initialized = true;
  const simpleWorker = new SimpleWorkerServer(
    (msg) => globalThis.postMessage(msg),
    (workerServer) => factory(workerServer)
  );
  globalThis.onmessage = (e) => {
    simpleWorker.onmessage(e.data);
  };
}
__name(initialize, "initialize");
function bootstrapSimpleWorker(factory) {
  globalThis.onmessage = (_e) => {
    if (!initialized) {
      initialize(factory);
    }
  };
}
__name(bootstrapSimpleWorker, "bootstrapSimpleWorker");
export {
  bootstrapSimpleWorker
};
//# sourceMappingURL=simpleWorkerBootstrap.js.map
