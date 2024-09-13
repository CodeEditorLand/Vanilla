var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import {
  SimpleWorkerServer
} from "../../../base/common/worker/simpleWorker.js";
import { EditorSimpleWorker } from "./editorSimpleWorker.js";
import { EditorWorkerHost } from "./editorWorkerHost.js";
let initialized = false;
function initialize(factory) {
  if (initialized) {
    return;
  }
  initialized = true;
  const simpleWorker = new SimpleWorkerServer(
    (msg) => {
      globalThis.postMessage(msg);
    },
    (workerServer) => new EditorSimpleWorker(
      EditorWorkerHost.getChannel(workerServer),
      null
    )
  );
  globalThis.onmessage = (e) => {
    simpleWorker.onmessage(e.data);
  };
}
__name(initialize, "initialize");
globalThis.onmessage = (e) => {
  if (!initialized) {
    initialize(null);
  }
};
function bootstrapSimpleEditorWorker(createFn) {
  globalThis.onmessage = () => {
    initialize((ctx, createData) => {
      return createFn.call(self, ctx, createData);
    });
  };
}
__name(bootstrapSimpleEditorWorker, "bootstrapSimpleEditorWorker");
export {
  bootstrapSimpleEditorWorker,
  initialize
};
//# sourceMappingURL=editorWorkerBootstrap.js.map
