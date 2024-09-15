var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { DataTransfers } from "../../base/browser/dnd.js";
import { createFileDataTransferItem, createStringDataTransferItem, IDataTransferItem, UriList, VSDataTransfer } from "../../base/common/dataTransfer.js";
import { Mimes } from "../../base/common/mime.js";
import { URI } from "../../base/common/uri.js";
import { CodeDataTransfers, FileAdditionalNativeProperties } from "../../platform/dnd/browser/dnd.js";
function toVSDataTransfer(dataTransfer) {
  const vsDataTransfer = new VSDataTransfer();
  for (const item of dataTransfer.items) {
    const type = item.type;
    if (item.kind === "string") {
      const asStringValue = new Promise((resolve) => item.getAsString(resolve));
      vsDataTransfer.append(type, createStringDataTransferItem(asStringValue));
    } else if (item.kind === "file") {
      const file = item.getAsFile();
      if (file) {
        vsDataTransfer.append(type, createFileDataTransferItemFromFile(file));
      }
    }
  }
  return vsDataTransfer;
}
__name(toVSDataTransfer, "toVSDataTransfer");
function createFileDataTransferItemFromFile(file) {
  const uri = file.path ? URI.parse(file.path) : void 0;
  return createFileDataTransferItem(file.name, uri, async () => {
    return new Uint8Array(await file.arrayBuffer());
  });
}
__name(createFileDataTransferItemFromFile, "createFileDataTransferItemFromFile");
const INTERNAL_DND_MIME_TYPES = Object.freeze([
  CodeDataTransfers.EDITORS,
  CodeDataTransfers.FILES,
  DataTransfers.RESOURCES,
  DataTransfers.INTERNAL_URI_LIST
]);
function toExternalVSDataTransfer(sourceDataTransfer, overwriteUriList = false) {
  const vsDataTransfer = toVSDataTransfer(sourceDataTransfer);
  const uriList = vsDataTransfer.get(DataTransfers.INTERNAL_URI_LIST);
  if (uriList) {
    vsDataTransfer.replace(Mimes.uriList, uriList);
  } else {
    if (overwriteUriList || !vsDataTransfer.has(Mimes.uriList)) {
      const editorData = [];
      for (const item of sourceDataTransfer.items) {
        const file = item.getAsFile();
        if (file) {
          const path = file.path;
          try {
            if (path) {
              editorData.push(URI.file(path).toString());
            } else {
              editorData.push(URI.parse(file.name, true).toString());
            }
          } catch {
          }
        }
      }
      if (editorData.length) {
        vsDataTransfer.replace(Mimes.uriList, createStringDataTransferItem(UriList.create(editorData)));
      }
    }
  }
  for (const internal of INTERNAL_DND_MIME_TYPES) {
    vsDataTransfer.delete(internal);
  }
  return vsDataTransfer;
}
__name(toExternalVSDataTransfer, "toExternalVSDataTransfer");
export {
  toExternalVSDataTransfer,
  toVSDataTransfer
};
//# sourceMappingURL=dnd.js.map
