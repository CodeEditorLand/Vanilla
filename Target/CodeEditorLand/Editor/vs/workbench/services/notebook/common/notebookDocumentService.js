var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { VSBuffer, decodeBase64, encodeBase64 } from "../../../../base/common/buffer.js";
import { ResourceMap } from "../../../../base/common/map.js";
import { Schemas } from "../../../../base/common/network.js";
import { URI } from "../../../../base/common/uri.js";
import { InstantiationType, registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
const INotebookDocumentService = createDecorator("notebookDocumentService");
const _lengths = ["W", "X", "Y", "Z", "a", "b", "c", "d", "e", "f"];
const _padRegexp = new RegExp(`^[${_lengths.join("")}]+`);
const _radix = 7;
function parse(cell) {
  if (cell.scheme !== Schemas.vscodeNotebookCell) {
    return void 0;
  }
  const idx = cell.fragment.indexOf("s");
  if (idx < 0) {
    return void 0;
  }
  const handle = parseInt(cell.fragment.substring(0, idx).replace(_padRegexp, ""), _radix);
  const _scheme = decodeBase64(cell.fragment.substring(idx + 1)).toString();
  if (isNaN(handle)) {
    return void 0;
  }
  return {
    handle,
    notebook: cell.with({ scheme: _scheme, fragment: null })
  };
}
__name(parse, "parse");
function generate(notebook, handle) {
  const s = handle.toString(_radix);
  const p = s.length < _lengths.length ? _lengths[s.length - 1] : "z";
  const fragment = `${p}${s}s${encodeBase64(VSBuffer.fromString(notebook.scheme), true, true)}`;
  return notebook.with({ scheme: Schemas.vscodeNotebookCell, fragment });
}
__name(generate, "generate");
function parseMetadataUri(metadata) {
  if (metadata.scheme !== Schemas.vscodeNotebookMetadata) {
    return void 0;
  }
  const _scheme = decodeBase64(metadata.fragment).toString();
  return metadata.with({ scheme: _scheme, fragment: null });
}
__name(parseMetadataUri, "parseMetadataUri");
function generateMetadataUri(notebook) {
  const fragment = `${encodeBase64(VSBuffer.fromString(notebook.scheme), true, true)}`;
  return notebook.with({ scheme: Schemas.vscodeNotebookMetadata, fragment });
}
__name(generateMetadataUri, "generateMetadataUri");
class NotebookDocumentWorkbenchService {
  static {
    __name(this, "NotebookDocumentWorkbenchService");
  }
  _documents = new ResourceMap();
  getNotebook(uri) {
    if (uri.scheme === Schemas.vscodeNotebookCell) {
      const cellUri = parse(uri);
      if (cellUri) {
        const document = this._documents.get(cellUri.notebook);
        if (document) {
          return document;
        }
      }
    }
    return this._documents.get(uri);
  }
  addNotebookDocument(document) {
    this._documents.set(document.uri, document);
  }
  removeNotebookDocument(document) {
    this._documents.delete(document.uri);
  }
}
registerSingleton(INotebookDocumentService, NotebookDocumentWorkbenchService, InstantiationType.Delayed);
export {
  INotebookDocumentService,
  NotebookDocumentWorkbenchService,
  generate,
  generateMetadataUri,
  parse,
  parseMetadataUri
};
//# sourceMappingURL=notebookDocumentService.js.map
