var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { URI, UriComponents } from "../../../base/common/uri.js";
import { MainContext, IMainContext, ExtHostFileSystemShape, MainThreadFileSystemShape, IFileChangeDto } from "./extHost.protocol.js";
import * as files from "../../../platform/files/common/files.js";
import { IDisposable, toDisposable } from "../../../base/common/lifecycle.js";
import { FileChangeType } from "./extHostTypes.js";
import * as typeConverter from "./extHostTypeConverters.js";
import { ExtHostLanguageFeatures } from "./extHostLanguageFeatures.js";
import { State, StateMachine, LinkComputer, Edge } from "../../../editor/common/languages/linkComputer.js";
import { commonPrefixLength } from "../../../base/common/strings.js";
import { CharCode } from "../../../base/common/charCode.js";
import { VSBuffer } from "../../../base/common/buffer.js";
import { IExtensionDescription } from "../../../platform/extensions/common/extensions.js";
import { checkProposedApiEnabled } from "../../services/extensions/common/extensions.js";
import { IMarkdownString, isMarkdownString } from "../../../base/common/htmlContent.js";
class FsLinkProvider {
  static {
    __name(this, "FsLinkProvider");
  }
  _schemes = [];
  _stateMachine;
  add(scheme) {
    this._stateMachine = void 0;
    this._schemes.push(scheme);
  }
  delete(scheme) {
    const idx = this._schemes.indexOf(scheme);
    if (idx >= 0) {
      this._schemes.splice(idx, 1);
      this._stateMachine = void 0;
    }
  }
  _initStateMachine() {
    if (!this._stateMachine) {
      const schemes = this._schemes.sort();
      const edges = [];
      let prevScheme;
      let prevState;
      let lastState = State.LastKnownState;
      let nextState = State.LastKnownState;
      for (const scheme of schemes) {
        let pos = !prevScheme ? 0 : commonPrefixLength(prevScheme, scheme);
        if (pos === 0) {
          prevState = State.Start;
        } else {
          prevState = nextState;
        }
        for (; pos < scheme.length; pos++) {
          if (pos + 1 === scheme.length) {
            lastState = nextState;
            nextState = State.BeforeColon;
          } else {
            nextState += 1;
          }
          edges.push([prevState, scheme.toUpperCase().charCodeAt(pos), nextState]);
          edges.push([prevState, scheme.toLowerCase().charCodeAt(pos), nextState]);
          prevState = nextState;
        }
        prevScheme = scheme;
        nextState = lastState;
      }
      edges.push([State.BeforeColon, CharCode.Colon, State.AfterColon]);
      edges.push([State.AfterColon, CharCode.Slash, State.End]);
      this._stateMachine = new StateMachine(edges);
    }
  }
  provideDocumentLinks(document) {
    this._initStateMachine();
    const result = [];
    const links = LinkComputer.computeLinks({
      getLineContent(lineNumber) {
        return document.lineAt(lineNumber - 1).text;
      },
      getLineCount() {
        return document.lineCount;
      }
    }, this._stateMachine);
    for (const link of links) {
      const docLink = typeConverter.DocumentLink.to(link);
      if (docLink.target) {
        result.push(docLink);
      }
    }
    return result;
  }
}
class ExtHostFileSystem {
  constructor(mainContext, _extHostLanguageFeatures) {
    this._extHostLanguageFeatures = _extHostLanguageFeatures;
    this._proxy = mainContext.getProxy(MainContext.MainThreadFileSystem);
  }
  static {
    __name(this, "ExtHostFileSystem");
  }
  _proxy;
  _linkProvider = new FsLinkProvider();
  _fsProvider = /* @__PURE__ */ new Map();
  _registeredSchemes = /* @__PURE__ */ new Set();
  _watches = /* @__PURE__ */ new Map();
  _linkProviderRegistration;
  _handlePool = 0;
  dispose() {
    this._linkProviderRegistration?.dispose();
  }
  registerFileSystemProvider(extension, scheme, provider, options = {}) {
    ExtHostFileSystem._validateFileSystemProvider(provider);
    if (this._registeredSchemes.has(scheme)) {
      throw new Error(`a provider for the scheme '${scheme}' is already registered`);
    }
    if (!this._linkProviderRegistration) {
      this._linkProviderRegistration = this._extHostLanguageFeatures.registerDocumentLinkProvider(extension, "*", this._linkProvider);
    }
    const handle = this._handlePool++;
    this._linkProvider.add(scheme);
    this._registeredSchemes.add(scheme);
    this._fsProvider.set(handle, provider);
    let capabilities = files.FileSystemProviderCapabilities.FileReadWrite;
    if (options.isCaseSensitive) {
      capabilities += files.FileSystemProviderCapabilities.PathCaseSensitive;
    }
    if (options.isReadonly) {
      capabilities += files.FileSystemProviderCapabilities.Readonly;
    }
    if (typeof provider.copy === "function") {
      capabilities += files.FileSystemProviderCapabilities.FileFolderCopy;
    }
    if (typeof provider.open === "function" && typeof provider.close === "function" && typeof provider.read === "function" && typeof provider.write === "function") {
      checkProposedApiEnabled(extension, "fsChunks");
      capabilities += files.FileSystemProviderCapabilities.FileOpenReadWriteClose;
    }
    let readOnlyMessage;
    if (options.isReadonly && isMarkdownString(options.isReadonly) && options.isReadonly.value !== "") {
      readOnlyMessage = {
        value: options.isReadonly.value,
        isTrusted: options.isReadonly.isTrusted,
        supportThemeIcons: options.isReadonly.supportThemeIcons,
        supportHtml: options.isReadonly.supportHtml,
        baseUri: options.isReadonly.baseUri,
        uris: options.isReadonly.uris
      };
    }
    this._proxy.$registerFileSystemProvider(handle, scheme, capabilities, readOnlyMessage).catch((err) => {
      console.error(`FAILED to register filesystem provider of ${extension.identifier.value}-extension for the scheme ${scheme}`);
      console.error(err);
    });
    const subscription = provider.onDidChangeFile((event) => {
      const mapped = [];
      for (const e of event) {
        const { uri: resource, type } = e;
        if (resource.scheme !== scheme) {
          continue;
        }
        let newType;
        switch (type) {
          case FileChangeType.Changed:
            newType = files.FileChangeType.UPDATED;
            break;
          case FileChangeType.Created:
            newType = files.FileChangeType.ADDED;
            break;
          case FileChangeType.Deleted:
            newType = files.FileChangeType.DELETED;
            break;
          default:
            throw new Error("Unknown FileChangeType");
        }
        mapped.push({ resource, type: newType });
      }
      this._proxy.$onFileSystemChange(handle, mapped);
    });
    return toDisposable(() => {
      subscription.dispose();
      this._linkProvider.delete(scheme);
      this._registeredSchemes.delete(scheme);
      this._fsProvider.delete(handle);
      this._proxy.$unregisterProvider(handle);
    });
  }
  static _validateFileSystemProvider(provider) {
    if (!provider) {
      throw new Error("MISSING provider");
    }
    if (typeof provider.watch !== "function") {
      throw new Error("Provider does NOT implement watch");
    }
    if (typeof provider.stat !== "function") {
      throw new Error("Provider does NOT implement stat");
    }
    if (typeof provider.readDirectory !== "function") {
      throw new Error("Provider does NOT implement readDirectory");
    }
    if (typeof provider.createDirectory !== "function") {
      throw new Error("Provider does NOT implement createDirectory");
    }
    if (typeof provider.readFile !== "function") {
      throw new Error("Provider does NOT implement readFile");
    }
    if (typeof provider.writeFile !== "function") {
      throw new Error("Provider does NOT implement writeFile");
    }
    if (typeof provider.delete !== "function") {
      throw new Error("Provider does NOT implement delete");
    }
    if (typeof provider.rename !== "function") {
      throw new Error("Provider does NOT implement rename");
    }
  }
  static _asIStat(stat) {
    const { type, ctime, mtime, size, permissions } = stat;
    return { type, ctime, mtime, size, permissions };
  }
  $stat(handle, resource) {
    return Promise.resolve(this._getFsProvider(handle).stat(URI.revive(resource))).then((stat) => ExtHostFileSystem._asIStat(stat));
  }
  $readdir(handle, resource) {
    return Promise.resolve(this._getFsProvider(handle).readDirectory(URI.revive(resource)));
  }
  $readFile(handle, resource) {
    return Promise.resolve(this._getFsProvider(handle).readFile(URI.revive(resource))).then((data) => VSBuffer.wrap(data));
  }
  $writeFile(handle, resource, content, opts) {
    return Promise.resolve(this._getFsProvider(handle).writeFile(URI.revive(resource), content.buffer, opts));
  }
  $delete(handle, resource, opts) {
    return Promise.resolve(this._getFsProvider(handle).delete(URI.revive(resource), opts));
  }
  $rename(handle, oldUri, newUri, opts) {
    return Promise.resolve(this._getFsProvider(handle).rename(URI.revive(oldUri), URI.revive(newUri), opts));
  }
  $copy(handle, oldUri, newUri, opts) {
    const provider = this._getFsProvider(handle);
    if (!provider.copy) {
      throw new Error('FileSystemProvider does not implement "copy"');
    }
    return Promise.resolve(provider.copy(URI.revive(oldUri), URI.revive(newUri), opts));
  }
  $mkdir(handle, resource) {
    return Promise.resolve(this._getFsProvider(handle).createDirectory(URI.revive(resource)));
  }
  $watch(handle, session, resource, opts) {
    const subscription = this._getFsProvider(handle).watch(URI.revive(resource), opts);
    this._watches.set(session, subscription);
  }
  $unwatch(_handle, session) {
    const subscription = this._watches.get(session);
    if (subscription) {
      subscription.dispose();
      this._watches.delete(session);
    }
  }
  $open(handle, resource, opts) {
    const provider = this._getFsProvider(handle);
    if (!provider.open) {
      throw new Error('FileSystemProvider does not implement "open"');
    }
    return Promise.resolve(provider.open(URI.revive(resource), opts));
  }
  $close(handle, fd) {
    const provider = this._getFsProvider(handle);
    if (!provider.close) {
      throw new Error('FileSystemProvider does not implement "close"');
    }
    return Promise.resolve(provider.close(fd));
  }
  $read(handle, fd, pos, length) {
    const provider = this._getFsProvider(handle);
    if (!provider.read) {
      throw new Error('FileSystemProvider does not implement "read"');
    }
    const data = VSBuffer.alloc(length);
    return Promise.resolve(provider.read(fd, pos, data.buffer, 0, length)).then((read) => {
      return data.slice(0, read);
    });
  }
  $write(handle, fd, pos, data) {
    const provider = this._getFsProvider(handle);
    if (!provider.write) {
      throw new Error('FileSystemProvider does not implement "write"');
    }
    return Promise.resolve(provider.write(fd, pos, data.buffer, 0, data.byteLength));
  }
  _getFsProvider(handle) {
    const provider = this._fsProvider.get(handle);
    if (!provider) {
      const err = new Error();
      err.name = "ENOPRO";
      err.message = `no provider`;
      throw err;
    }
    return provider;
  }
}
export {
  ExtHostFileSystem
};
//# sourceMappingURL=extHostFileSystem.js.map
