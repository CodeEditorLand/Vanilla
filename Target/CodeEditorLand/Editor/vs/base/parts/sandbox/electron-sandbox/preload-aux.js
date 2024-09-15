var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
(function() {
  "use strict";
  const { ipcRenderer, webFrame, contextBridge } = require("electron");
  function validateIPC(channel) {
    if (!channel || !channel.startsWith("vscode:")) {
      throw new Error(`Unsupported event IPC channel '${channel}'`);
    }
    return true;
  }
  __name(validateIPC, "validateIPC");
  const globals = {
    /**
     * A minimal set of methods exposed from Electron's `ipcRenderer`
     * to support communication to main process.
     *
     * @typedef {Pick<import('./electronTypes.js').IpcRenderer, 'send' | 'invoke'>} IpcRenderer
     *
     * @type {IpcRenderer}
     */
    ipcRenderer: {
      /**
       * @param {string} channel
       * @param {any[]} args
       */
      send(channel, ...args) {
        if (validateIPC(channel)) {
          ipcRenderer.send(channel, ...args);
        }
      },
      /**
       * @param {string} channel
       * @param {any[]} args
       * @returns {Promise<any>}
       */
      invoke(channel, ...args) {
        validateIPC(channel);
        return ipcRenderer.invoke(channel, ...args);
      }
    },
    /**
     * Support for subset of methods of Electron's `webFrame` type.
     *
     * @type {import('./electronTypes.js').WebFrame}
     */
    webFrame: {
      /**
       * @param {number} level
       */
      setZoomLevel(level) {
        if (typeof level === "number") {
          webFrame.setZoomLevel(level);
        }
      }
    }
  };
  try {
    contextBridge.exposeInMainWorld("vscode", globals);
  } catch (error) {
    console.error(error);
  }
})();
//# sourceMappingURL=preload-aux.js.map
