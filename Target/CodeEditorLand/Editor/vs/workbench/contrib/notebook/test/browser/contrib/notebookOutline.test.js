import assert from "assert";
import { Event } from "../../../../../../base/common/event.js";
import { DisposableStore } from "../../../../../../base/common/lifecycle.js";
import { mock } from "../../../../../../base/test/common/mock.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../../base/test/common/utils.js";
import { ILanguageFeaturesService } from "../../../../../../editor/common/services/languageFeatures.js";
import { LanguageFeaturesService } from "../../../../../../editor/common/services/languageFeaturesService.js";
import { MarkerService } from "../../../../../../platform/markers/common/markerService.js";
import { IMarkerService } from "../../../../../../platform/markers/common/markers.js";
import {
  IThemeService
} from "../../../../../../platform/theme/common/themeService.js";
import { IEditorService } from "../../../../../services/editor/common/editorService.js";
import { OutlineTarget } from "../../../../../services/outline/browser/outline.js";
import { NotebookCellOutline } from "../../../browser/contrib/outline/notebookOutline.js";
import {
  CellKind
} from "../../../common/notebookCommon.js";
import {
  setupInstantiationService,
  withTestNotebook
} from "../testNotebookEditor.js";
suite("Notebook Outline", () => {
  let disposables;
  let instantiationService;
  teardown(() => disposables.dispose());
  ensureNoDisposablesAreLeakedInTestSuite();
  setup(() => {
    disposables = new DisposableStore();
    instantiationService = setupInstantiationService(disposables);
    instantiationService.set(
      IEditorService,
      new class extends mock() {
      }()
    );
    instantiationService.set(
      ILanguageFeaturesService,
      new LanguageFeaturesService()
    );
    instantiationService.set(
      IMarkerService,
      disposables.add(new MarkerService())
    );
    instantiationService.set(
      IThemeService,
      new class extends mock() {
        onDidFileIconThemeChange = Event.None;
        getFileIconTheme() {
          return {
            hasFileIcons: true,
            hasFolderIcons: true,
            hidesExplorerArrows: false
          };
        }
      }()
    );
  });
  function withNotebookOutline(cells, callback) {
    return withTestNotebook(cells, (editor) => {
      if (!editor.hasModel()) {
        assert.ok(false, "MUST have active text editor");
      }
      const outline = instantiationService.createInstance(
        NotebookCellOutline,
        new class extends mock() {
          getControl() {
            return editor;
          }
          onDidChangeModel = Event.None;
          onDidChangeSelection = Event.None;
        }(),
        OutlineTarget.OutlinePane
      );
      disposables.add(outline);
      return callback(outline, editor);
    });
  }
  test("basic", async () => {
    await withNotebookOutline([], (outline) => {
      assert.ok(outline instanceof NotebookCellOutline);
      assert.deepStrictEqual(
        outline.config.quickPickDataSource.getQuickPickElements(),
        []
      );
    });
  });
  test("special characters in heading", async () => {
    await withNotebookOutline(
      [["# Hell\xF6 & H\xE4llo", "md", CellKind.Markup]],
      (outline) => {
        assert.ok(outline instanceof NotebookCellOutline);
        assert.deepStrictEqual(
          outline.config.quickPickDataSource.getQuickPickElements().length,
          1
        );
        assert.deepStrictEqual(
          outline.config.quickPickDataSource.getQuickPickElements()[0].label,
          "Hell\xF6 & H\xE4llo"
        );
      }
    );
    await withNotebookOutline(
      [["# bo<i>ld</i>", "md", CellKind.Markup]],
      (outline) => {
        assert.ok(outline instanceof NotebookCellOutline);
        assert.deepStrictEqual(
          outline.config.quickPickDataSource.getQuickPickElements().length,
          1
        );
        assert.deepStrictEqual(
          outline.config.quickPickDataSource.getQuickPickElements()[0].label,
          "bold"
        );
      }
    );
  });
  test('Notebook falsely detects "empty cells"', async () => {
    await withNotebookOutline(
      [["  \u7684\u65F6\u4EE3   ", "md", CellKind.Markup]],
      (outline) => {
        assert.ok(outline instanceof NotebookCellOutline);
        assert.deepStrictEqual(
          outline.config.quickPickDataSource.getQuickPickElements().length,
          1
        );
        assert.deepStrictEqual(
          outline.config.quickPickDataSource.getQuickPickElements()[0].label,
          "\u7684\u65F6\u4EE3"
        );
      }
    );
    await withNotebookOutline(
      [["   ", "md", CellKind.Markup]],
      (outline) => {
        assert.ok(outline instanceof NotebookCellOutline);
        assert.deepStrictEqual(
          outline.config.quickPickDataSource.getQuickPickElements().length,
          1
        );
        assert.deepStrictEqual(
          outline.config.quickPickDataSource.getQuickPickElements()[0].label,
          "empty cell"
        );
      }
    );
    await withNotebookOutline(
      [["+++++[]{}--)(0  ", "md", CellKind.Markup]],
      (outline) => {
        assert.ok(outline instanceof NotebookCellOutline);
        assert.deepStrictEqual(
          outline.config.quickPickDataSource.getQuickPickElements().length,
          1
        );
        assert.deepStrictEqual(
          outline.config.quickPickDataSource.getQuickPickElements()[0].label,
          "+++++[]{}--)(0"
        );
      }
    );
    await withNotebookOutline(
      [["+++++[]{}--)(0 Hello **&^ ", "md", CellKind.Markup]],
      (outline) => {
        assert.ok(outline instanceof NotebookCellOutline);
        assert.deepStrictEqual(
          outline.config.quickPickDataSource.getQuickPickElements().length,
          1
        );
        assert.deepStrictEqual(
          outline.config.quickPickDataSource.getQuickPickElements()[0].label,
          "+++++[]{}--)(0 Hello **&^"
        );
      }
    );
    await withNotebookOutline(
      [["!@#$\n \xDCberschr\xEFft", "md", CellKind.Markup]],
      (outline) => {
        assert.ok(outline instanceof NotebookCellOutline);
        assert.deepStrictEqual(
          outline.config.quickPickDataSource.getQuickPickElements().length,
          1
        );
        assert.deepStrictEqual(
          outline.config.quickPickDataSource.getQuickPickElements()[0].label,
          "!@#$"
        );
      }
    );
  });
  test("Heading text defines entry label", async () => await withNotebookOutline(
    [["foo\n # h1", "md", CellKind.Markup]],
    (outline) => {
      assert.ok(outline instanceof NotebookCellOutline);
      assert.deepStrictEqual(
        outline.config.quickPickDataSource.getQuickPickElements().length,
        1
      );
      assert.deepStrictEqual(
        outline.config.quickPickDataSource.getQuickPickElements()[0].label,
        "h1"
      );
    }
  ));
  test("Notebook outline ignores markdown headings #115200", async () => {
    await withNotebookOutline(
      [["## h2 \n# h1", "md", CellKind.Markup]],
      (outline) => {
        assert.ok(outline instanceof NotebookCellOutline);
        assert.deepStrictEqual(
          outline.config.quickPickDataSource.getQuickPickElements().length,
          2
        );
        assert.deepStrictEqual(
          outline.config.quickPickDataSource.getQuickPickElements()[0].label,
          "h2"
        );
        assert.deepStrictEqual(
          outline.config.quickPickDataSource.getQuickPickElements()[1].label,
          "h1"
        );
      }
    );
    await withNotebookOutline(
      [
        ["## h2", "md", CellKind.Markup],
        ["# h1", "md", CellKind.Markup]
      ],
      (outline) => {
        assert.ok(outline instanceof NotebookCellOutline);
        assert.deepStrictEqual(
          outline.config.quickPickDataSource.getQuickPickElements().length,
          2
        );
        assert.deepStrictEqual(
          outline.config.quickPickDataSource.getQuickPickElements()[0].label,
          "h2"
        );
        assert.deepStrictEqual(
          outline.config.quickPickDataSource.getQuickPickElements()[1].label,
          "h1"
        );
      }
    );
  });
});
