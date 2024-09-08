import { VSBuffer } from "../../../common/buffer.js";
import { Emitter, Event } from "../../../common/event.js";
import { toDisposable } from "../../../common/lifecycle.js";
import { Protocol as ElectronProtocol } from "../common/ipc.electron.js";
import { IPCServer } from "../common/ipc.js";
import { validatedIpcMain } from "./ipcMain.js";
function createScopedOnMessageEvent(senderId, eventName) {
  const onMessage = Event.fromNodeEventEmitter(
    validatedIpcMain,
    eventName,
    (event, message) => ({ event, message })
  );
  const onMessageFromSender = Event.filter(
    onMessage,
    ({ event }) => event.sender.id === senderId
  );
  return Event.map(
    onMessageFromSender,
    ({ message }) => message ? VSBuffer.wrap(message) : message
  );
}
class Server extends IPCServer {
  static Clients = /* @__PURE__ */ new Map();
  static getOnDidClientConnect() {
    const onHello = Event.fromNodeEventEmitter(
      validatedIpcMain,
      "vscode:hello",
      ({ sender }) => sender
    );
    return Event.map(onHello, (webContents) => {
      const id = webContents.id;
      const client = Server.Clients.get(id);
      client?.dispose();
      const onDidClientReconnect = new Emitter();
      Server.Clients.set(
        id,
        toDisposable(() => onDidClientReconnect.fire())
      );
      const onMessage = createScopedOnMessageEvent(
        id,
        "vscode:message"
      );
      const onDidClientDisconnect = Event.any(
        Event.signal(
          createScopedOnMessageEvent(id, "vscode:disconnect")
        ),
        onDidClientReconnect.event
      );
      const protocol = new ElectronProtocol(webContents, onMessage);
      return { protocol, onDidClientDisconnect };
    });
  }
  constructor() {
    super(Server.getOnDidClientConnect());
  }
}
export {
  Server
};
