var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { groupBy } from "../../../../base/common/arrays.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { compare } from "../../../../base/common/strings.js";
import { isObject } from "../../../../base/common/types.js";
import { URI } from "../../../../base/common/uri.js";
import { ResourceEdit } from "../../../../editor/browser/services/bulkEditService.js";
import { WorkspaceEditMetadata } from "../../../../editor/common/languages.js";
import { IProgress } from "../../../../platform/progress/common/progress.js";
import { UndoRedoGroup, UndoRedoSource } from "../../../../platform/undoRedo/common/undoRedo.js";
import { getNotebookEditorFromEditorPane } from "../../notebook/browser/notebookBrowser.js";
import { CellUri, ICellPartialMetadataEdit, ICellReplaceEdit, IDocumentMetadataEdit, ISelectionState, IWorkspaceNotebookCellEdit, SelectionStateType } from "../../notebook/common/notebookCommon.js";
import { INotebookEditorModelResolverService } from "../../notebook/common/notebookEditorModelResolverService.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
class ResourceNotebookCellEdit extends ResourceEdit {
  constructor(resource, cellEdit, notebookVersionId = void 0, metadata) {
    super(metadata);
    this.resource = resource;
    this.cellEdit = cellEdit;
    this.notebookVersionId = notebookVersionId;
  }
  static {
    __name(this, "ResourceNotebookCellEdit");
  }
  static is(candidate) {
    if (candidate instanceof ResourceNotebookCellEdit) {
      return true;
    }
    return URI.isUri(candidate.resource) && isObject(candidate.cellEdit);
  }
  static lift(edit) {
    if (edit instanceof ResourceNotebookCellEdit) {
      return edit;
    }
    return new ResourceNotebookCellEdit(edit.resource, edit.cellEdit, edit.notebookVersionId, edit.metadata);
  }
}
let BulkCellEdits = class {
  constructor(_undoRedoGroup, undoRedoSource, _progress, _token, _edits, _editorService, _notebookModelService) {
    this._undoRedoGroup = _undoRedoGroup;
    this._progress = _progress;
    this._token = _token;
    this._edits = _edits;
    this._editorService = _editorService;
    this._notebookModelService = _notebookModelService;
    this._edits = this._edits.map((e) => {
      if (e.resource.scheme === CellUri.scheme) {
        const uri = CellUri.parse(e.resource)?.notebook;
        if (!uri) {
          throw new Error(`Invalid notebook URI: ${e.resource}`);
        }
        return new ResourceNotebookCellEdit(uri, e.cellEdit, e.notebookVersionId, e.metadata);
      } else {
        return e;
      }
    });
  }
  static {
    __name(this, "BulkCellEdits");
  }
  async apply() {
    const resources = [];
    const editsByNotebook = groupBy(this._edits, (a, b) => compare(a.resource.toString(), b.resource.toString()));
    for (const group of editsByNotebook) {
      if (this._token.isCancellationRequested) {
        break;
      }
      const [first] = group;
      const ref = await this._notebookModelService.resolve(first.resource);
      if (typeof first.notebookVersionId === "number" && ref.object.notebook.versionId !== first.notebookVersionId) {
        ref.dispose();
        throw new Error(`Notebook '${first.resource}' has changed in the meantime`);
      }
      const edits = group.map((entry) => entry.cellEdit);
      const computeUndo = !ref.object.isReadonly();
      const editor = getNotebookEditorFromEditorPane(this._editorService.activeEditorPane);
      const initialSelectionState = editor?.textModel?.uri.toString() === ref.object.notebook.uri.toString() ? {
        kind: SelectionStateType.Index,
        focus: editor.getFocus(),
        selections: editor.getSelections()
      } : void 0;
      ref.object.notebook.applyEdits(edits, true, initialSelectionState, () => void 0, this._undoRedoGroup, computeUndo);
      ref.dispose();
      this._progress.report(void 0);
      resources.push(first.resource);
    }
    return resources;
  }
};
BulkCellEdits = __decorateClass([
  __decorateParam(5, IEditorService),
  __decorateParam(6, INotebookEditorModelResolverService)
], BulkCellEdits);
export {
  BulkCellEdits,
  ResourceNotebookCellEdit
};
//# sourceMappingURL=bulkCellEdits.js.map
