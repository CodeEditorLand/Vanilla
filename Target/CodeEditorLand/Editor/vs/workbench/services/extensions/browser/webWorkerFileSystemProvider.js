import { NotSupportedError } from "../../../../base/common/errors.js";
import { Event } from "../../../../base/common/event.js";
import {
  Disposable
} from "../../../../base/common/lifecycle.js";
import {
  createFileSystemProviderError,
  FileSystemProviderCapabilities,
  FileSystemProviderErrorCode,
  FileType
} from "../../../../platform/files/common/files.js";
class FetchFileSystemProvider {
  capabilities = FileSystemProviderCapabilities.Readonly + FileSystemProviderCapabilities.FileReadWrite + FileSystemProviderCapabilities.PathCaseSensitive;
  onDidChangeCapabilities = Event.None;
  onDidChangeFile = Event.None;
  // working implementations
  async readFile(resource) {
    try {
      const res = await fetch(resource.toString(true));
      if (res.status === 200) {
        return new Uint8Array(await res.arrayBuffer());
      }
      throw createFileSystemProviderError(
        res.statusText,
        FileSystemProviderErrorCode.Unknown
      );
    } catch (err) {
      throw createFileSystemProviderError(
        err,
        FileSystemProviderErrorCode.Unknown
      );
    }
  }
  // fake implementations
  async stat(_resource) {
    return {
      type: FileType.File,
      size: 0,
      mtime: 0,
      ctime: 0
    };
  }
  watch() {
    return Disposable.None;
  }
  // error implementations
  writeFile(_resource, _content, _opts) {
    throw new NotSupportedError();
  }
  readdir(_resource) {
    throw new NotSupportedError();
  }
  mkdir(_resource) {
    throw new NotSupportedError();
  }
  delete(_resource, _opts) {
    throw new NotSupportedError();
  }
  rename(_from, _to, _opts) {
    throw new NotSupportedError();
  }
}
export {
  FetchFileSystemProvider
};
