var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Emitter, Event } from "../../../base/common/event.js";
import { DisposableStore } from "../../../base/common/lifecycle.js";
import { URI, UriComponents } from "../../../base/common/uri.js";
import { IModelChangedEvent } from "../../../editor/common/model/mirrorTextModel.js";
import { ExtHostDocumentsShape, IMainContext, MainContext, MainThreadDocumentsShape } from "./extHost.protocol.js";
import { ExtHostDocumentData, setWordDefinitionFor } from "./extHostDocumentData.js";
import { ExtHostDocumentsAndEditors } from "./extHostDocumentsAndEditors.js";
import * as TypeConverters from "./extHostTypeConverters.js";
import { assertIsDefined } from "../../../base/common/types.js";
import { deepFreeze } from "../../../base/common/objects.js";
import { TextDocumentChangeReason } from "./extHostTypes.js";
class ExtHostDocuments {
  static {
    __name(this, "ExtHostDocuments");
  }
  _onDidAddDocument = new Emitter();
  _onDidRemoveDocument = new Emitter();
  _onDidChangeDocument = new Emitter();
  _onDidSaveDocument = new Emitter();
  onDidAddDocument = this._onDidAddDocument.event;
  onDidRemoveDocument = this._onDidRemoveDocument.event;
  onDidChangeDocument = this._onDidChangeDocument.event;
  onDidSaveDocument = this._onDidSaveDocument.event;
  _toDispose = new DisposableStore();
  _proxy;
  _documentsAndEditors;
  _documentLoader = /* @__PURE__ */ new Map();
  constructor(mainContext, documentsAndEditors) {
    this._proxy = mainContext.getProxy(MainContext.MainThreadDocuments);
    this._documentsAndEditors = documentsAndEditors;
    this._documentsAndEditors.onDidRemoveDocuments((documents) => {
      for (const data of documents) {
        this._onDidRemoveDocument.fire(data.document);
      }
    }, void 0, this._toDispose);
    this._documentsAndEditors.onDidAddDocuments((documents) => {
      for (const data of documents) {
        this._onDidAddDocument.fire(data.document);
      }
    }, void 0, this._toDispose);
  }
  dispose() {
    this._toDispose.dispose();
  }
  getAllDocumentData() {
    return [...this._documentsAndEditors.allDocuments()];
  }
  getDocumentData(resource) {
    if (!resource) {
      return void 0;
    }
    const data = this._documentsAndEditors.getDocument(resource);
    if (data) {
      return data;
    }
    return void 0;
  }
  getDocument(resource) {
    const data = this.getDocumentData(resource);
    if (!data?.document) {
      throw new Error(`Unable to retrieve document from URI '${resource}'`);
    }
    return data.document;
  }
  ensureDocumentData(uri) {
    const cached = this._documentsAndEditors.getDocument(uri);
    if (cached) {
      return Promise.resolve(cached);
    }
    let promise = this._documentLoader.get(uri.toString());
    if (!promise) {
      promise = this._proxy.$tryOpenDocument(uri).then((uriData) => {
        this._documentLoader.delete(uri.toString());
        const canonicalUri = URI.revive(uriData);
        return assertIsDefined(this._documentsAndEditors.getDocument(canonicalUri));
      }, (err) => {
        this._documentLoader.delete(uri.toString());
        return Promise.reject(err);
      });
      this._documentLoader.set(uri.toString(), promise);
    }
    return promise;
  }
  createDocumentData(options) {
    return this._proxy.$tryCreateDocument(options).then((data) => URI.revive(data));
  }
  $acceptModelLanguageChanged(uriComponents, newLanguageId) {
    const uri = URI.revive(uriComponents);
    const data = this._documentsAndEditors.getDocument(uri);
    if (!data) {
      throw new Error("unknown document");
    }
    this._onDidRemoveDocument.fire(data.document);
    data._acceptLanguageId(newLanguageId);
    this._onDidAddDocument.fire(data.document);
  }
  $acceptModelSaved(uriComponents) {
    const uri = URI.revive(uriComponents);
    const data = this._documentsAndEditors.getDocument(uri);
    if (!data) {
      throw new Error("unknown document");
    }
    this.$acceptDirtyStateChanged(uriComponents, false);
    this._onDidSaveDocument.fire(data.document);
  }
  $acceptDirtyStateChanged(uriComponents, isDirty) {
    const uri = URI.revive(uriComponents);
    const data = this._documentsAndEditors.getDocument(uri);
    if (!data) {
      throw new Error("unknown document");
    }
    data._acceptIsDirty(isDirty);
    this._onDidChangeDocument.fire({
      document: data.document,
      contentChanges: [],
      reason: void 0
    });
  }
  $acceptModelChanged(uriComponents, events, isDirty) {
    const uri = URI.revive(uriComponents);
    const data = this._documentsAndEditors.getDocument(uri);
    if (!data) {
      throw new Error("unknown document");
    }
    data._acceptIsDirty(isDirty);
    data.onEvents(events);
    let reason = void 0;
    if (events.isUndoing) {
      reason = TextDocumentChangeReason.Undo;
    } else if (events.isRedoing) {
      reason = TextDocumentChangeReason.Redo;
    }
    this._onDidChangeDocument.fire(deepFreeze({
      document: data.document,
      contentChanges: events.changes.map((change) => {
        return {
          range: TypeConverters.Range.to(change.range),
          rangeOffset: change.rangeOffset,
          rangeLength: change.rangeLength,
          text: change.text
        };
      }),
      reason
    }));
  }
  setWordDefinitionFor(languageId, wordDefinition) {
    setWordDefinitionFor(languageId, wordDefinition);
  }
}
export {
  ExtHostDocuments
};
//# sourceMappingURL=extHostDocuments.js.map
