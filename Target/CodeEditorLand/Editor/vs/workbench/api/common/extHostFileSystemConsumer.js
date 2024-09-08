var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { ResourceQueue } from "../../../base/common/async.js";
import { VSBuffer } from "../../../base/common/buffer.js";
import {
  toDisposable
} from "../../../base/common/lifecycle.js";
import { Schemas } from "../../../base/common/network.js";
import {
  extUri,
  extUriIgnorePathCase
} from "../../../base/common/resources.js";
import * as files from "../../../platform/files/common/files.js";
import { createDecorator } from "../../../platform/instantiation/common/instantiation.js";
import {
  MainContext
} from "./extHost.protocol.js";
import { IExtHostFileSystemInfo } from "./extHostFileSystemInfo.js";
import { IExtHostRpcService } from "./extHostRpcService.js";
import { FileSystemError } from "./extHostTypes.js";
let ExtHostConsumerFileSystem = class {
  _serviceBrand;
  value;
  _proxy;
  _fileSystemProvider = /* @__PURE__ */ new Map();
  _writeQueue = new ResourceQueue();
  constructor(extHostRpc, fileSystemInfo) {
    this._proxy = extHostRpc.getProxy(MainContext.MainThreadFileSystem);
    const that = this;
    this.value = Object.freeze({
      async stat(uri) {
        try {
          let stat;
          const provider = that._fileSystemProvider.get(uri.scheme);
          if (provider) {
            await that._proxy.$ensureActivation(uri.scheme);
            stat = await provider.impl.stat(uri);
          } else {
            stat = await that._proxy.$stat(uri);
          }
          return {
            type: stat.type,
            ctime: stat.ctime,
            mtime: stat.mtime,
            size: stat.size,
            permissions: stat.permissions === files.FilePermission.Readonly ? 1 : void 0
          };
        } catch (err) {
          ExtHostConsumerFileSystem._handleError(err);
        }
      },
      async readDirectory(uri) {
        try {
          const provider = that._fileSystemProvider.get(uri.scheme);
          if (provider) {
            await that._proxy.$ensureActivation(uri.scheme);
            return (await provider.impl.readDirectory(uri)).slice();
          } else {
            return await that._proxy.$readdir(uri);
          }
        } catch (err) {
          return ExtHostConsumerFileSystem._handleError(err);
        }
      },
      async createDirectory(uri) {
        try {
          const provider = that._fileSystemProvider.get(uri.scheme);
          if (provider && !provider.isReadonly) {
            await that._proxy.$ensureActivation(uri.scheme);
            return await that.mkdirp(
              provider.impl,
              provider.extUri,
              uri
            );
          } else {
            return await that._proxy.$mkdir(uri);
          }
        } catch (err) {
          return ExtHostConsumerFileSystem._handleError(err);
        }
      },
      async readFile(uri) {
        try {
          const provider = that._fileSystemProvider.get(uri.scheme);
          if (provider) {
            await that._proxy.$ensureActivation(uri.scheme);
            return (await provider.impl.readFile(uri)).slice();
          } else {
            const buff = await that._proxy.$readFile(uri);
            return buff.buffer;
          }
        } catch (err) {
          return ExtHostConsumerFileSystem._handleError(err);
        }
      },
      async writeFile(uri, content) {
        try {
          const provider = that._fileSystemProvider.get(uri.scheme);
          if (provider && !provider.isReadonly) {
            await that._proxy.$ensureActivation(uri.scheme);
            await that.mkdirp(
              provider.impl,
              provider.extUri,
              provider.extUri.dirname(uri)
            );
            return await that._writeQueue.queueFor(
              uri,
              () => Promise.resolve(
                provider.impl.writeFile(uri, content, {
                  create: true,
                  overwrite: true
                })
              )
            );
          } else {
            return await that._proxy.$writeFile(
              uri,
              VSBuffer.wrap(content)
            );
          }
        } catch (err) {
          return ExtHostConsumerFileSystem._handleError(err);
        }
      },
      async delete(uri, options) {
        try {
          const provider = that._fileSystemProvider.get(uri.scheme);
          if (provider && !provider.isReadonly && !options?.useTrash) {
            await that._proxy.$ensureActivation(uri.scheme);
            return await provider.impl.delete(uri, {
              recursive: false,
              ...options
            });
          } else {
            return await that._proxy.$delete(uri, {
              recursive: false,
              useTrash: false,
              atomic: false,
              ...options
            });
          }
        } catch (err) {
          return ExtHostConsumerFileSystem._handleError(err);
        }
      },
      async rename(oldUri, newUri, options) {
        try {
          return await that._proxy.$rename(oldUri, newUri, {
            ...{ overwrite: false },
            ...options
          });
        } catch (err) {
          return ExtHostConsumerFileSystem._handleError(err);
        }
      },
      async copy(source, destination, options) {
        try {
          return await that._proxy.$copy(source, destination, {
            ...{ overwrite: false },
            ...options
          });
        } catch (err) {
          return ExtHostConsumerFileSystem._handleError(err);
        }
      },
      isWritableFileSystem(scheme) {
        const capabilities = fileSystemInfo.getCapabilities(scheme);
        if (typeof capabilities === "number") {
          return !(capabilities & files.FileSystemProviderCapabilities.Readonly);
        }
        return void 0;
      }
    });
  }
  async mkdirp(provider, providerExtUri, directory) {
    const directoriesToCreate = [];
    while (!providerExtUri.isEqual(
      directory,
      providerExtUri.dirname(directory)
    )) {
      try {
        const stat = await provider.stat(directory);
        if ((stat.type & files.FileType.Directory) === 0) {
          throw FileSystemError.FileExists(
            `Unable to create folder '${directory.scheme === Schemas.file ? directory.fsPath : directory.toString(true)}' that already exists but is not a directory`
          );
        }
        break;
      } catch (error) {
        if (files.toFileSystemProviderErrorCode(error) !== files.FileSystemProviderErrorCode.FileNotFound) {
          throw error;
        }
        directoriesToCreate.push(providerExtUri.basename(directory));
        directory = providerExtUri.dirname(directory);
      }
    }
    for (let i = directoriesToCreate.length - 1; i >= 0; i--) {
      directory = providerExtUri.joinPath(
        directory,
        directoriesToCreate[i]
      );
      try {
        await provider.createDirectory(directory);
      } catch (error) {
        if (files.toFileSystemProviderErrorCode(error) !== files.FileSystemProviderErrorCode.FileExists) {
          throw error;
        }
      }
    }
  }
  static _handleError(err) {
    if (err instanceof FileSystemError) {
      throw err;
    }
    if (err instanceof files.FileSystemProviderError) {
      switch (err.code) {
        case files.FileSystemProviderErrorCode.FileExists:
          throw FileSystemError.FileExists(err.message);
        case files.FileSystemProviderErrorCode.FileNotFound:
          throw FileSystemError.FileNotFound(err.message);
        case files.FileSystemProviderErrorCode.FileNotADirectory:
          throw FileSystemError.FileNotADirectory(err.message);
        case files.FileSystemProviderErrorCode.FileIsADirectory:
          throw FileSystemError.FileIsADirectory(err.message);
        case files.FileSystemProviderErrorCode.NoPermissions:
          throw FileSystemError.NoPermissions(err.message);
        case files.FileSystemProviderErrorCode.Unavailable:
          throw FileSystemError.Unavailable(err.message);
        default:
          throw new FileSystemError(
            err.message,
            err.name
          );
      }
    }
    if (!(err instanceof Error)) {
      throw new FileSystemError(String(err));
    }
    if (err.name === "ENOPRO" || err.message.includes("ENOPRO")) {
      throw FileSystemError.Unavailable(err.message);
    }
    switch (err.name) {
      case files.FileSystemProviderErrorCode.FileExists:
        throw FileSystemError.FileExists(err.message);
      case files.FileSystemProviderErrorCode.FileNotFound:
        throw FileSystemError.FileNotFound(err.message);
      case files.FileSystemProviderErrorCode.FileNotADirectory:
        throw FileSystemError.FileNotADirectory(err.message);
      case files.FileSystemProviderErrorCode.FileIsADirectory:
        throw FileSystemError.FileIsADirectory(err.message);
      case files.FileSystemProviderErrorCode.NoPermissions:
        throw FileSystemError.NoPermissions(err.message);
      case files.FileSystemProviderErrorCode.Unavailable:
        throw FileSystemError.Unavailable(err.message);
      default:
        throw new FileSystemError(
          err.message,
          err.name
        );
    }
  }
  // ---
  addFileSystemProvider(scheme, provider, options) {
    this._fileSystemProvider.set(scheme, {
      impl: provider,
      extUri: options?.isCaseSensitive ? extUri : extUriIgnorePathCase,
      isReadonly: !!options?.isReadonly
    });
    return toDisposable(() => this._fileSystemProvider.delete(scheme));
  }
  getFileSystemProviderExtUri(scheme) {
    return this._fileSystemProvider.get(scheme)?.extUri ?? extUri;
  }
};
ExtHostConsumerFileSystem = __decorateClass([
  __decorateParam(0, IExtHostRpcService),
  __decorateParam(1, IExtHostFileSystemInfo)
], ExtHostConsumerFileSystem);
const IExtHostConsumerFileSystem = createDecorator("IExtHostConsumerFileSystem");
export {
  ExtHostConsumerFileSystem,
  IExtHostConsumerFileSystem
};
