var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { getNLSLanguage, getNLSMessages } from "../../nls.js";
import { coalesce } from "../common/arrays.js";
import { onUnexpectedError } from "../common/errors.js";
import { Disposable, toDisposable } from "../common/lifecycle.js";
import { COI, FileAccess } from "../common/network.js";
import {
  SimpleWorkerClient,
  logOnceWebWorkerWarning
} from "../common/worker/simpleWorker.js";
import { createTrustedTypesPolicy } from "./trustedTypes.js";
const isESM = true;
let ttPolicy;
if (typeof self === "object" && self.constructor && self.constructor.name === "DedicatedWorkerGlobalScope" && globalThis.workerttPolicy !== void 0) {
  ttPolicy = globalThis.workerttPolicy;
} else {
  ttPolicy = createTrustedTypesPolicy("defaultWorkerFactory", {
    createScriptURL: /* @__PURE__ */ __name((value) => value, "createScriptURL")
  });
}
function createBlobWorker(blobUrl, options) {
  if (!blobUrl.startsWith("blob:")) {
    throw new URIError("Not a blob-url: " + blobUrl);
  }
  return new Worker(
    ttPolicy ? ttPolicy.createScriptURL(blobUrl) : blobUrl,
    { ...options, type: isESM ? "module" : void 0 }
  );
}
__name(createBlobWorker, "createBlobWorker");
function getWorker(esmWorkerLocation, label) {
  const monacoEnvironment = globalThis.MonacoEnvironment;
  if (monacoEnvironment) {
    if (typeof monacoEnvironment.getWorker === "function") {
      return monacoEnvironment.getWorker("workerMain.js", label);
    }
    if (typeof monacoEnvironment.getWorkerUrl === "function") {
      const workerUrl = monacoEnvironment.getWorkerUrl(
        "workerMain.js",
        label
      );
      return new Worker(
        ttPolicy ? ttPolicy.createScriptURL(workerUrl) : workerUrl,
        { name: label, type: isESM ? "module" : void 0 }
      );
    }
  }
  if (esmWorkerLocation) {
    const workerUrl = getWorkerBootstrapUrl(
      label,
      esmWorkerLocation.toString(true)
    );
    const worker = new Worker(
      ttPolicy ? ttPolicy.createScriptURL(workerUrl) : workerUrl,
      { name: label, type: isESM ? "module" : void 0 }
    );
    if (isESM) {
      return whenESMWorkerReady(worker);
    } else {
      return worker;
    }
  }
  throw new Error(
    `You must define a function MonacoEnvironment.getWorkerUrl or MonacoEnvironment.getWorker`
  );
}
__name(getWorker, "getWorker");
function getWorkerBootstrapUrl(label, workerScriptUrl, workerBaseUrl) {
  if (/^((http:)|(https:)|(file:))/.test(workerScriptUrl) && workerScriptUrl.substring(0, globalThis.origin.length) !== globalThis.origin) {
  } else {
    const start = workerScriptUrl.lastIndexOf("?");
    const end = workerScriptUrl.lastIndexOf("#", start);
    const params = start > 0 ? new URLSearchParams(
      workerScriptUrl.substring(
        start + 1,
        ~end ? end : void 0
      )
    ) : new URLSearchParams();
    COI.addSearchParam(params, true, true);
    const search = params.toString();
    if (search) {
      workerScriptUrl = `${workerScriptUrl}?${params.toString()}#${label}`;
    } else {
      workerScriptUrl = `${workerScriptUrl}#${label}`;
    }
  }
  const blob = new Blob(
    [
      coalesce([
        `/*${label}*/`,
        workerBaseUrl ? `globalThis.MonacoEnvironment = { baseUrl: ${JSON.stringify(workerBaseUrl)} };` : void 0,
        `globalThis._VSCODE_NLS_MESSAGES = ${JSON.stringify(getNLSMessages())};`,
        `globalThis._VSCODE_NLS_LANGUAGE = ${JSON.stringify(getNLSLanguage())};`,
        `globalThis._VSCODE_FILE_ROOT = ${JSON.stringify(globalThis._VSCODE_FILE_ROOT)};`,
        `const ttPolicy = globalThis.trustedTypes?.createPolicy('defaultWorkerFactory', { createScriptURL: value => value });`,
        `globalThis.workerttPolicy = ttPolicy;`,
        isESM ? `await import(ttPolicy?.createScriptURL(${JSON.stringify(workerScriptUrl)}) ?? ${JSON.stringify(workerScriptUrl)});` : `importScripts(ttPolicy?.createScriptURL(${JSON.stringify(workerScriptUrl)}) ?? ${JSON.stringify(workerScriptUrl)});`,
        isESM ? `globalThis.postMessage({ type: 'vscode-worker-ready' });` : void 0,
        // in ESM signal we are ready after the async import
        `/*${label}*/`
      ]).join("")
    ],
    { type: "application/javascript" }
  );
  return URL.createObjectURL(blob);
}
__name(getWorkerBootstrapUrl, "getWorkerBootstrapUrl");
function whenESMWorkerReady(worker) {
  return new Promise((resolve, reject) => {
    worker.onmessage = (e) => {
      if (e.data.type === "vscode-worker-ready") {
        worker.onmessage = null;
        resolve(worker);
      }
    };
    worker.onerror = reject;
  });
}
__name(whenESMWorkerReady, "whenESMWorkerReady");
function isPromiseLike(obj) {
  if (typeof obj.then === "function") {
    return true;
  }
  return false;
}
__name(isPromiseLike, "isPromiseLike");
class WebWorker extends Disposable {
  static {
    __name(this, "WebWorker");
  }
  id;
  label;
  worker;
  constructor(esmWorkerLocation, amdModuleId, id, label, onMessageCallback, onErrorCallback) {
    super();
    this.id = id;
    this.label = label;
    const workerOrPromise = getWorker(esmWorkerLocation, label);
    if (isPromiseLike(workerOrPromise)) {
      this.worker = workerOrPromise;
    } else {
      this.worker = Promise.resolve(workerOrPromise);
    }
    this.postMessage(amdModuleId, []);
    this.worker.then((w) => {
      w.onmessage = (ev) => {
        onMessageCallback(ev.data);
      };
      w.onmessageerror = onErrorCallback;
      if (typeof w.addEventListener === "function") {
        w.addEventListener("error", onErrorCallback);
      }
    });
    this._register(
      toDisposable(() => {
        this.worker?.then((w) => {
          w.onmessage = null;
          w.onmessageerror = null;
          w.removeEventListener("error", onErrorCallback);
          w.terminate();
        });
        this.worker = null;
      })
    );
  }
  getId() {
    return this.id;
  }
  postMessage(message, transfer) {
    this.worker?.then((w) => {
      try {
        w.postMessage(message, transfer);
      } catch (err) {
        onUnexpectedError(err);
        onUnexpectedError(
          new Error(
            `FAILED to post message to '${this.label}'-worker`,
            { cause: err }
          )
        );
      }
    });
  }
}
class WorkerDescriptor {
  constructor(amdModuleId, label) {
    this.amdModuleId = amdModuleId;
    this.label = label;
    this.esmModuleLocation = isESM ? FileAccess.asBrowserUri(
      `${amdModuleId}.esm.js`
    ) : void 0;
  }
  static {
    __name(this, "WorkerDescriptor");
  }
  esmModuleLocation;
}
class DefaultWorkerFactory {
  static {
    __name(this, "DefaultWorkerFactory");
  }
  static LAST_WORKER_ID = 0;
  _webWorkerFailedBeforeError;
  constructor() {
    this._webWorkerFailedBeforeError = false;
  }
  create(desc, onMessageCallback, onErrorCallback) {
    const workerId = ++DefaultWorkerFactory.LAST_WORKER_ID;
    if (this._webWorkerFailedBeforeError) {
      throw this._webWorkerFailedBeforeError;
    }
    return new WebWorker(
      desc.esmModuleLocation,
      desc.amdModuleId,
      workerId,
      desc.label || "anonymous" + workerId,
      onMessageCallback,
      (err) => {
        logOnceWebWorkerWarning(err);
        this._webWorkerFailedBeforeError = err;
        onErrorCallback(err);
      }
    );
  }
}
function createWebWorker(arg0, arg1) {
  const workerDescriptor = typeof arg0 === "string" ? new WorkerDescriptor(arg0, arg1) : arg0;
  return new SimpleWorkerClient(
    new DefaultWorkerFactory(),
    workerDescriptor
  );
}
__name(createWebWorker, "createWebWorker");
export {
  WorkerDescriptor,
  createBlobWorker,
  createWebWorker
};
//# sourceMappingURL=defaultWorkerFactory.js.map
