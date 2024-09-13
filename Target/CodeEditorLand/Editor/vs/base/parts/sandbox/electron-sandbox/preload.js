var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
(() => {
  const {
    ipcRenderer,
    webFrame,
    contextBridge,
    webUtils
  } = require("electron");
  function validateIPC(channel) {
    if (!channel || !channel.startsWith("vscode:")) {
      throw new Error(`Unsupported event IPC channel '${channel}'`);
    }
    return true;
  }
  __name(validateIPC, "validateIPC");
  function parseArgv(key) {
    for (const arg of process.argv) {
      if (arg.indexOf(`--${key}=`) === 0) {
        return arg.split("=")[1];
      }
    }
    return void 0;
  }
  __name(parseArgv, "parseArgv");
  let configuration;
  const resolveConfiguration = (async () => {
    const windowConfigIpcChannel = parseArgv("vscode-window-config");
    if (!windowConfigIpcChannel) {
      throw new Error(
        "Preload: did not find expected vscode-window-config in renderer process arguments list."
      );
    }
    try {
      validateIPC(windowConfigIpcChannel);
      const resolvedConfiguration = configuration = await ipcRenderer.invoke(windowConfigIpcChannel);
      Object.assign(process.env, resolvedConfiguration.userEnv);
      webFrame.setZoomLevel(resolvedConfiguration.zoomLevel ?? 0);
      return resolvedConfiguration;
    } catch (error) {
      throw new Error(
        `Preload: unable to fetch vscode-window-config: ${error}`
      );
    }
  })();
  const resolveShellEnv = (async () => {
    const [userEnv, shellEnv] = await Promise.all([
      (async () => (await resolveConfiguration).userEnv)(),
      ipcRenderer.invoke("vscode:fetchShellEnv")
    ]);
    return { ...process.env, ...shellEnv, ...userEnv };
  })();
  const globals = {
    /**
     * A minimal set of methods exposed from Electron's `ipcRenderer`
     * to support communication to main process.
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
      },
      /**
       * @param {string} channel
       * @param {(event: IpcRendererEvent, ...args: any[]) => void} listener
       * @returns {IpcRenderer}
       */
      on(channel, listener) {
        validateIPC(channel);
        ipcRenderer.on(channel, listener);
        return this;
      },
      /**
       * @param {string} channel
       * @param {(event: IpcRendererEvent, ...args: any[]) => void} listener
       * @returns {IpcRenderer}
       */
      once(channel, listener) {
        validateIPC(channel);
        ipcRenderer.once(channel, listener);
        return this;
      },
      /**
       * @param {string} channel
       * @param {(event: IpcRendererEvent, ...args: any[]) => void} listener
       * @returns {IpcRenderer}
       */
      removeListener(channel, listener) {
        validateIPC(channel);
        ipcRenderer.removeListener(channel, listener);
        return this;
      }
    },
    /**
     * @type {import('./globals.js').IpcMessagePort}
     */
    ipcMessagePort: {
      /**
       * @param {string} responseChannel
       * @param {string} nonce
       */
      acquire(responseChannel, nonce) {
        if (validateIPC(responseChannel)) {
          const responseListener = /* @__PURE__ */ __name((e, responseNonce) => {
            if (nonce === responseNonce) {
              ipcRenderer.off(responseChannel, responseListener);
              window.postMessage(nonce, "*", e.ports);
            }
          }, "responseListener");
          ipcRenderer.on(responseChannel, responseListener);
        }
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
    },
    /**
     * Support for subset of Electron's `webUtils` type.
     */
    webUtils: {
      /**
       * @param {File} file
       */
      getPathForFile(file) {
        return webUtils.getPathForFile(file);
      }
    },
    /**
     * Support for a subset of access to node.js global `process`.
     *
     * Note: when `sandbox` is enabled, the only properties available
     * are https://github.com/electron/electron/blob/master/docs/api/process.md#sandbox
     *
     * @type {ISandboxNodeProcess}
     */
    process: {
      get platform() {
        return process.platform;
      },
      get arch() {
        return process.arch;
      },
      get env() {
        return { ...process.env };
      },
      get versions() {
        return process.versions;
      },
      get type() {
        return "renderer";
      },
      get execPath() {
        return process.execPath;
      },
      /**
       * @returns {string}
       */
      cwd() {
        return process.env["VSCODE_CWD"] || process.execPath.substr(
          0,
          process.execPath.lastIndexOf(
            process.platform === "win32" ? "\\" : "/"
          )
        );
      },
      /**
       * @returns {Promise<typeof process.env>}
       */
      shellEnv() {
        return resolveShellEnv;
      },
      /**
       * @returns {Promise<import('electron').ProcessMemoryInfo>}
       */
      getProcessMemoryInfo() {
        return process.getProcessMemoryInfo();
      },
      /**
       * @param {string} type
       * @param {Function} callback
       * @returns {void}
       */
      on(type, callback) {
        process.on(type, callback);
      }
    },
    /**
     * Some information about the context we are running in.
     *
     * @type {import('./globals.js').ISandboxContext}
     */
    context: {
      /**
       * A configuration object made accessible from the main side
       * to configure the sandbox browser window.
       *
       * Note: intentionally not using a getter here because the
       * actual value will be set after `resolveConfiguration`
       * has finished.
       *
       * @returns {ISandboxConfiguration | undefined}
       */
      configuration() {
        return configuration;
      },
      /**
       * Allows to await the resolution of the configuration object.
       *
       * @returns {Promise<ISandboxConfiguration>}
       */
      async resolveConfiguration() {
        return resolveConfiguration;
      }
    }
  };
  if (process.contextIsolated) {
    try {
      contextBridge.exposeInMainWorld("vscode", globals);
    } catch (error) {
      console.error(error);
    }
  } else {
    window.vscode = globals;
  }
})();
//# sourceMappingURL=preload.js.map
