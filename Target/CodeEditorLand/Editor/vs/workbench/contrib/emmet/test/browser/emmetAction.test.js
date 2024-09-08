import assert from "assert";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { ILanguageService } from "../../../../../editor/common/languages/language.js";
import { withTestCodeEditor } from "../../../../../editor/test/browser/testCodeEditor.js";
import {
  EmmetEditorAction
} from "../../browser/emmetActions.js";
class MockGrammarContributions {
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
    withTestCodeEditor(
      [],
      {},
      (editor, viewModel, instantiationService) => {
        const languageService = instantiationService.get(ILanguageService);
        const disposables = new DisposableStore();
        disposables.add(
          languageService.registerLanguage({ id: "markdown" })
        );
        disposables.add(
          languageService.registerLanguage({ id: "handlebars" })
        );
        disposables.add(
          languageService.registerLanguage({ id: "nunjucks" })
        );
        disposables.add(
          languageService.registerLanguage({ id: "laravel-blade" })
        );
        function testIsEnabled(mode, scopeName, expectedLanguage, expectedParentLanguage) {
          const model = editor.getModel();
          if (!model) {
            assert.fail("Editor model not found");
          }
          model.setLanguage(mode);
          const langOutput = EmmetEditorAction.getLanguage(
            editor,
            new MockGrammarContributions(scopeName)
          );
          if (!langOutput) {
            assert.fail("langOutput not found");
          }
          assert.strictEqual(langOutput.language, expectedLanguage);
          assert.strictEqual(
            langOutput.parentMode,
            expectedParentLanguage
          );
        }
        testIsEnabled(
          "markdown",
          "text.html.markdown",
          "markdown",
          "html"
        );
        testIsEnabled(
          "handlebars",
          "text.html.handlebars",
          "handlebars",
          "html"
        );
        testIsEnabled(
          "nunjucks",
          "text.html.nunjucks",
          "nunjucks",
          "html"
        );
        testIsEnabled(
          "laravel-blade",
          "text.html.php.laravel-blade",
          "laravel-blade",
          "html"
        );
        disposables.dispose();
      }
    );
  });
  ensureNoDisposablesAreLeakedInTestSuite();
});
