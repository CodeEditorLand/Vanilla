var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { mainWindow } from "../../../browser/window.js";
import { Event } from "../../../common/event.js";
import { generateUuid } from "../../../common/uuid.js";
import { ipcMessagePort, ipcRenderer } from "../../sandbox/electron-sandbox/globals.js";
async function acquirePort(requestChannel, responseChannel, nonce = generateUuid()) {
  ipcMessagePort.acquire(responseChannel, nonce);
  if (typeof requestChannel === "string") {
    ipcRenderer.send(requestChannel, nonce);
  }
  const onMessageChannelResult = Event.fromDOMEventEmitter(mainWindow, "message", (e) => ({ nonce: e.data, port: e.ports[0], source: e.source }));
  const { port } = await Event.toPromise(Event.once(Event.filter(onMessageChannelResult, (e) => e.nonce === nonce && e.source === mainWindow)));
  return port;
}
__name(acquirePort, "acquirePort");
export {
  acquirePort
};
//# sourceMappingURL=ipc.mp.js.map
