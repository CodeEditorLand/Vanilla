import { Disposable } from "../common/lifecycle.js";
import { Mimes } from "../common/mime.js";
import { addDisposableListener, getWindow } from "./dom.js";
class DelayedDragHandler extends Disposable {
  timeout;
  constructor(container, callback) {
    super();
    this._register(
      addDisposableListener(container, "dragover", (e) => {
        e.preventDefault();
        if (!this.timeout) {
          this.timeout = setTimeout(() => {
            callback();
            this.timeout = null;
          }, 800);
        }
      })
    );
    ["dragleave", "drop", "dragend"].forEach((type) => {
      this._register(
        addDisposableListener(container, type, () => {
          this.clearDragTimeout();
        })
      );
    });
  }
  clearDragTimeout() {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  }
  dispose() {
    super.dispose();
    this.clearDragTimeout();
  }
}
const DataTransfers = {
  /**
   * Application specific resource transfer type
   */
  RESOURCES: "ResourceURLs",
  /**
   * Browser specific transfer type to download
   */
  DOWNLOAD_URL: "DownloadURL",
  /**
   * Browser specific transfer type for files
   */
  FILES: "Files",
  /**
   * Typically transfer type for copy/paste transfers.
   */
  TEXT: Mimes.text,
  /**
   * Internal type used to pass around text/uri-list data.
   *
   * This is needed to work around https://bugs.chromium.org/p/chromium/issues/detail?id=239745.
   */
  INTERNAL_URI_LIST: "application/vnd.code.uri-list"
};
function applyDragImage(event, label, clazz, backgroundColor, foregroundColor) {
  const dragImage = document.createElement("div");
  dragImage.className = clazz;
  dragImage.textContent = label;
  if (foregroundColor) {
    dragImage.style.color = foregroundColor;
  }
  if (backgroundColor) {
    dragImage.style.background = backgroundColor;
  }
  if (event.dataTransfer) {
    const ownerDocument = getWindow(event).document;
    ownerDocument.body.appendChild(dragImage);
    event.dataTransfer.setDragImage(dragImage, -10, -10);
    setTimeout(() => dragImage.remove(), 0);
  }
}
export {
  DataTransfers,
  DelayedDragHandler,
  applyDragImage
};
