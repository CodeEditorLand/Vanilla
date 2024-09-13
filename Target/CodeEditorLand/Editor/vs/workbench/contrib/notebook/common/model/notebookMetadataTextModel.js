var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { NotebookCellMetadata, NotebookDocumentMetadata, TransientDocumentMetadata } from "../notebookCommon.js";
import { toFormattedString } from "../../../../../base/common/jsonFormatter.js";
function getFormattedNotebookMetadataJSON(transientMetadata, metadata) {
  let filteredMetadata = {};
  if (transientMetadata) {
    const keys = /* @__PURE__ */ new Set([...Object.keys(metadata)]);
    for (const key of keys) {
      if (!transientMetadata[key]) {
        filteredMetadata[key] = metadata[key];
      }
    }
  } else {
    filteredMetadata = metadata;
  }
  const metadataSource = toFormattedString(filteredMetadata, {});
  return metadataSource;
}
__name(getFormattedNotebookMetadataJSON, "getFormattedNotebookMetadataJSON");
export {
  getFormattedNotebookMetadataJSON
};
//# sourceMappingURL=notebookMetadataTextModel.js.map
