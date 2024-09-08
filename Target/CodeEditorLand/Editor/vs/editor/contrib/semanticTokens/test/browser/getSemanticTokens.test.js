import assert from "assert";
import { CancellationToken } from "../../../../../base/common/cancellation.js";
import { canceled } from "../../../../../base/common/errors.js";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { LanguageFeatureRegistry } from "../../../../common/languageFeatureRegistry.js";
import { createTextModel } from "../../../../test/common/testTextModel.js";
import { getDocumentSemanticTokens } from "../../common/getSemanticTokens.js";
suite("getSemanticTokens", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  test("issue #136540: semantic highlighting flickers", async () => {
    const disposables = new DisposableStore();
    const registry = new LanguageFeatureRegistry();
    const provider = new class {
      getLegend() {
        return { tokenTypes: ["test"], tokenModifiers: [] };
      }
      provideDocumentSemanticTokens(model, lastResultId, token) {
        throw canceled();
      }
      releaseDocumentSemanticTokens(resultId) {
      }
    }();
    disposables.add(registry.register("testLang", provider));
    const textModel = disposables.add(
      createTextModel("example", "testLang")
    );
    await getDocumentSemanticTokens(
      registry,
      textModel,
      null,
      null,
      CancellationToken.None
    ).then(
      (res) => {
        assert.fail();
      },
      (err) => {
        assert.ok(!!err);
      }
    );
    disposables.dispose();
  });
});
