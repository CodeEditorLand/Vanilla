import { VSBuffer } from "../../../base/common/buffer.js";
import { Emitter } from "../../../base/common/event.js";
import {
  DisposableStore,
  toDisposable
} from "../../../base/common/lifecycle.js";
import { ResourceMap, ResourceSet } from "../../../base/common/map.js";
import { MarshalledId } from "../../../base/common/marshallingIds.js";
import { Schemas } from "../../../base/common/network.js";
import { filter } from "../../../base/common/objects.js";
import { isFalsyOrWhitespace } from "../../../base/common/strings.js";
import { assertIsDefined } from "../../../base/common/types.js";
import { URI } from "../../../base/common/uri.js";
import { localize } from "../../../nls.js";
import * as files from "../../../platform/files/common/files.js";
import { CellSearchModel } from "../../contrib/search/common/cellSearchModel.js";
import {
  genericCellMatchesToTextSearchMatches
} from "../../contrib/search/common/searchNotebookHelpers.js";
import {
  globMatchesResource,
  RegisteredEditorPriority
} from "../../services/editor/common/editorResolverService.js";
import { SerializableObjectWithBuffers } from "../../services/extensions/common/proxyIdentifier.js";
import {
  QueryType
} from "../../services/search/common/search.js";
import { Cache } from "./cache.js";
import {
  MainContext
} from "./extHost.protocol.js";
import {
  ApiCommand,
  ApiCommandArgument,
  ApiCommandResult
} from "./extHostCommands.js";
import {
  ExtHostCell,
  ExtHostNotebookDocument
} from "./extHostNotebookDocument.js";
import { ExtHostNotebookEditor } from "./extHostNotebookEditor.js";
import * as typeConverters from "./extHostTypeConverters.js";
import * as extHostTypes from "./extHostTypes.js";
class ExtHostNotebookController {
  constructor(mainContext, commands, _textDocumentsAndEditors, _textDocuments, _extHostFileSystem, _extHostSearch, _logService) {
    this._textDocumentsAndEditors = _textDocumentsAndEditors;
    this._textDocuments = _textDocuments;
    this._extHostFileSystem = _extHostFileSystem;
    this._extHostSearch = _extHostSearch;
    this._logService = _logService;
    this._notebookProxy = mainContext.getProxy(
      MainContext.MainThreadNotebook
    );
    this._notebookDocumentsProxy = mainContext.getProxy(
      MainContext.MainThreadNotebookDocuments
    );
    this._notebookEditorsProxy = mainContext.getProxy(
      MainContext.MainThreadNotebookEditors
    );
    this._commandsConverter = commands.converter;
    commands.registerArgumentProcessor({
      // Serialized INotebookCellActionContext
      processArgument: (arg) => {
        if (arg && arg.$mid === MarshalledId.NotebookCellActionContext) {
          const notebookUri = arg.notebookEditor?.notebookUri;
          const cellHandle = arg.cell.handle;
          const data = this._documents.get(notebookUri);
          const cell = data?.getCell(cellHandle);
          if (cell) {
            return cell.apiCell;
          }
        }
        if (arg && arg.$mid === MarshalledId.NotebookActionContext) {
          const notebookUri = arg.uri;
          const data = this._documents.get(notebookUri);
          if (data) {
            return data.apiNotebook;
          }
        }
        return arg;
      }
    });
    ExtHostNotebookController._registerApiCommands(commands);
  }
  static _notebookStatusBarItemProviderHandlePool = 0;
  _notebookProxy;
  _notebookDocumentsProxy;
  _notebookEditorsProxy;
  _notebookStatusBarItemProviders = /* @__PURE__ */ new Map();
  _documents = new ResourceMap();
  _editors = /* @__PURE__ */ new Map();
  _commandsConverter;
  _onDidChangeActiveNotebookEditor = new Emitter();
  onDidChangeActiveNotebookEditor = this._onDidChangeActiveNotebookEditor.event;
  _activeNotebookEditor;
  get activeNotebookEditor() {
    return this._activeNotebookEditor?.apiEditor;
  }
  _visibleNotebookEditors = [];
  get visibleNotebookEditors() {
    return this._visibleNotebookEditors.map((editor) => editor.apiEditor);
  }
  _onDidOpenNotebookDocument = new Emitter();
  onDidOpenNotebookDocument = this._onDidOpenNotebookDocument.event;
  _onDidCloseNotebookDocument = new Emitter();
  onDidCloseNotebookDocument = this._onDidCloseNotebookDocument.event;
  _onDidChangeVisibleNotebookEditors = new Emitter();
  onDidChangeVisibleNotebookEditors = this._onDidChangeVisibleNotebookEditors.event;
  _statusBarCache = new Cache(
    "NotebookCellStatusBarCache"
  );
  getEditorById(editorId) {
    const editor = this._editors.get(editorId);
    if (!editor) {
      throw new Error(
        `unknown text editor: ${editorId}. known editors: ${[...this._editors.keys()]} `
      );
    }
    return editor;
  }
  getIdByEditor(editor) {
    for (const [id, candidate] of this._editors) {
      if (candidate.apiEditor === editor) {
        return id;
      }
    }
    return void 0;
  }
  get notebookDocuments() {
    return [...this._documents.values()];
  }
  getNotebookDocument(uri, relaxed) {
    const result = this._documents.get(uri);
    if (!result && !relaxed) {
      throw new Error(`NO notebook document for '${uri}'`);
    }
    return result;
  }
  static _convertNotebookRegistrationData(extension, registration) {
    if (!registration) {
      return;
    }
    const viewOptionsFilenamePattern = registration.filenamePattern.map(
      (pattern) => typeConverters.NotebookExclusiveDocumentPattern.from(pattern)
    ).filter((pattern) => pattern !== void 0);
    if (registration.filenamePattern && !viewOptionsFilenamePattern) {
      console.warn(
        `Notebook content provider view options file name pattern is invalid ${registration.filenamePattern}`
      );
      return void 0;
    }
    return {
      extension: extension.identifier,
      providerDisplayName: extension.displayName || extension.name,
      displayName: registration.displayName,
      filenamePattern: viewOptionsFilenamePattern,
      priority: registration.exclusive ? RegisteredEditorPriority.exclusive : void 0
    };
  }
  registerNotebookCellStatusBarItemProvider(extension, notebookType, provider) {
    const handle = ExtHostNotebookController._notebookStatusBarItemProviderHandlePool++;
    const eventHandle = typeof provider.onDidChangeCellStatusBarItems === "function" ? ExtHostNotebookController._notebookStatusBarItemProviderHandlePool++ : void 0;
    this._notebookStatusBarItemProviders.set(handle, provider);
    this._notebookProxy.$registerNotebookCellStatusBarItemProvider(
      handle,
      eventHandle,
      notebookType
    );
    let subscription;
    if (eventHandle !== void 0) {
      subscription = provider.onDidChangeCellStatusBarItems(
        (_) => this._notebookProxy.$emitCellStatusBarEvent(eventHandle)
      );
    }
    return new extHostTypes.Disposable(() => {
      this._notebookStatusBarItemProviders.delete(handle);
      this._notebookProxy.$unregisterNotebookCellStatusBarItemProvider(
        handle,
        eventHandle
      );
      subscription?.dispose();
    });
  }
  async createNotebookDocument(options) {
    const canonicalUri = await this._notebookDocumentsProxy.$tryCreateNotebook({
      viewType: options.viewType,
      content: options.content && typeConverters.NotebookData.from(options.content)
    });
    return URI.revive(canonicalUri);
  }
  async openNotebookDocument(uri) {
    const cached = this._documents.get(uri);
    if (cached) {
      return cached.apiNotebook;
    }
    const canonicalUri = await this._notebookDocumentsProxy.$tryOpenNotebook(uri);
    const document = this._documents.get(URI.revive(canonicalUri));
    return assertIsDefined(document?.apiNotebook);
  }
  async showNotebookDocument(notebook, options) {
    let resolvedOptions;
    if (typeof options === "object") {
      resolvedOptions = {
        position: typeConverters.ViewColumn.from(options.viewColumn),
        preserveFocus: options.preserveFocus,
        selections: options.selections && options.selections.map(typeConverters.NotebookRange.from),
        pinned: typeof options.preview === "boolean" ? !options.preview : void 0,
        label: options?.label
      };
    } else {
      resolvedOptions = {
        preserveFocus: false,
        pinned: true
      };
    }
    const viewType = options?.asRepl ? "repl" : notebook.notebookType;
    const editorId = await this._notebookEditorsProxy.$tryShowNotebookDocument(
      notebook.uri,
      viewType,
      resolvedOptions
    );
    const editor = editorId && this._editors.get(editorId)?.apiEditor;
    if (editor) {
      return editor;
    }
    if (editorId) {
      throw new Error(
        `Could NOT open editor for "${notebook.uri.toString()}" because another editor opened in the meantime.`
      );
    } else {
      throw new Error(
        `Could NOT open editor for "${notebook.uri.toString()}".`
      );
    }
  }
  async $provideNotebookCellStatusBarItems(handle, uri, index, token) {
    const provider = this._notebookStatusBarItemProviders.get(handle);
    const revivedUri = URI.revive(uri);
    const document = this._documents.get(revivedUri);
    if (!document || !provider) {
      return;
    }
    const cell = document.getCellFromIndex(index);
    if (!cell) {
      return;
    }
    const result = await provider.provideCellStatusBarItems(
      cell.apiCell,
      token
    );
    if (!result) {
      return void 0;
    }
    const disposables = new DisposableStore();
    const cacheId = this._statusBarCache.add([disposables]);
    const resultArr = Array.isArray(result) ? result : [result];
    const items = resultArr.map(
      (item) => typeConverters.NotebookStatusBarItem.from(
        item,
        this._commandsConverter,
        disposables
      )
    );
    return {
      cacheId,
      items
    };
  }
  $releaseNotebookCellStatusBarItems(cacheId) {
    this._statusBarCache.delete(cacheId);
  }
  // --- serialize/deserialize
  _handlePool = 0;
  _notebookSerializer = /* @__PURE__ */ new Map();
  registerNotebookSerializer(extension, viewType, serializer, options, registration) {
    if (isFalsyOrWhitespace(viewType)) {
      throw new Error(`viewType cannot be empty or just whitespace`);
    }
    const handle = this._handlePool++;
    this._notebookSerializer.set(handle, { viewType, serializer, options });
    this._notebookProxy.$registerNotebookSerializer(
      handle,
      { id: extension.identifier, location: extension.extensionLocation },
      viewType,
      typeConverters.NotebookDocumentContentOptions.from(options),
      ExtHostNotebookController._convertNotebookRegistrationData(
        extension,
        registration
      )
    );
    return toDisposable(() => {
      this._notebookProxy.$unregisterNotebookSerializer(handle);
    });
  }
  async $dataToNotebook(handle, bytes, token) {
    const serializer = this._notebookSerializer.get(handle);
    if (!serializer) {
      throw new Error("NO serializer found");
    }
    const data = await serializer.serializer.deserializeNotebook(
      bytes.buffer,
      token
    );
    return new SerializableObjectWithBuffers(
      typeConverters.NotebookData.from(data)
    );
  }
  async $notebookToData(handle, data, token) {
    const serializer = this._notebookSerializer.get(handle);
    if (!serializer) {
      throw new Error("NO serializer found");
    }
    const bytes = await serializer.serializer.serializeNotebook(
      typeConverters.NotebookData.to(data.value),
      token
    );
    return VSBuffer.wrap(bytes);
  }
  async $saveNotebook(handle, uriComponents, versionId, options, token) {
    const uri = URI.revive(uriComponents);
    const serializer = this._notebookSerializer.get(handle);
    this.trace(
      `enter saveNotebook(versionId: ${versionId}, ${uri.toString()})`
    );
    if (!serializer) {
      throw new Error("NO serializer found");
    }
    const document = this._documents.get(uri);
    if (!document) {
      throw new Error("Document NOT found");
    }
    if (document.versionId !== versionId) {
      throw new Error("Document version mismatch");
    }
    if (!this._extHostFileSystem.value.isWritableFileSystem(uri.scheme)) {
      throw new files.FileOperationError(
        localize(
          "err.readonly",
          "Unable to modify read-only file '{0}'",
          this._resourceForError(uri)
        ),
        files.FileOperationResult.FILE_PERMISSION_DENIED
      );
    }
    const data = {
      metadata: filter(
        document.apiNotebook.metadata,
        (key) => !(serializer.options?.transientDocumentMetadata ?? {})[key]
      ),
      cells: []
    };
    for (const cell of document.apiNotebook.getCells()) {
      const cellData = new extHostTypes.NotebookCellData(
        cell.kind,
        cell.document.getText(),
        cell.document.languageId,
        cell.mime,
        serializer.options?.transientOutputs ? [] : [...cell.outputs],
        cell.metadata,
        cell.executionSummary
      );
      cellData.metadata = filter(
        cell.metadata,
        (key) => !(serializer.options?.transientCellMetadata ?? {})[key]
      );
      data.cells.push(cellData);
    }
    await this._validateWriteFile(uri, options);
    if (token.isCancellationRequested) {
      throw new Error("canceled");
    }
    const bytes = await serializer.serializer.serializeNotebook(
      data,
      token
    );
    if (token.isCancellationRequested) {
      throw new Error("canceled");
    }
    this.trace(`serialized versionId: ${versionId} ${uri.toString()}`);
    await this._extHostFileSystem.value.writeFile(uri, bytes);
    this.trace(`Finished write versionId: ${versionId} ${uri.toString()}`);
    const providerExtUri = this._extHostFileSystem.getFileSystemProviderExtUri(uri.scheme);
    const stat = await this._extHostFileSystem.value.stat(uri);
    const fileStats = {
      name: providerExtUri.basename(uri),
      isFile: (stat.type & files.FileType.File) !== 0,
      isDirectory: (stat.type & files.FileType.Directory) !== 0,
      isSymbolicLink: (stat.type & files.FileType.SymbolicLink) !== 0,
      mtime: stat.mtime,
      ctime: stat.ctime,
      size: stat.size,
      readonly: Boolean(
        (stat.permissions ?? 0) & files.FilePermission.Readonly
      ) || !this._extHostFileSystem.value.isWritableFileSystem(uri.scheme),
      locked: Boolean(
        (stat.permissions ?? 0) & files.FilePermission.Locked
      ),
      etag: files.etag({ mtime: stat.mtime, size: stat.size }),
      children: void 0
    };
    this.trace(
      `exit saveNotebook(versionId: ${versionId}, ${uri.toString()})`
    );
    return fileStats;
  }
  /**
   * Search for query in all notebooks that can be deserialized by the serializer fetched by `handle`.
   *
   * @param handle used to get notebook serializer
   * @param textQuery the text query to search using
   * @param viewTypeFileTargets the globs (and associated ranks) that are targetting for opening this type of notebook
   * @param otherViewTypeFileTargets ranked globs for other editors that we should consider when deciding whether it will open as this notebook
   * @param token cancellation token
   * @returns `IRawClosedNotebookFileMatch` for every file. Files without matches will just have a `IRawClosedNotebookFileMatch`
   * 	with no `cellResults`. This allows the caller to know what was searched in already, even if it did not yield results.
   */
  async $searchInNotebooks(handle, textQuery, viewTypeFileTargets, otherViewTypeFileTargets, token) {
    const serializer = this._notebookSerializer.get(handle)?.serializer;
    if (!serializer) {
      return {
        limitHit: false,
        results: []
      };
    }
    const finalMatchedTargets = new ResourceSet();
    const runFileQueries = async (includes, token2, textQuery2) => {
      await Promise.all(
        includes.map(
          async (include) => await Promise.all(
            include.filenamePatterns.map((filePattern) => {
              const query = {
                _reason: textQuery2._reason,
                folderQueries: textQuery2.folderQueries,
                includePattern: textQuery2.includePattern,
                excludePattern: textQuery2.excludePattern,
                maxResults: textQuery2.maxResults,
                type: QueryType.File,
                filePattern
              };
              return this._extHostSearch.doInternalFileSearchWithCustomCallback(
                query,
                token2,
                (data) => {
                  data.forEach((uri) => {
                    if (finalMatchedTargets.has(uri)) {
                      return;
                    }
                    const hasOtherMatches = otherViewTypeFileTargets.some(
                      (target) => {
                        if (include.isFromSettings && !target.isFromSettings) {
                          return false;
                        } else {
                          return target.filenamePatterns.some(
                            (targetFilePattern) => globMatchesResource(
                              targetFilePattern,
                              uri
                            )
                          );
                        }
                      }
                    );
                    if (hasOtherMatches) {
                      return;
                    }
                    finalMatchedTargets.add(uri);
                  });
                }
              ).catch((err) => {
                if (err.code === "ENOENT") {
                  console.warn(
                    `Could not find notebook search results, ignoring notebook results.`
                  );
                  return {
                    limitHit: false,
                    messages: []
                  };
                } else {
                  throw err;
                }
              });
            })
          )
        )
      );
      return;
    };
    await runFileQueries(viewTypeFileTargets, token, textQuery);
    const results = new ResourceMap();
    let limitHit = false;
    const promises = Array.from(finalMatchedTargets).map(async (uri) => {
      const cellMatches = [];
      try {
        if (token.isCancellationRequested) {
          return;
        }
        if (textQuery.maxResults && [...results.values()].reduce(
          (acc, value) => acc + value.cellResults.length,
          0
        ) > textQuery.maxResults) {
          limitHit = true;
          return;
        }
        const simpleCells = [];
        const notebook = this._documents.get(uri);
        if (notebook) {
          const cells = notebook.apiNotebook.getCells();
          cells.forEach(
            (e) => simpleCells.push({
              input: e.document.getText(),
              outputs: e.outputs.flatMap(
                (value) => value.items.map(
                  (output) => output.data.toString()
                )
              )
            })
          );
        } else {
          const fileContent = await this._extHostFileSystem.value.readFile(uri);
          const bytes = VSBuffer.fromString(fileContent.toString());
          const notebook2 = await serializer.deserializeNotebook(
            bytes.buffer,
            token
          );
          if (token.isCancellationRequested) {
            return;
          }
          const data = typeConverters.NotebookData.from(notebook2);
          data.cells.forEach(
            (cell) => simpleCells.push({
              input: cell.source,
              outputs: cell.outputs.flatMap(
                (value) => value.items.map(
                  (output) => output.valueBytes.toString()
                )
              )
            })
          );
        }
        if (token.isCancellationRequested) {
          return;
        }
        simpleCells.forEach((cell, index) => {
          const target = textQuery.contentPattern.pattern;
          const cellModel = new CellSearchModel(
            cell.input,
            void 0,
            cell.outputs
          );
          const inputMatches = cellModel.findInInputs(target);
          const outputMatches = cellModel.findInOutputs(target);
          const webviewResults = outputMatches.flatMap(
            (outputMatch) => genericCellMatchesToTextSearchMatches(
              outputMatch.matches,
              outputMatch.textBuffer
            )
          ).map((textMatch, index2) => {
            textMatch.webviewIndex = index2;
            return textMatch;
          });
          if (inputMatches.length > 0 || outputMatches.length > 0) {
            const cellMatch = {
              index,
              contentResults: genericCellMatchesToTextSearchMatches(
                inputMatches,
                cellModel.inputTextBuffer
              ),
              webviewResults
            };
            cellMatches.push(cellMatch);
          }
        });
        const fileMatch = {
          resource: uri,
          cellResults: cellMatches
        };
        results.set(uri, fileMatch);
        return;
      } catch (e) {
        return;
      }
    });
    await Promise.all(promises);
    return {
      limitHit,
      results: [...results.values()]
    };
  }
  async _validateWriteFile(uri, options) {
    const stat = await this._extHostFileSystem.value.stat(uri);
    if (typeof options?.mtime === "number" && typeof options.etag === "string" && options.etag !== files.ETAG_DISABLED && typeof stat.mtime === "number" && typeof stat.size === "number" && options.mtime < stat.mtime && options.etag !== files.etag({
      mtime: options.mtime,
      size: stat.size
    })) {
      throw new files.FileOperationError(
        localize("fileModifiedError", "File Modified Since"),
        files.FileOperationResult.FILE_MODIFIED_SINCE,
        options
      );
    }
    return;
  }
  _resourceForError(uri) {
    return uri.scheme === Schemas.file ? uri.fsPath : uri.toString();
  }
  // --- open, save, saveAs, backup
  _createExtHostEditor(document, editorId, data) {
    if (this._editors.has(editorId)) {
      throw new Error(`editor with id ALREADY EXSIST: ${editorId}`);
    }
    const editor = new ExtHostNotebookEditor(
      editorId,
      this._notebookEditorsProxy,
      document,
      data.visibleRanges.map(typeConverters.NotebookRange.to),
      data.selections.map(typeConverters.NotebookRange.to),
      typeof data.viewColumn === "number" ? typeConverters.ViewColumn.to(data.viewColumn) : void 0
    );
    this._editors.set(editorId, editor);
  }
  $acceptDocumentAndEditorsDelta(delta) {
    if (delta.value.removedDocuments) {
      for (const uri of delta.value.removedDocuments) {
        const revivedUri = URI.revive(uri);
        const document = this._documents.get(revivedUri);
        if (document) {
          document.dispose();
          this._documents.delete(revivedUri);
          this._textDocumentsAndEditors.$acceptDocumentsAndEditorsDelta(
            {
              removedDocuments: document.apiNotebook.getCells().map((cell) => cell.document.uri)
            }
          );
          this._onDidCloseNotebookDocument.fire(document.apiNotebook);
        }
        for (const editor of this._editors.values()) {
          if (editor.notebookData.uri.toString() === revivedUri.toString()) {
            this._editors.delete(editor.id);
          }
        }
      }
    }
    if (delta.value.addedDocuments) {
      const addedCellDocuments = [];
      for (const modelData of delta.value.addedDocuments) {
        const uri = URI.revive(modelData.uri);
        if (this._documents.has(uri)) {
          throw new Error(`adding EXISTING notebook ${uri} `);
        }
        const document = new ExtHostNotebookDocument(
          this._notebookDocumentsProxy,
          this._textDocumentsAndEditors,
          this._textDocuments,
          uri,
          modelData
        );
        addedCellDocuments.push(
          ...modelData.cells.map(
            (cell) => ExtHostCell.asModelAddData(cell)
          )
        );
        this._documents.get(uri)?.dispose();
        this._documents.set(uri, document);
        this._textDocumentsAndEditors.$acceptDocumentsAndEditorsDelta({
          addedDocuments: addedCellDocuments
        });
        this._onDidOpenNotebookDocument.fire(document.apiNotebook);
      }
    }
    if (delta.value.addedEditors) {
      for (const editorModelData of delta.value.addedEditors) {
        if (this._editors.has(editorModelData.id)) {
          return;
        }
        const revivedUri = URI.revive(editorModelData.documentUri);
        const document = this._documents.get(revivedUri);
        if (document) {
          this._createExtHostEditor(
            document,
            editorModelData.id,
            editorModelData
          );
        }
      }
    }
    const removedEditors = [];
    if (delta.value.removedEditors) {
      for (const editorid of delta.value.removedEditors) {
        const editor = this._editors.get(editorid);
        if (editor) {
          this._editors.delete(editorid);
          if (this._activeNotebookEditor?.id === editor.id) {
            this._activeNotebookEditor = void 0;
          }
          removedEditors.push(editor);
        }
      }
    }
    if (delta.value.visibleEditors) {
      this._visibleNotebookEditors = delta.value.visibleEditors.map((id) => this._editors.get(id)).filter((editor) => !!editor);
      const visibleEditorsSet = /* @__PURE__ */ new Set();
      this._visibleNotebookEditors.forEach(
        (editor) => visibleEditorsSet.add(editor.id)
      );
      for (const editor of this._editors.values()) {
        const newValue = visibleEditorsSet.has(editor.id);
        editor._acceptVisibility(newValue);
      }
      this._visibleNotebookEditors = [...this._editors.values()].map((e) => e).filter((e) => e.visible);
      this._onDidChangeVisibleNotebookEditors.fire(
        this.visibleNotebookEditors
      );
    }
    if (delta.value.newActiveEditor === null) {
      this._activeNotebookEditor = void 0;
    } else if (delta.value.newActiveEditor) {
      const activeEditor = this._editors.get(delta.value.newActiveEditor);
      if (!activeEditor) {
        console.error(
          `FAILED to find active notebook editor ${delta.value.newActiveEditor}`
        );
      }
      this._activeNotebookEditor = this._editors.get(
        delta.value.newActiveEditor
      );
    }
    if (delta.value.newActiveEditor !== void 0) {
      this._onDidChangeActiveNotebookEditor.fire(
        this._activeNotebookEditor?.apiEditor
      );
    }
  }
  static _registerApiCommands(extHostCommands) {
    const notebookTypeArg = ApiCommandArgument.String.with(
      "notebookType",
      "A notebook type"
    );
    const commandDataToNotebook = new ApiCommand(
      "vscode.executeDataToNotebook",
      "_executeDataToNotebook",
      "Invoke notebook serializer",
      [
        notebookTypeArg,
        new ApiCommandArgument(
          "data",
          "Bytes to convert to data",
          (v) => v instanceof Uint8Array,
          (v) => VSBuffer.wrap(v)
        )
      ],
      new ApiCommandResult(
        "Notebook Data",
        (data) => typeConverters.NotebookData.to(data.value)
      )
    );
    const commandNotebookToData = new ApiCommand(
      "vscode.executeNotebookToData",
      "_executeNotebookToData",
      "Invoke notebook serializer",
      [
        notebookTypeArg,
        new ApiCommandArgument(
          "NotebookData",
          "Notebook data to convert to bytes",
          (v) => true,
          (v) => new SerializableObjectWithBuffers(
            typeConverters.NotebookData.from(v)
          )
        )
      ],
      new ApiCommandResult(
        "Bytes",
        (dto) => dto.buffer
      )
    );
    extHostCommands.registerApiCommand(commandDataToNotebook);
    extHostCommands.registerApiCommand(commandNotebookToData);
  }
  trace(msg) {
    this._logService.trace(`[Extension Host Notebook] ${msg}`);
  }
}
export {
  ExtHostNotebookController
};
