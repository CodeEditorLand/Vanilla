import { Mimes, getMediaMime } from "../../../base/common/mime.js";
import { extname } from "../../../base/common/path.js";
const webviewMimeTypes = /* @__PURE__ */ new Map([
  [".svg", "image/svg+xml"],
  [".txt", Mimes.text],
  [".css", "text/css"],
  [".js", "application/javascript"],
  [".cjs", "application/javascript"],
  [".mjs", "application/javascript"],
  [".json", "application/json"],
  [".html", "text/html"],
  [".htm", "text/html"],
  [".xhtml", "application/xhtml+xml"],
  [".oft", "font/otf"],
  [".xml", "application/xml"],
  [".wasm", "application/wasm"]
]);
function getWebviewContentMimeType(resource) {
  const ext = extname(resource.fsPath).toLowerCase();
  return webviewMimeTypes.get(ext) || getMediaMime(resource.fsPath) || Mimes.unknown;
}
export {
  getWebviewContentMimeType
};
