var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { toDisposable } from "../../../../base/common/lifecycle.js";
import { IDocumentDiff, IDocumentDiffProvider, IDocumentDiffProviderOptions } from "../../../common/diff/documentDiffProvider.js";
import { linesDiffComputers } from "../../../common/diff/linesDiffComputers.js";
import { ITextModel } from "../../../common/model.js";
import { Event } from "../../../../base/common/event.js";
import { IDiffProviderFactoryService } from "../../../browser/widget/diffEditor/diffProviderFactoryService.js";
class TestDiffProviderFactoryService {
  static {
    __name(this, "TestDiffProviderFactoryService");
  }
  createDiffProvider() {
    return new SyncDocumentDiffProvider();
  }
}
class SyncDocumentDiffProvider {
  static {
    __name(this, "SyncDocumentDiffProvider");
  }
  computeDiff(original, modified, options, cancellationToken) {
    const result = linesDiffComputers.getDefault().computeDiff(original.getLinesContent(), modified.getLinesContent(), options);
    return Promise.resolve({
      changes: result.changes,
      quitEarly: result.hitTimeout,
      identical: original.getValue() === modified.getValue(),
      moves: result.moves
    });
  }
  onDidChange = /* @__PURE__ */ __name(() => toDisposable(() => {
  }), "onDidChange");
}
export {
  TestDiffProviderFactoryService
};
//# sourceMappingURL=testDiffProviderFactoryService.js.map
