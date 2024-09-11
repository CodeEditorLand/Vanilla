var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
(function(factory) {
  globalThis.MonacoBootstrapWindow = factory();
})(function() {
  const preloadGlobals = sandboxGlobals();
  const safeProcess = preloadGlobals.process;
  Error.stackTraceLimit = 100;
  async function load(modulePaths, resultCallback, options) {
    const timeout = setTimeout(() => {
      console.error(`[resolve window config] Could not resolve window configuration within 10 seconds, but will continue to wait...`);
    }, 1e4);
    performance.mark("code/willWaitForWindowConfig");
    const configuration = await preloadGlobals.context.resolveConfiguration();
    performance.mark("code/didWaitForWindowConfig");
    clearTimeout(timeout);
    if (typeof options?.canModifyDOM === "function") {
      options.canModifyDOM(configuration);
    }
    const {
      forceEnableDeveloperKeybindings,
      disallowReloadKeybinding,
      removeDeveloperKeybindingsAfterLoad
    } = typeof options?.configureDeveloperSettings === "function" ? options.configureDeveloperSettings(configuration) : {
      forceEnableDeveloperKeybindings: false,
      disallowReloadKeybinding: false,
      removeDeveloperKeybindingsAfterLoad: false
    };
    const isDev = !!safeProcess.env["VSCODE_DEV"];
    const enableDeveloperKeybindings = isDev || forceEnableDeveloperKeybindings;
    let developerDeveloperKeybindingsDisposable;
    if (enableDeveloperKeybindings) {
      developerDeveloperKeybindingsDisposable = registerDeveloperKeybindings(disallowReloadKeybinding);
    }
    globalThis._VSCODE_NLS_MESSAGES = configuration.nls.messages;
    globalThis._VSCODE_NLS_LANGUAGE = configuration.nls.language;
    let language = configuration.nls.language || "en";
    if (language === "zh-tw") {
      language = "zh-Hant";
    } else if (language === "zh-cn") {
      language = "zh-Hans";
    }
    window.document.documentElement.setAttribute("lang", language);
    window["MonacoEnvironment"] = {};
    if (typeof options?.beforeRequire === "function") {
      options.beforeRequire(configuration);
    }
    const baseUrl = new URL(`${fileUriFromPath(configuration.appRoot, { isWindows: safeProcess.platform === "win32", scheme: "vscode-file", fallbackAuthority: "vscode-app" })}/out/`);
    globalThis._VSCODE_FILE_ROOT = baseUrl.toString();
    if (Array.isArray(configuration.cssModules) && configuration.cssModules.length > 0) {
      performance.mark("code/willAddCssLoader");
      const style = document.createElement("style");
      style.type = "text/css";
      style.media = "screen";
      style.id = "vscode-css-loading";
      document.head.appendChild(style);
      globalThis._VSCODE_CSS_LOAD = function(url) {
        style.textContent += `@import url(${url});
`;
      };
      const importMap = { imports: {} };
      for (const cssModule of configuration.cssModules) {
        const cssUrl = new URL(cssModule, baseUrl).href;
        const jsSrc = `globalThis._VSCODE_CSS_LOAD('${cssUrl}');
`;
        const blob = new Blob([jsSrc], { type: "application/javascript" });
        importMap.imports[cssUrl] = URL.createObjectURL(blob);
      }
      const ttp = window.trustedTypes?.createPolicy("vscode-bootstrapImportMap", { createScript(value) {
        return value;
      } });
      const importMapSrc = JSON.stringify(importMap, void 0, 2);
      const importMapScript = document.createElement("script");
      importMapScript.type = "importmap";
      importMapScript.setAttribute("nonce", "0c6a828f1297");
      importMapScript.textContent = ttp?.createScript(importMapSrc) ?? importMapSrc;
      document.head.appendChild(importMapScript);
      performance.mark("code/didAddCssLoader");
    }
    const result = Promise.all(modulePaths.map((modulePath) => {
      if (modulePath.includes("vs/css!")) {
        const cssModule = modulePath.replace("vs/css!", "");
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = new URL(`${cssModule}.css`, baseUrl).href;
        document.head.appendChild(link);
        return Promise.resolve();
      } else {
        return import(new URL(`${modulePath}.js`, baseUrl).href);
      }
    }));
    result.then((res) => invokeResult(res[0]), onUnexpectedError);
    async function invokeResult(firstModule) {
      try {
        const callbackResult = resultCallback(firstModule, configuration);
        if (callbackResult instanceof Promise) {
          await callbackResult;
          if (developerDeveloperKeybindingsDisposable && removeDeveloperKeybindingsAfterLoad) {
            developerDeveloperKeybindingsDisposable();
          }
        }
      } catch (error) {
        onUnexpectedError(error, enableDeveloperKeybindings);
      }
    }
    __name(invokeResult, "invokeResult");
  }
  __name(load, "load");
  function registerDeveloperKeybindings(disallowReloadKeybinding) {
    const ipcRenderer = preloadGlobals.ipcRenderer;
    const extractKey = (
      /**
       * @param {KeyboardEvent} e
       */
      /* @__PURE__ */ __name(function(e) {
        return [
          e.ctrlKey ? "ctrl-" : "",
          e.metaKey ? "meta-" : "",
          e.altKey ? "alt-" : "",
          e.shiftKey ? "shift-" : "",
          e.keyCode
        ].join("");
      }, "extractKey")
    );
    const TOGGLE_DEV_TOOLS_KB = safeProcess.platform === "darwin" ? "meta-alt-73" : "ctrl-shift-73";
    const TOGGLE_DEV_TOOLS_KB_ALT = "123";
    const RELOAD_KB = safeProcess.platform === "darwin" ? "meta-82" : "ctrl-82";
    let listener = /* @__PURE__ */ __name(function(e) {
      const key = extractKey(e);
      if (key === TOGGLE_DEV_TOOLS_KB || key === TOGGLE_DEV_TOOLS_KB_ALT) {
        ipcRenderer.send("vscode:toggleDevTools");
      } else if (key === RELOAD_KB && !disallowReloadKeybinding) {
        ipcRenderer.send("vscode:reloadWindow");
      }
    }, "listener");
    window.addEventListener("keydown", listener);
    return function() {
      if (listener) {
        window.removeEventListener("keydown", listener);
        listener = void 0;
      }
    };
  }
  __name(registerDeveloperKeybindings, "registerDeveloperKeybindings");
  function onUnexpectedError(error, showDevtoolsOnError) {
    if (showDevtoolsOnError) {
      const ipcRenderer = preloadGlobals.ipcRenderer;
      ipcRenderer.send("vscode:openDevTools");
    }
    console.error(`[uncaught exception]: ${error}`);
    if (error && typeof error !== "string" && error.stack) {
      console.error(error.stack);
    }
  }
  __name(onUnexpectedError, "onUnexpectedError");
  function fileUriFromPath(path, config) {
    let pathName = path.replace(/\\/g, "/");
    if (pathName.length > 0 && pathName.charAt(0) !== "/") {
      pathName = `/${pathName}`;
    }
    let uri;
    if (config.isWindows && pathName.startsWith("//")) {
      uri = encodeURI(`${config.scheme || "file"}:${pathName}`);
    } else {
      uri = encodeURI(`${config.scheme || "file"}://${config.fallbackAuthority || ""}${pathName}`);
    }
    return uri.replace(/#/g, "%23");
  }
  __name(fileUriFromPath, "fileUriFromPath");
  function sandboxGlobals() {
    return window.vscode;
  }
  __name(sandboxGlobals, "sandboxGlobals");
  return {
    load
  };
});
//# sourceMappingURL=bootstrap-window.js.map
