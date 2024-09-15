var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IGrammarContributions, EmmetEditorAction } from "../../browser/emmetActions.js";
import { withTestCodeEditor } from "../../../../../editor/test/browser/testCodeEditor.js";
import assert from "assert";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import { ILanguageService } from "../../../../../editor/common/languages/language.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
class MockGrammarContributions {
  static {
    __name(this, "MockGrammarContributions");
  }
  scopeName;
  constructor(scopeName) {
    this.scopeName = scopeName;
  }
  getGrammar(mode) {
    return this.scopeName;
  }
}
suite("Emmet", () => {
  test("Get language mode and parent mode for emmet", () => {
    withTestCodeEditor([], {}, (editor, viewModel, instantiationService) => {
      const languageService = instantiationService.get(ILanguageService);
      const disposables = new DisposableStore();
      disposables.add(languageService.registerLanguage({ id: "markdown" }));
      disposables.add(languageService.registerLanguage({ id: "handlebars" }));
      disposables.add(languageService.registerLanguage({ id: "nunjucks" }));
      disposables.add(languageService.registerLanguage({ id: "laravel-blade" }));
      function testIsEnabled(mode, scopeName, expectedLanguage, expectedParentLanguage) {
        const model = editor.getModel();
        if (!model) {
          assert.fail("Editor model not found");
        }
        model.setLanguage(mode);
        const langOutput = EmmetEditorAction.getLanguage(editor, new MockGrammarContributions(scopeName));
        if (!langOutput) {
          assert.fail("langOutput not found");
        }
        assert.strictEqual(langOutput.language, expectedLanguage);
        assert.strictEqual(langOutput.parentMode, expectedParentLanguage);
      }
      __name(testIsEnabled, "testIsEnabled");
      testIsEnabled("markdown", "text.html.markdown", "markdown", "html");
      testIsEnabled("handlebars", "text.html.handlebars", "handlebars", "html");
      testIsEnabled("nunjucks", "text.html.nunjucks", "nunjucks", "html");
      testIsEnabled("laravel-blade", "text.html.php.laravel-blade", "laravel-blade", "html");
      disposables.dispose();
    });
  });
  ensureNoDisposablesAreLeakedInTestSuite();
});
//# sourceMappingURL=emmetAction.test.js.map
