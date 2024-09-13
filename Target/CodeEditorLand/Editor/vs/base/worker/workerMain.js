var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
(() => {
  const monacoEnvironment = globalThis.MonacoEnvironment;
  const monacoBaseUrl = monacoEnvironment && monacoEnvironment.baseUrl ? monacoEnvironment.baseUrl : "../../../";
  function createTrustedTypesPolicy(policyName, policyOptions) {
    if (monacoEnvironment?.createTrustedTypesPolicy) {
      try {
        return monacoEnvironment.createTrustedTypesPolicy(
          policyName,
          policyOptions
        );
      } catch (err) {
        console.warn(err);
        return void 0;
      }
    }
    try {
      return self.trustedTypes?.createPolicy(policyName, policyOptions);
    } catch (err) {
      console.warn(err);
      return void 0;
    }
  }
  __name(createTrustedTypesPolicy, "createTrustedTypesPolicy");
  const trustedTypesPolicy = createTrustedTypesPolicy("amdLoader", {
    createScriptURL: /* @__PURE__ */ __name((value) => value, "createScriptURL"),
    createScript: /* @__PURE__ */ __name((_, ...args) => {
      const fnArgs = args.slice(0, -1).join(",");
      const fnBody = args.pop().toString();
      const body = `(function anonymous(${fnArgs}) { ${fnBody}
})`;
      return body;
    }, "createScript")
  });
  function canUseEval() {
    try {
      const func = trustedTypesPolicy ? globalThis.eval(
        trustedTypesPolicy.createScript("", "true")
      ) : new Function("true");
      func.call(globalThis);
      return true;
    } catch (err) {
      return false;
    }
  }
  __name(canUseEval, "canUseEval");
  function loadAMDLoader() {
    return new Promise((resolve, reject) => {
      if (typeof globalThis.define === "function" && globalThis.define.amd) {
        return resolve();
      }
      const loaderSrc = monacoBaseUrl + "vs/loader.js";
      const isCrossOrigin = /^((http:)|(https:)|(file:))/.test(loaderSrc) && loaderSrc.substring(0, globalThis.origin.length) !== globalThis.origin;
      if (!isCrossOrigin && canUseEval()) {
        fetch(loaderSrc).then((response) => {
          if (response.status !== 200) {
            throw new Error(response.statusText);
          }
          return response.text();
        }).then((text) => {
          text = `${text}
//# sourceURL=${loaderSrc}`;
          const func = trustedTypesPolicy ? globalThis.eval(
            trustedTypesPolicy.createScript(
              "",
              text
            )
          ) : new Function(text);
          func.call(globalThis);
          resolve();
        }).then(void 0, reject);
        return;
      }
      if (trustedTypesPolicy) {
        importScripts(
          trustedTypesPolicy.createScriptURL(
            loaderSrc
          )
        );
      } else {
        importScripts(loaderSrc);
      }
      resolve();
    });
  }
  __name(loadAMDLoader, "loadAMDLoader");
  function loadCode(moduleId) {
    if (typeof loadAMDLoader === "function") {
    }
    const moduleUrl = new URL(
      `${moduleId}.js`,
      globalThis._VSCODE_FILE_ROOT
    );
    return import(moduleUrl.href);
  }
  __name(loadCode, "loadCode");
  function setupWorkerServer(ws) {
    setTimeout(() => {
      const messageHandler = ws.create(
        (msg, transfer) => {
          globalThis.postMessage(msg, transfer);
        }
      );
      self.onmessage = (e) => messageHandler.onmessage(e.data, e.ports);
      while (beforeReadyMessages.length > 0) {
        self.onmessage(beforeReadyMessages.shift());
      }
    }, 0);
  }
  __name(setupWorkerServer, "setupWorkerServer");
  let isFirstMessage = true;
  const beforeReadyMessages = [];
  globalThis.onmessage = (message) => {
    if (!isFirstMessage) {
      beforeReadyMessages.push(message);
      return;
    }
    isFirstMessage = false;
    loadCode(message.data).then(
      (ws) => {
        setupWorkerServer(ws);
      },
      (err) => {
        console.error(err);
      }
    );
  };
})();
//# sourceMappingURL=workerMain.js.map
