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
import * as assert from "../../../base/common/assert.js";
import { Emitter } from "../../../base/common/event.js";
import { Iterable } from "../../../base/common/iterator.js";
import { Lazy } from "../../../base/common/lazy.js";
import { dispose } from "../../../base/common/lifecycle.js";
import { ResourceMap } from "../../../base/common/map.js";
import { Schemas } from "../../../base/common/network.js";
import { URI } from "../../../base/common/uri.js";
import { createDecorator } from "../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../platform/log/common/log.js";
import {
  MainContext
} from "./extHost.protocol.js";
import { ExtHostDocumentData } from "./extHostDocumentData.js";
import { IExtHostRpcService } from "./extHostRpcService.js";
import { ExtHostTextEditor } from "./extHostTextEditor.js";
import * as typeConverters from "./extHostTypeConverters.js";
class Reference {
  constructor(value) {
    this.value = value;
  }
  static {
    __name(this, "Reference");
  }
  _count = 0;
  ref() {
    this._count++;
  }
  unref() {
    return --this._count === 0;
  }
}
let ExtHostDocumentsAndEditors = class {
  constructor(_extHostRpc, _logService) {
    this._extHostRpc = _extHostRpc;
    this._logService = _logService;
  }
  static {
    __name(this, "ExtHostDocumentsAndEditors");
  }
  _serviceBrand;
  _activeEditorId = null;
  _editors = /* @__PURE__ */ new Map();
  _documents = new ResourceMap();
  _onDidAddDocuments = new Emitter();
  _onDidRemoveDocuments = new Emitter();
  _onDidChangeVisibleTextEditors = new Emitter();
  _onDidChangeActiveTextEditor = new Emitter();
  onDidAddDocuments = this._onDidAddDocuments.event;
  onDidRemoveDocuments = this._onDidRemoveDocuments.event;
  onDidChangeVisibleTextEditors = this._onDidChangeVisibleTextEditors.event;
  onDidChangeActiveTextEditor = this._onDidChangeActiveTextEditor.event;
  $acceptDocumentsAndEditorsDelta(delta) {
    this.acceptDocumentsAndEditorsDelta(delta);
  }
  acceptDocumentsAndEditorsDelta(delta) {
    const removedDocuments = [];
    const addedDocuments = [];
    const removedEditors = [];
    if (delta.removedDocuments) {
      for (const uriComponent of delta.removedDocuments) {
        const uri = URI.revive(uriComponent);
        const data = this._documents.get(uri);
        if (data?.unref()) {
          this._documents.delete(uri);
          removedDocuments.push(data.value);
        }
      }
    }
    if (delta.addedDocuments) {
      for (const data of delta.addedDocuments) {
        const resource = URI.revive(data.uri);
        let ref = this._documents.get(resource);
        if (ref) {
          if (resource.scheme !== Schemas.vscodeNotebookCell && resource.scheme !== Schemas.vscodeInteractiveInput) {
            throw new Error(
              `document '${resource} already exists!'`
            );
          }
        }
        if (!ref) {
          ref = new Reference(
            new ExtHostDocumentData(
              this._extHostRpc.getProxy(
                MainContext.MainThreadDocuments
              ),
              resource,
              data.lines,
              data.EOL,
              data.versionId,
              data.languageId,
              data.isDirty
            )
          );
          this._documents.set(resource, ref);
          addedDocuments.push(ref.value);
        }
        ref.ref();
      }
    }
    if (delta.removedEditors) {
      for (const id of delta.removedEditors) {
        const editor = this._editors.get(id);
        this._editors.delete(id);
        if (editor) {
          removedEditors.push(editor);
        }
      }
    }
    if (delta.addedEditors) {
      for (const data of delta.addedEditors) {
        const resource = URI.revive(data.documentUri);
        assert.ok(
          this._documents.has(resource),
          `document '${resource}' does not exist`
        );
        assert.ok(
          !this._editors.has(data.id),
          `editor '${data.id}' already exists!`
        );
        const documentData = this._documents.get(resource).value;
        const editor = new ExtHostTextEditor(
          data.id,
          this._extHostRpc.getProxy(
            MainContext.MainThreadTextEditors
          ),
          this._logService,
          new Lazy(() => documentData.document),
          data.selections.map(typeConverters.Selection.to),
          data.options,
          data.visibleRanges.map(
            (range) => typeConverters.Range.to(range)
          ),
          typeof data.editorPosition === "number" ? typeConverters.ViewColumn.to(data.editorPosition) : void 0
        );
        this._editors.set(data.id, editor);
      }
    }
    if (delta.newActiveEditor !== void 0) {
      assert.ok(
        delta.newActiveEditor === null || this._editors.has(delta.newActiveEditor),
        `active editor '${delta.newActiveEditor}' does not exist`
      );
      this._activeEditorId = delta.newActiveEditor;
    }
    dispose(removedDocuments);
    dispose(removedEditors);
    if (delta.removedDocuments) {
      this._onDidRemoveDocuments.fire(removedDocuments);
    }
    if (delta.addedDocuments) {
      this._onDidAddDocuments.fire(addedDocuments);
    }
    if (delta.removedEditors || delta.addedEditors) {
      this._onDidChangeVisibleTextEditors.fire(
        this.allEditors().map((editor) => editor.value)
      );
    }
    if (delta.newActiveEditor !== void 0) {
      this._onDidChangeActiveTextEditor.fire(this.activeEditor());
    }
  }
  getDocument(uri) {
    return this._documents.get(uri)?.value;
  }
  allDocuments() {
    return Iterable.map(this._documents.values(), (ref) => ref.value);
  }
  getEditor(id) {
    return this._editors.get(id);
  }
  activeEditor(internal) {
    if (!this._activeEditorId) {
      return void 0;
    }
    const editor = this._editors.get(this._activeEditorId);
    if (internal) {
      return editor;
    } else {
      return editor?.value;
    }
  }
  allEditors() {
    return [...this._editors.values()];
  }
};
ExtHostDocumentsAndEditors = __decorateClass([
  __decorateParam(0, IExtHostRpcService),
  __decorateParam(1, ILogService)
], ExtHostDocumentsAndEditors);
const IExtHostDocumentsAndEditors = createDecorator("IExtHostDocumentsAndEditors");
export {
  ExtHostDocumentsAndEditors,
  IExtHostDocumentsAndEditors
};
//# sourceMappingURL=extHostDocumentsAndEditors.js.map
