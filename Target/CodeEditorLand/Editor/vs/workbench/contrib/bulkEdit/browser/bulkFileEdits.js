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
import { WorkspaceFileEditOptions } from "../../../../editor/common/languages.js";
import { IFileService, FileSystemProviderCapabilities, IFileContent, IFileStatWithMetadata } from "../../../../platform/files/common/files.js";
import { IProgress } from "../../../../platform/progress/common/progress.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IWorkingCopyFileService, IFileOperationUndoRedoInfo, IMoveOperation, ICopyOperation, IDeleteOperation, ICreateOperation, ICreateFileOperation } from "../../../services/workingCopy/common/workingCopyFileService.js";
import { IWorkspaceUndoRedoElement, UndoRedoElementType, IUndoRedoService, UndoRedoGroup, UndoRedoSource } from "../../../../platform/undoRedo/common/undoRedo.js";
import { URI } from "../../../../base/common/uri.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { VSBuffer } from "../../../../base/common/buffer.js";
import { ResourceFileEdit } from "../../../../editor/browser/services/bulkEditService.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { tail } from "../../../../base/common/arrays.js";
import { ITextFileService } from "../../../services/textfile/common/textfiles.js";
import { Schemas } from "../../../../base/common/network.js";
class Noop {
  static {
    __name(this, "Noop");
  }
  uris = [];
  async perform() {
    return this;
  }
  toString() {
    return "(noop)";
  }
}
class RenameEdit {
  constructor(newUri, oldUri, options) {
    this.newUri = newUri;
    this.oldUri = oldUri;
    this.options = options;
  }
  static {
    __name(this, "RenameEdit");
  }
  type = "rename";
}
let RenameOperation = class {
  constructor(_edits, _undoRedoInfo, _workingCopyFileService, _fileService) {
    this._edits = _edits;
    this._undoRedoInfo = _undoRedoInfo;
    this._workingCopyFileService = _workingCopyFileService;
    this._fileService = _fileService;
  }
  static {
    __name(this, "RenameOperation");
  }
  get uris() {
    return this._edits.flatMap((edit) => [edit.newUri, edit.oldUri]);
  }
  async perform(token) {
    const moves = [];
    const undoes = [];
    for (const edit of this._edits) {
      const skip = edit.options.overwrite === void 0 && edit.options.ignoreIfExists && await this._fileService.exists(edit.newUri);
      if (!skip) {
        moves.push({
          file: { source: edit.oldUri, target: edit.newUri },
          overwrite: edit.options.overwrite
        });
        undoes.push(new RenameEdit(edit.oldUri, edit.newUri, edit.options));
      }
    }
    if (moves.length === 0) {
      return new Noop();
    }
    await this._workingCopyFileService.move(moves, token, this._undoRedoInfo);
    return new RenameOperation(undoes, { isUndoing: true }, this._workingCopyFileService, this._fileService);
  }
  toString() {
    return `(rename ${this._edits.map((edit) => `${edit.oldUri} to ${edit.newUri}`).join(", ")})`;
  }
};
RenameOperation = __decorateClass([
  __decorateParam(2, IWorkingCopyFileService),
  __decorateParam(3, IFileService)
], RenameOperation);
class CopyEdit {
  constructor(newUri, oldUri, options) {
    this.newUri = newUri;
    this.oldUri = oldUri;
    this.options = options;
  }
  static {
    __name(this, "CopyEdit");
  }
  type = "copy";
}
let CopyOperation = class {
  constructor(_edits, _undoRedoInfo, _workingCopyFileService, _fileService, _instaService) {
    this._edits = _edits;
    this._undoRedoInfo = _undoRedoInfo;
    this._workingCopyFileService = _workingCopyFileService;
    this._fileService = _fileService;
    this._instaService = _instaService;
  }
  static {
    __name(this, "CopyOperation");
  }
  get uris() {
    return this._edits.flatMap((edit) => [edit.newUri, edit.oldUri]);
  }
  async perform(token) {
    const copies = [];
    for (const edit of this._edits) {
      const skip = edit.options.overwrite === void 0 && edit.options.ignoreIfExists && await this._fileService.exists(edit.newUri);
      if (!skip) {
        copies.push({ file: { source: edit.oldUri, target: edit.newUri }, overwrite: edit.options.overwrite });
      }
    }
    if (copies.length === 0) {
      return new Noop();
    }
    const stats = await this._workingCopyFileService.copy(copies, token, this._undoRedoInfo);
    const undoes = [];
    for (let i = 0; i < stats.length; i++) {
      const stat = stats[i];
      const edit = this._edits[i];
      undoes.push(new DeleteEdit(stat.resource, { recursive: true, folder: this._edits[i].options.folder || stat.isDirectory, ...edit.options }, false));
    }
    return this._instaService.createInstance(DeleteOperation, undoes, { isUndoing: true });
  }
  toString() {
    return `(copy ${this._edits.map((edit) => `${edit.oldUri} to ${edit.newUri}`).join(", ")})`;
  }
};
CopyOperation = __decorateClass([
  __decorateParam(2, IWorkingCopyFileService),
  __decorateParam(3, IFileService),
  __decorateParam(4, IInstantiationService)
], CopyOperation);
class CreateEdit {
  constructor(newUri, options, contents) {
    this.newUri = newUri;
    this.options = options;
    this.contents = contents;
  }
  static {
    __name(this, "CreateEdit");
  }
  type = "create";
}
let CreateOperation = class {
  constructor(_edits, _undoRedoInfo, _fileService, _workingCopyFileService, _instaService, _textFileService) {
    this._edits = _edits;
    this._undoRedoInfo = _undoRedoInfo;
    this._fileService = _fileService;
    this._workingCopyFileService = _workingCopyFileService;
    this._instaService = _instaService;
    this._textFileService = _textFileService;
  }
  static {
    __name(this, "CreateOperation");
  }
  get uris() {
    return this._edits.map((edit) => edit.newUri);
  }
  async perform(token) {
    const folderCreates = [];
    const fileCreates = [];
    const undoes = [];
    for (const edit of this._edits) {
      if (edit.newUri.scheme === Schemas.untitled) {
        continue;
      }
      if (edit.options.overwrite === void 0 && edit.options.ignoreIfExists && await this._fileService.exists(edit.newUri)) {
        continue;
      }
      if (edit.options.folder) {
        folderCreates.push({ resource: edit.newUri });
      } else {
        const encodedReadable = typeof edit.contents !== "undefined" ? edit.contents : await this._textFileService.getEncodedReadable(edit.newUri);
        fileCreates.push({ resource: edit.newUri, contents: encodedReadable, overwrite: edit.options.overwrite });
      }
      undoes.push(new DeleteEdit(edit.newUri, edit.options, !edit.options.folder && !edit.contents));
    }
    if (folderCreates.length === 0 && fileCreates.length === 0) {
      return new Noop();
    }
    await this._workingCopyFileService.createFolder(folderCreates, token, this._undoRedoInfo);
    await this._workingCopyFileService.create(fileCreates, token, this._undoRedoInfo);
    return this._instaService.createInstance(DeleteOperation, undoes, { isUndoing: true });
  }
  toString() {
    return `(create ${this._edits.map((edit) => edit.options.folder ? `folder ${edit.newUri}` : `file ${edit.newUri} with ${edit.contents?.byteLength || 0} bytes`).join(", ")})`;
  }
};
CreateOperation = __decorateClass([
  __decorateParam(2, IFileService),
  __decorateParam(3, IWorkingCopyFileService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, ITextFileService)
], CreateOperation);
class DeleteEdit {
  constructor(oldUri, options, undoesCreate) {
    this.oldUri = oldUri;
    this.options = options;
    this.undoesCreate = undoesCreate;
  }
  static {
    __name(this, "DeleteEdit");
  }
  type = "delete";
}
let DeleteOperation = class {
  constructor(_edits, _undoRedoInfo, _workingCopyFileService, _fileService, _configurationService, _instaService, _logService) {
    this._edits = _edits;
    this._undoRedoInfo = _undoRedoInfo;
    this._workingCopyFileService = _workingCopyFileService;
    this._fileService = _fileService;
    this._configurationService = _configurationService;
    this._instaService = _instaService;
    this._logService = _logService;
  }
  static {
    __name(this, "DeleteOperation");
  }
  get uris() {
    return this._edits.map((edit) => edit.oldUri);
  }
  async perform(token) {
    const deletes = [];
    const undoes = [];
    for (const edit of this._edits) {
      let fileStat;
      try {
        fileStat = await this._fileService.resolve(edit.oldUri, { resolveMetadata: true });
      } catch (err) {
        if (!edit.options.ignoreIfNotExists) {
          throw new Error(`${edit.oldUri} does not exist and can not be deleted`);
        }
        continue;
      }
      deletes.push({
        resource: edit.oldUri,
        recursive: edit.options.recursive,
        useTrash: !edit.options.skipTrashBin && this._fileService.hasCapability(edit.oldUri, FileSystemProviderCapabilities.Trash) && this._configurationService.getValue("files.enableTrash")
      });
      let fileContent;
      if (!edit.undoesCreate && !edit.options.folder && !(typeof edit.options.maxSize === "number" && fileStat.size > edit.options.maxSize)) {
        try {
          fileContent = await this._fileService.readFile(edit.oldUri);
        } catch (err) {
          this._logService.error(err);
        }
      }
      if (fileContent !== void 0) {
        undoes.push(new CreateEdit(edit.oldUri, edit.options, fileContent.value));
      }
    }
    if (deletes.length === 0) {
      return new Noop();
    }
    await this._workingCopyFileService.delete(deletes, token, this._undoRedoInfo);
    if (undoes.length === 0) {
      return new Noop();
    }
    return this._instaService.createInstance(CreateOperation, undoes, { isUndoing: true });
  }
  toString() {
    return `(delete ${this._edits.map((edit) => edit.oldUri).join(", ")})`;
  }
};
DeleteOperation = __decorateClass([
  __decorateParam(2, IWorkingCopyFileService),
  __decorateParam(3, IFileService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, IInstantiationService),
  __decorateParam(6, ILogService)
], DeleteOperation);
class FileUndoRedoElement {
  constructor(label, code, operations, confirmBeforeUndo) {
    this.label = label;
    this.code = code;
    this.operations = operations;
    this.confirmBeforeUndo = confirmBeforeUndo;
    this.resources = operations.flatMap((op) => op.uris);
  }
  static {
    __name(this, "FileUndoRedoElement");
  }
  type = UndoRedoElementType.Workspace;
  resources;
  async undo() {
    await this._reverse();
  }
  async redo() {
    await this._reverse();
  }
  async _reverse() {
    for (let i = 0; i < this.operations.length; i++) {
      const op = this.operations[i];
      const undo = await op.perform(CancellationToken.None);
      this.operations[i] = undo;
    }
  }
  toString() {
    return this.operations.map((op) => String(op)).join(", ");
  }
}
let BulkFileEdits = class {
  constructor(_label, _code, _undoRedoGroup, _undoRedoSource, _confirmBeforeUndo, _progress, _token, _edits, _instaService, _undoRedoService) {
    this._label = _label;
    this._code = _code;
    this._undoRedoGroup = _undoRedoGroup;
    this._undoRedoSource = _undoRedoSource;
    this._confirmBeforeUndo = _confirmBeforeUndo;
    this._progress = _progress;
    this._token = _token;
    this._edits = _edits;
    this._instaService = _instaService;
    this._undoRedoService = _undoRedoService;
  }
  static {
    __name(this, "BulkFileEdits");
  }
  async apply() {
    const undoOperations = [];
    const undoRedoInfo = { undoRedoGroupId: this._undoRedoGroup.id };
    const edits = [];
    for (const edit of this._edits) {
      if (edit.newResource && edit.oldResource && !edit.options?.copy) {
        edits.push(new RenameEdit(edit.newResource, edit.oldResource, edit.options ?? {}));
      } else if (edit.newResource && edit.oldResource && edit.options?.copy) {
        edits.push(new CopyEdit(edit.newResource, edit.oldResource, edit.options ?? {}));
      } else if (!edit.newResource && edit.oldResource) {
        edits.push(new DeleteEdit(edit.oldResource, edit.options ?? {}, false));
      } else if (edit.newResource && !edit.oldResource) {
        edits.push(new CreateEdit(edit.newResource, edit.options ?? {}, await edit.options.contents));
      }
    }
    if (edits.length === 0) {
      return [];
    }
    const groups = [];
    groups[0] = [edits[0]];
    for (let i = 1; i < edits.length; i++) {
      const edit = edits[i];
      const lastGroup = tail(groups);
      if (lastGroup?.[0].type === edit.type) {
        lastGroup.push(edit);
      } else {
        groups.push([edit]);
      }
    }
    for (const group of groups) {
      if (this._token.isCancellationRequested) {
        break;
      }
      let op;
      switch (group[0].type) {
        case "rename":
          op = this._instaService.createInstance(RenameOperation, group, undoRedoInfo);
          break;
        case "copy":
          op = this._instaService.createInstance(CopyOperation, group, undoRedoInfo);
          break;
        case "delete":
          op = this._instaService.createInstance(DeleteOperation, group, undoRedoInfo);
          break;
        case "create":
          op = this._instaService.createInstance(CreateOperation, group, undoRedoInfo);
          break;
      }
      if (op) {
        const undoOp = await op.perform(this._token);
        undoOperations.push(undoOp);
      }
      this._progress.report(void 0);
    }
    const undoRedoElement = new FileUndoRedoElement(this._label, this._code, undoOperations, this._confirmBeforeUndo);
    this._undoRedoService.pushElement(undoRedoElement, this._undoRedoGroup, this._undoRedoSource);
    return undoRedoElement.resources;
  }
};
BulkFileEdits = __decorateClass([
  __decorateParam(8, IInstantiationService),
  __decorateParam(9, IUndoRedoService)
], BulkFileEdits);
export {
  BulkFileEdits
};
//# sourceMappingURL=bulkFileEdits.js.map
