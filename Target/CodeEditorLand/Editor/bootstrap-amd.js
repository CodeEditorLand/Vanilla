var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as fs from "fs";
import { createRequire, register } from "node:module";
import * as path from "path";
import { fileURLToPath } from "url";
import { pkg, product } from "./bootstrap-meta.js";
import "./bootstrap-node.js";
import * as performance from "./vs/base/common/performance.js";
const require2 = createRequire(import.meta.url);
const module = { exports: {} };
const __dirname = path.dirname(fileURLToPath(import.meta.url));
if (process.env["ELECTRON_RUN_AS_NODE"] || process.versions["electron"]) {
  const jsCode = `
	export async function resolve(specifier, context, nextResolve) {
		if (specifier === 'fs') {
			return {
				format: 'builtin',
				shortCircuit: true,
				url: 'node:original-fs'
			};
		}

		// Defer to the next hook in the chain, which would be the
		// Node.js default resolve if this is the last user-specified loader.
		return nextResolve(specifier, context);
	}`;
  register(
    `data:text/javascript;base64,${Buffer.from(jsCode).toString("base64")}`,
    import.meta.url
  );
}
globalThis._VSCODE_PRODUCT_JSON = { ...product };
if (process.env["VSCODE_DEV"]) {
  try {
    const overrides = require2("../product.overrides.json");
    globalThis._VSCODE_PRODUCT_JSON = Object.assign(
      globalThis._VSCODE_PRODUCT_JSON,
      overrides
    );
  } catch (error) {
  }
}
globalThis._VSCODE_PACKAGE_JSON = { ...pkg };
globalThis._VSCODE_FILE_ROOT = __dirname;
let setupNLSResult;
function setupNLS() {
  if (!setupNLSResult) {
    setupNLSResult = doSetupNLS();
  }
  return setupNLSResult;
}
__name(setupNLS, "setupNLS");
async function doSetupNLS() {
  performance.mark("code/amd/willLoadNls");
  let nlsConfig;
  let messagesFile;
  if (process.env["VSCODE_NLS_CONFIG"]) {
    try {
      nlsConfig = JSON.parse(process.env["VSCODE_NLS_CONFIG"]);
      if (nlsConfig?.languagePack?.messagesFile) {
        messagesFile = nlsConfig.languagePack.messagesFile;
      } else if (nlsConfig?.defaultMessagesFile) {
        messagesFile = nlsConfig.defaultMessagesFile;
      }
      globalThis._VSCODE_NLS_LANGUAGE = nlsConfig?.resolvedLanguage;
    } catch (e) {
      console.error(
        `Error reading VSCODE_NLS_CONFIG from environment: ${e}`
      );
    }
  }
  if (process.env["VSCODE_DEV"] || // no NLS support in dev mode
  !messagesFile) {
    return void 0;
  }
  try {
    globalThis._VSCODE_NLS_MESSAGES = JSON.parse(
      (await fs.promises.readFile(messagesFile)).toString()
    );
  } catch (error) {
    console.error(
      `Error reading NLS messages file ${messagesFile}: ${error}`
    );
    if (nlsConfig?.languagePack?.corruptMarkerFile) {
      try {
        await fs.promises.writeFile(
          nlsConfig.languagePack.corruptMarkerFile,
          "corrupted"
        );
      } catch (error2) {
        console.error(
          `Error writing corrupted NLS marker file: ${error2}`
        );
      }
    }
    if (nlsConfig?.defaultMessagesFile && nlsConfig.defaultMessagesFile !== messagesFile) {
      try {
        globalThis._VSCODE_NLS_MESSAGES = JSON.parse(
          (await fs.promises.readFile(
            nlsConfig.defaultMessagesFile
          )).toString()
        );
      } catch (error2) {
        console.error(
          `Error reading default NLS messages file ${nlsConfig.defaultMessagesFile}: ${error2}`
        );
      }
    }
  }
  performance.mark("code/amd/didLoadNls");
  return nlsConfig;
}
__name(doSetupNLS, "doSetupNLS");
module.exports.load = (entrypoint, onLoad, onError) => {
  if (!entrypoint) {
    return;
  }
  entrypoint = `./${entrypoint}.js`;
  onLoad = onLoad || (() => {
  });
  onError = onError || ((err) => {
    console.error(err);
  });
  setupNLS().then(() => {
    performance.mark(`code/fork/willLoadCode`);
    import(entrypoint).then(onLoad, onError);
  });
};
const load = module.exports.load;
export {
  load
};
//# sourceMappingURL=bootstrap-amd.js.map
