var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { VSBuffer } from "../../../base/common/buffer.js";
import { CancellationToken } from "../../../base/common/cancellation.js";
import { toErrorMessage } from "../../../base/common/errorMessage.js";
import { canceled } from "../../../base/common/errors.js";
import { Emitter, Event } from "../../../base/common/event.js";
import { Disposable, DisposableStore, IDisposable, toDisposable } from "../../../base/common/lifecycle.js";
import { newWriteableStream, ReadableStreamEventPayload, ReadableStreamEvents } from "../../../base/common/stream.js";
import { URI } from "../../../base/common/uri.js";
import { generateUuid } from "../../../base/common/uuid.js";
import { IChannel } from "../../../base/parts/ipc/common/ipc.js";
import { createFileSystemProviderError, IFileAtomicReadOptions, IFileDeleteOptions, IFileOpenOptions, IFileOverwriteOptions, IFileReadStreamOptions, FileSystemProviderCapabilities, FileSystemProviderErrorCode, FileType, IFileWriteOptions, IFileChange, IFileSystemProviderWithFileAtomicReadCapability, IFileSystemProviderWithFileCloneCapability, IFileSystemProviderWithFileFolderCopyCapability, IFileSystemProviderWithFileReadStreamCapability, IFileSystemProviderWithFileReadWriteCapability, IFileSystemProviderWithOpenReadWriteCloseCapability, IStat, IWatchOptions, IFileSystemProviderError } from "./files.js";
import { reviveFileChanges } from "./watcher.js";
const LOCAL_FILE_SYSTEM_CHANNEL_NAME = "localFilesystem";
class DiskFileSystemProviderClient extends Disposable {
  constructor(channel, extraCapabilities) {
    super();
    this.channel = channel;
    this.extraCapabilities = extraCapabilities;
    this.registerFileChangeListeners();
  }
  static {
    __name(this, "DiskFileSystemProviderClient");
  }
  //#region File Capabilities
  onDidChangeCapabilities = Event.None;
  _capabilities;
  get capabilities() {
    if (!this._capabilities) {
      this._capabilities = FileSystemProviderCapabilities.FileReadWrite | FileSystemProviderCapabilities.FileOpenReadWriteClose | FileSystemProviderCapabilities.FileReadStream | FileSystemProviderCapabilities.FileFolderCopy | FileSystemProviderCapabilities.FileWriteUnlock | FileSystemProviderCapabilities.FileAtomicRead | FileSystemProviderCapabilities.FileAtomicWrite | FileSystemProviderCapabilities.FileAtomicDelete | FileSystemProviderCapabilities.FileClone;
      if (this.extraCapabilities.pathCaseSensitive) {
        this._capabilities |= FileSystemProviderCapabilities.PathCaseSensitive;
      }
      if (this.extraCapabilities.trash) {
        this._capabilities |= FileSystemProviderCapabilities.Trash;
      }
    }
    return this._capabilities;
  }
  //#endregion
  //#region File Metadata Resolving
  stat(resource) {
    return this.channel.call("stat", [resource]);
  }
  readdir(resource) {
    return this.channel.call("readdir", [resource]);
  }
  //#endregion
  //#region File Reading/Writing
  async readFile(resource, opts) {
    const { buffer } = await this.channel.call("readFile", [resource, opts]);
    return buffer;
  }
  readFileStream(resource, opts, token) {
    const stream = newWriteableStream((data) => VSBuffer.concat(data.map((data2) => VSBuffer.wrap(data2))).buffer);
    const disposables = new DisposableStore();
    disposables.add(this.channel.listen("readFileStream", [resource, opts])((dataOrErrorOrEnd) => {
      if (dataOrErrorOrEnd instanceof VSBuffer) {
        stream.write(dataOrErrorOrEnd.buffer);
      } else {
        if (dataOrErrorOrEnd === "end") {
          stream.end();
        } else {
          let error;
          if (dataOrErrorOrEnd instanceof Error) {
            error = dataOrErrorOrEnd;
          } else {
            const errorCandidate = dataOrErrorOrEnd;
            error = createFileSystemProviderError(errorCandidate.message ?? toErrorMessage(errorCandidate), errorCandidate.code ?? FileSystemProviderErrorCode.Unknown);
          }
          stream.error(error);
          stream.end();
        }
        disposables.dispose();
      }
    }));
    disposables.add(token.onCancellationRequested(() => {
      stream.error(canceled());
      stream.end();
      disposables.dispose();
    }));
    return stream;
  }
  writeFile(resource, content, opts) {
    return this.channel.call("writeFile", [resource, VSBuffer.wrap(content), opts]);
  }
  open(resource, opts) {
    return this.channel.call("open", [resource, opts]);
  }
  close(fd) {
    return this.channel.call("close", [fd]);
  }
  async read(fd, pos, data, offset, length) {
    const [bytes, bytesRead] = await this.channel.call("read", [fd, pos, length]);
    data.set(bytes.buffer.slice(0, bytesRead), offset);
    return bytesRead;
  }
  write(fd, pos, data, offset, length) {
    return this.channel.call("write", [fd, pos, VSBuffer.wrap(data), offset, length]);
  }
  //#endregion
  //#region Move/Copy/Delete/Create Folder
  mkdir(resource) {
    return this.channel.call("mkdir", [resource]);
  }
  delete(resource, opts) {
    return this.channel.call("delete", [resource, opts]);
  }
  rename(resource, target, opts) {
    return this.channel.call("rename", [resource, target, opts]);
  }
  copy(resource, target, opts) {
    return this.channel.call("copy", [resource, target, opts]);
  }
  //#endregion
  //#region Clone File
  cloneFile(resource, target) {
    return this.channel.call("cloneFile", [resource, target]);
  }
  //#endregion
  //#region File Watching
  _onDidChange = this._register(new Emitter());
  onDidChangeFile = this._onDidChange.event;
  _onDidWatchError = this._register(new Emitter());
  onDidWatchError = this._onDidWatchError.event;
  // The contract for file watching via remote is to identify us
  // via a unique but readonly session ID. Since the remote is
  // managing potentially many watchers from different clients,
  // this helps the server to properly partition events to the right
  // clients.
  sessionId = generateUuid();
  registerFileChangeListeners() {
    this._register(this.channel.listen("fileChange", [this.sessionId])((eventsOrError) => {
      if (Array.isArray(eventsOrError)) {
        const events = eventsOrError;
        this._onDidChange.fire(reviveFileChanges(events));
      } else {
        const error = eventsOrError;
        this._onDidWatchError.fire(error);
      }
    }));
  }
  watch(resource, opts) {
    const req = generateUuid();
    this.channel.call("watch", [this.sessionId, req, resource, opts]);
    return toDisposable(() => this.channel.call("unwatch", [this.sessionId, req]));
  }
  //#endregion
}
export {
  DiskFileSystemProviderClient,
  LOCAL_FILE_SYSTEM_CHANNEL_NAME
};
//# sourceMappingURL=diskFileSystemProviderClient.js.map
