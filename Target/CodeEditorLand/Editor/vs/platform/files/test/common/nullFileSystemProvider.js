import { Emitter } from "../../../../base/common/event.js";
import {
  Disposable
} from "../../../../base/common/lifecycle.js";
import {
  FileSystemProviderCapabilities
} from "../../common/files.js";
class NullFileSystemProvider {
  constructor(disposableFactory = () => Disposable.None) {
    this.disposableFactory = disposableFactory;
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
