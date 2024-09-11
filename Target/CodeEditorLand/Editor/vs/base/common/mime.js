var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { extname } from "./path.js";
const Mimes = Object.freeze({
  text: "text/plain",
  binary: "application/octet-stream",
  unknown: "application/unknown",
  markdown: "text/markdown",
  latex: "text/latex",
  uriList: "text/uri-list"
});
const mapExtToTextMimes = {
  ".css": "text/css",
  ".csv": "text/csv",
  ".htm": "text/html",
  ".html": "text/html",
  ".ics": "text/calendar",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".txt": "text/plain",
  ".xml": "text/xml"
};
const mapExtToMediaMimes = {
  ".aac": "audio/x-aac",
  ".avi": "video/x-msvideo",
  ".bmp": "image/bmp",
  ".flv": "video/x-flv",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".jpe": "image/jpg",
  ".jpeg": "image/jpg",
  ".jpg": "image/jpg",
  ".m1v": "video/mpeg",
  ".m2a": "audio/mpeg",
  ".m2v": "video/mpeg",
  ".m3a": "audio/mpeg",
  ".mid": "audio/midi",
  ".midi": "audio/midi",
  ".mk3d": "video/x-matroska",
  ".mks": "video/x-matroska",
  ".mkv": "video/x-matroska",
  ".mov": "video/quicktime",
  ".movie": "video/x-sgi-movie",
  ".mp2": "audio/mpeg",
  ".mp2a": "audio/mpeg",
  ".mp3": "audio/mpeg",
  ".mp4": "video/mp4",
  ".mp4a": "audio/mp4",
  ".mp4v": "video/mp4",
  ".mpe": "video/mpeg",
  ".mpeg": "video/mpeg",
  ".mpg": "video/mpeg",
  ".mpg4": "video/mp4",
  ".mpga": "audio/mpeg",
  ".oga": "audio/ogg",
  ".ogg": "audio/ogg",
  ".opus": "audio/opus",
  ".ogv": "video/ogg",
  ".png": "image/png",
  ".psd": "image/vnd.adobe.photoshop",
  ".qt": "video/quicktime",
  ".spx": "audio/ogg",
  ".svg": "image/svg+xml",
  ".tga": "image/x-tga",
  ".tif": "image/tiff",
  ".tiff": "image/tiff",
  ".wav": "audio/x-wav",
  ".webm": "video/webm",
  ".webp": "image/webp",
  ".wma": "audio/x-ms-wma",
  ".wmv": "video/x-ms-wmv",
  ".woff": "application/font-woff"
};
function getMediaOrTextMime(path) {
  const ext = extname(path);
  const textMime = mapExtToTextMimes[ext.toLowerCase()];
  if (textMime !== void 0) {
    return textMime;
  } else {
    return getMediaMime(path);
  }
}
__name(getMediaOrTextMime, "getMediaOrTextMime");
function getMediaMime(path) {
  const ext = extname(path);
  return mapExtToMediaMimes[ext.toLowerCase()];
}
__name(getMediaMime, "getMediaMime");
function getExtensionForMimeType(mimeType) {
  for (const extension in mapExtToMediaMimes) {
    if (mapExtToMediaMimes[extension] === mimeType) {
      return extension;
    }
  }
  return void 0;
}
__name(getExtensionForMimeType, "getExtensionForMimeType");
const _simplePattern = /^(.+)\/(.+?)(;.+)?$/;
function normalizeMimeType(mimeType, strict) {
  const match = _simplePattern.exec(mimeType);
  if (!match) {
    return strict ? void 0 : mimeType;
  }
  return `${match[1].toLowerCase()}/${match[2].toLowerCase()}${match[3] ?? ""}`;
}
__name(normalizeMimeType, "normalizeMimeType");
export {
  Mimes,
  getExtensionForMimeType,
  getMediaMime,
  getMediaOrTextMime,
  normalizeMimeType
};
//# sourceMappingURL=mime.js.map
