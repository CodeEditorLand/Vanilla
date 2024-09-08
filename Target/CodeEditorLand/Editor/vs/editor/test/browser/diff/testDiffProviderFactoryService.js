import { toDisposable } from "../../../../base/common/lifecycle.js";
import { linesDiffComputers } from "../../../common/diff/linesDiffComputers.js";
class TestDiffProviderFactoryService {
  createDiffProvider() {
    return new SyncDocumentDiffProvider();
  }
}
class SyncDocumentDiffProvider {
  computeDiff(original, modified, options, cancellationToken) {
    const result = linesDiffComputers.getDefault().computeDiff(
      original.getLinesContent(),
      modified.getLinesContent(),
      options
    );
    return Promise.resolve({
      changes: result.changes,
      quitEarly: result.hitTimeout,
      identical: original.getValue() === modified.getValue(),
      moves: result.moves
    });
  }
  onDidChange = () => toDisposable(() => {
  });
}
export {
  TestDiffProviderFactoryService
};
