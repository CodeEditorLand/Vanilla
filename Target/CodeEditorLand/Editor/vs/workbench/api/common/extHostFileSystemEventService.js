import {
  AsyncEmitter,
  Emitter
} from "../../../base/common/event.js";
import { GLOB_SPLIT, GLOBSTAR, parse } from "../../../base/common/glob.js";
import { Lazy } from "../../../base/common/lazy.js";
import { URI } from "../../../base/common/uri.js";
import {
  FileChangeFilter,
  FileOperation
} from "../../../platform/files/common/files.js";
import {
  MainContext
} from "./extHost.protocol.js";
import * as typeConverter from "./extHostTypeConverters.js";
import { Disposable, WorkspaceEdit } from "./extHostTypes.js";
class FileSystemWatcher {
  session = Math.random();
  _onDidCreate = new Emitter();
  _onDidChange = new Emitter();
  _onDidDelete = new Emitter();
  _disposable;
  _config;
  get ignoreCreateEvents() {
    return Boolean(this._config & 1);
  }
  get ignoreChangeEvents() {
    return Boolean(this._config & 2);
  }
  get ignoreDeleteEvents() {
    return Boolean(this._config & 4);
  }
  constructor(mainContext, workspace, extension, dispatcher, globPattern, options) {
    this._config = 0;
    if (options?.ignoreCreateEvents) {
      this._config += 1;
    }
    if (options?.ignoreChangeEvents) {
      this._config += 2;
    }
    if (options?.ignoreDeleteEvents) {
      this._config += 4;
    }
    const parsedPattern = parse(globPattern);
    const excludeOutOfWorkspaceEvents = typeof globPattern === "string";
    const excludeUncorrelatedEvents = options?.correlate;
    const subscription = dispatcher((events) => {
      if (typeof events.session === "number" && events.session !== this.session) {
        return;
      }
      if (excludeUncorrelatedEvents && typeof events.session === "undefined") {
        return;
      }
      if (!options?.ignoreCreateEvents) {
        for (const created of events.created) {
          const uri = URI.revive(created);
          if (parsedPattern(uri.fsPath) && (!excludeOutOfWorkspaceEvents || workspace.getWorkspaceFolder(uri))) {
            this._onDidCreate.fire(uri);
          }
        }
      }
      if (!options?.ignoreChangeEvents) {
        for (const changed of events.changed) {
          const uri = URI.revive(changed);
          if (parsedPattern(uri.fsPath) && (!excludeOutOfWorkspaceEvents || workspace.getWorkspaceFolder(uri))) {
            this._onDidChange.fire(uri);
          }
        }
      }
      if (!options?.ignoreDeleteEvents) {
        for (const deleted of events.deleted) {
          const uri = URI.revive(deleted);
          if (parsedPattern(uri.fsPath) && (!excludeOutOfWorkspaceEvents || workspace.getWorkspaceFolder(uri))) {
            this._onDidDelete.fire(uri);
          }
        }
      }
    });
    this._disposable = Disposable.from(
      this.ensureWatching(
        mainContext,
        extension,
        globPattern,
        options,
        options?.correlate
      ),
      this._onDidCreate,
      this._onDidChange,
      this._onDidDelete,
      subscription
    );
  }
  ensureWatching(mainContext, extension, globPattern, options, correlate) {
    const disposable = Disposable.from();
    if (typeof globPattern === "string") {
      return disposable;
    }
    if (options?.ignoreChangeEvents && options?.ignoreCreateEvents && options?.ignoreDeleteEvents) {
      return disposable;
    }
    const proxy = mainContext.getProxy(
      MainContext.MainThreadFileSystemEventService
    );
    let recursive = false;
    if (globPattern.pattern.includes(GLOBSTAR) || globPattern.pattern.includes(GLOB_SPLIT)) {
      recursive = true;
    }
    let filter;
    if (correlate) {
      if (options?.ignoreChangeEvents || options?.ignoreCreateEvents || options?.ignoreDeleteEvents) {
        filter = FileChangeFilter.UPDATED | FileChangeFilter.ADDED | FileChangeFilter.DELETED;
        if (options?.ignoreChangeEvents) {
          filter &= ~FileChangeFilter.UPDATED;
        }
        if (options?.ignoreCreateEvents) {
          filter &= ~FileChangeFilter.ADDED;
        }
        if (options?.ignoreDeleteEvents) {
          filter &= ~FileChangeFilter.DELETED;
        }
      }
    }
    proxy.$watch(
      extension.identifier.value,
      this.session,
      globPattern.baseUri,
      { recursive, excludes: options?.excludes ?? [], filter },
      Boolean(correlate)
    );
    return Disposable.from({ dispose: () => proxy.$unwatch(this.session) });
  }
  dispose() {
    this._disposable.dispose();
  }
  get onDidCreate() {
    return this._onDidCreate.event;
  }
  get onDidChange() {
    return this._onDidChange.event;
  }
  get onDidDelete() {
    return this._onDidDelete.event;
  }
}
class LazyRevivedFileSystemEvents {
  constructor(_events) {
    this._events = _events;
  }
  session = this._events.session;
  _created = new Lazy(
    () => this._events.created.map(URI.revive)
  );
  get created() {
    return this._created.value;
  }
  _changed = new Lazy(
    () => this._events.changed.map(URI.revive)
  );
  get changed() {
    return this._changed.value;
  }
  _deleted = new Lazy(
    () => this._events.deleted.map(URI.revive)
  );
  get deleted() {
    return this._deleted.value;
  }
}
class ExtHostFileSystemEventService {
  constructor(_mainContext, _logService, _extHostDocumentsAndEditors) {
    this._mainContext = _mainContext;
    this._logService = _logService;
    this._extHostDocumentsAndEditors = _extHostDocumentsAndEditors;
  }
  _onFileSystemEvent = new Emitter();
  _onDidRenameFile = new Emitter();
  _onDidCreateFile = new Emitter();
  _onDidDeleteFile = new Emitter();
  _onWillRenameFile = new AsyncEmitter();
  _onWillCreateFile = new AsyncEmitter();
  _onWillDeleteFile = new AsyncEmitter();
  onDidRenameFile = this._onDidRenameFile.event;
  onDidCreateFile = this._onDidCreateFile.event;
  onDidDeleteFile = this._onDidDeleteFile.event;
  //--- file events
  createFileSystemWatcher(workspace, extension, globPattern, options) {
    return new FileSystemWatcher(
      this._mainContext,
      workspace,
      extension,
      this._onFileSystemEvent.event,
      typeConverter.GlobPattern.from(globPattern),
      options
    );
  }
  $onFileEvent(events) {
    this._onFileSystemEvent.fire(new LazyRevivedFileSystemEvents(events));
  }
  //--- file operations
  $onDidRunFileOperation(operation, files) {
    switch (operation) {
      case FileOperation.MOVE:
        this._onDidRenameFile.fire(
          Object.freeze({
            files: files.map((f) => ({
              oldUri: URI.revive(f.source),
              newUri: URI.revive(f.target)
            }))
          })
        );
        break;
      case FileOperation.DELETE:
        this._onDidDeleteFile.fire(
          Object.freeze({
            files: files.map((f) => URI.revive(f.target))
          })
        );
        break;
      case FileOperation.CREATE:
      case FileOperation.COPY:
        this._onDidCreateFile.fire(
          Object.freeze({
            files: files.map((f) => URI.revive(f.target))
          })
        );
        break;
      default:
    }
  }
  getOnWillRenameFileEvent(extension) {
    return this._createWillExecuteEvent(extension, this._onWillRenameFile);
  }
  getOnWillCreateFileEvent(extension) {
    return this._createWillExecuteEvent(extension, this._onWillCreateFile);
  }
  getOnWillDeleteFileEvent(extension) {
    return this._createWillExecuteEvent(extension, this._onWillDeleteFile);
  }
  _createWillExecuteEvent(extension, emitter) {
    return (listener, thisArg, disposables) => {
      const wrappedListener = function wrapped(e) {
        listener.call(thisArg, e);
      };
      wrappedListener.extension = extension;
      return emitter.event(wrappedListener, void 0, disposables);
    };
  }
  async $onWillRunFileOperation(operation, files, timeout, token) {
    switch (operation) {
      case FileOperation.MOVE:
        return await this._fireWillEvent(
          this._onWillRenameFile,
          {
            files: files.map((f) => ({
              oldUri: URI.revive(f.source),
              newUri: URI.revive(f.target)
            }))
          },
          timeout,
          token
        );
      case FileOperation.DELETE:
        return await this._fireWillEvent(
          this._onWillDeleteFile,
          { files: files.map((f) => URI.revive(f.target)) },
          timeout,
          token
        );
      case FileOperation.CREATE:
      case FileOperation.COPY:
        return await this._fireWillEvent(
          this._onWillCreateFile,
          { files: files.map((f) => URI.revive(f.target)) },
          timeout,
          token
        );
    }
    return void 0;
  }
  async _fireWillEvent(emitter, data, timeout, token) {
    const extensionNames = /* @__PURE__ */ new Set();
    const edits = [];
    await emitter.fireAsync(
      data,
      token,
      async (thenable, listener) => {
        const now = Date.now();
        const result = await Promise.resolve(thenable);
        if (result instanceof WorkspaceEdit) {
          edits.push([
            listener.extension,
            result
          ]);
          extensionNames.add(
            listener.extension.displayName ?? listener.extension.identifier.value
          );
        }
        if (Date.now() - now > timeout) {
          this._logService.warn(
            "SLOW file-participant",
            listener.extension.identifier
          );
        }
      }
    );
    if (token.isCancellationRequested) {
      return void 0;
    }
    if (edits.length === 0) {
      return void 0;
    }
    const dto = { edits: [] };
    for (const [, edit] of edits) {
      const { edits: edits2 } = typeConverter.WorkspaceEdit.from(edit, {
        getTextDocumentVersion: (uri) => this._extHostDocumentsAndEditors.getDocument(uri)?.version,
        getNotebookDocumentVersion: () => void 0
      });
      dto.edits = dto.edits.concat(edits2);
    }
    return { edit: dto, extensionNames: Array.from(extensionNames) };
  }
}
export {
  ExtHostFileSystemEventService
};
