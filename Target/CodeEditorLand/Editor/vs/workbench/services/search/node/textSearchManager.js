import * as pfs from "../../../../base/node/pfs.js";
import { toCanonicalName } from "../../textfile/common/encoding.js";
import { TextSearchManager } from "../common/textSearchManager.js";
class NativeTextSearchManager extends TextSearchManager {
  constructor(query, provider, _pfs = pfs, processType = "searchProcess") {
    super(
      { query, provider },
      {
        readdir: (resource) => _pfs.Promises.readdir(resource.fsPath),
        toCanonicalName: (name) => toCanonicalName(name)
      },
      processType
    );
  }
}
export {
  NativeTextSearchManager
};
