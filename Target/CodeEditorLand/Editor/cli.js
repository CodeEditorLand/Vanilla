var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import "./bootstrap-cli.js";
import * as path from "path";
import { fileURLToPath } from "url";
import * as bootstrapNode from "./bootstrap-node.js";
import * as bootstrapAmd from "./bootstrap-amd.js";
import { resolveNLSConfiguration } from "./vs/base/node/nls.js";
import { product } from "./bootstrap-meta.js";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
async function start() {
  const nlsConfiguration = await resolveNLSConfiguration({ userLocale: "en", osLocale: "en", commit: product.commit, userDataPath: "", nlsMetadataPath: __dirname });
  process.env["VSCODE_NLS_CONFIG"] = JSON.stringify(nlsConfiguration);
  bootstrapNode.configurePortable(product);
  bootstrapNode.enableASARSupport();
  process.env["VSCODE_CLI"] = "1";
  bootstrapAmd.load("vs/code/node/cli");
}
__name(start, "start");
start();
//# sourceMappingURL=cli.js.map
