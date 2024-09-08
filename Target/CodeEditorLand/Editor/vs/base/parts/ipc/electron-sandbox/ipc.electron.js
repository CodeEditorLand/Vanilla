import { VSBuffer } from "../../../common/buffer.js";
import { Event } from "../../../common/event.js";
import { ipcRenderer } from "../../sandbox/electron-sandbox/globals.js";
import { Protocol as ElectronProtocol } from "../common/ipc.electron.js";
import { IPCClient } from "../common/ipc.js";
class Client extends IPCClient {
  protocol;
  static createProtocol() {
    const onMessage = Event.fromNodeEventEmitter(
      ipcRenderer,
      "vscode:message",
      (_, message) => VSBuffer.wrap(message)
    );
    ipcRenderer.send("vscode:hello");
    return new ElectronProtocol(ipcRenderer, onMessage);
  }
  constructor(id) {
    const protocol = Client.createProtocol();
    super(protocol, id);
    this.protocol = protocol;
  }
  dispose() {
    this.protocol.disconnect();
    super.dispose();
  }
}
export {
  Client
};
