var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { Disposable, IDisposable } from "../../../../base/common/lifecycle.js";
import { ReadableStreamEvents } from "../../../../base/common/stream.js";
import { URI } from "../../../../base/common/uri.js";
import { IFileDeleteOptions, IFileOpenOptions, IFileOverwriteOptions, FileSystemProviderCapabilities, FileType, IFileWriteOptions, IFileChange, IFileSystemProvider, IStat, IWatchOptions, IFileReadStreamOptions } from "../../common/files.js";
class NullFileSystemProvider {
  constructor(disposableFactory = () => Disposable.None) {
    this.disposableFactory = disposableFactory;
  }
  static {
    __name(this, "NullFileSystemProvider");
  }
  capabilities = FileSystemProviderCapabilities.Readonly;
  _onDidChangeCapabilities = new Emitter();
  onDidChangeCapabilities = this._onDidChangeCapabilities.event;
  _onDidChangeFile = new Emitter();
  onDidChangeFile = this._onDidChangeFile.event;
  emitFileChangeEvents(changes) {
    this._onDidChangeFile.fire(changes);
  }
  setCapabilities(capabilities) {
    this.capabilities = capabilities;
    this._onDidChangeCapabilities.fire();
  }
  watch(resource, opts) {
    return this.disposableFactory();
  }
  async stat(resource) {
    return void 0;
  }
  async mkdir(resource) {
    return void 0;
  }
  async readdir(resource) {
    return void 0;
  }
  async delete(resource, opts) {
    return void 0;
  }
  async rename(from, to, opts) {
    return void 0;
  }
  async copy(from, to, opts) {
    return void 0;
  }
  async readFile(resource) {
    return void 0;
  }
  readFileStream(resource, opts, token) {
    return void 0;
  }
  async writeFile(resource, content, opts) {
    return void 0;
  }
  async open(resource, opts) {
    return void 0;
  }
  async close(fd) {
    return void 0;
  }
  async read(fd, pos, data, offset, length) {
    return void 0;
  }
  async write(fd, pos, data, offset, length) {
    return void 0;
  }
}
export {
  NullFileSystemProvider
};
//# sourceMappingURL=nullFileSystemProvider.js.map
