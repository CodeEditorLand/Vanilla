import assert from "assert";
import { DeferredPromise } from "../../../../../base/common/async.js";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import {
  ensureNoDisposablesAreLeakedInTestSuite,
  toResource
} from "../../../../../base/test/common/utils.js";
import { Selection } from "../../../../../editor/common/core/selection.js";
import { TextEditorPaneSelection } from "../../../../browser/parts/editor/textEditor.js";
import {
  EditorPaneSelectionChangeReason,
  EditorPaneSelectionCompareResult,
  isEditorPaneWithSelection
} from "../../../../common/editor.js";
import { EditorService } from "../../../../services/editor/browser/editorService.js";
import { IEditorGroupsService } from "../../../../services/editor/common/editorGroupsService.js";
import { IEditorService } from "../../../../services/editor/common/editorService.js";
import {
  TestServiceAccessor,
  createEditorPart,
  registerTestFileEditor,
  workbenchInstantiationService
} from "../../workbenchTestServices.js";
suite("TextEditorPane", () => {
  const disposables = new DisposableStore();
  setup(() => {
    disposables.add(registerTestFileEditor());
  });
  teardown(() => {
    disposables.clear();
  });
  async function createServices() {
    const instantiationService = workbenchInstantiationService(
      void 0,
      disposables
    );
    const part = await createEditorPart(instantiationService, disposables);
    instantiationService.stub(IEditorGroupsService, part);
    const editorService = disposables.add(
      instantiationService.createInstance(EditorService, void 0)
    );
    instantiationService.stub(IEditorService, editorService);
    return instantiationService.createInstance(TestServiceAccessor);
  }
  test("editor pane selection", async function() {
    const accessor = await createServices();
    const resource = toResource.call(this, "/path/index.txt");
    let pane = await accessor.editorService.openEditor({
      resource
    });
    assert.ok(pane && isEditorPaneWithSelection(pane));
    const onDidFireSelectionEventOfEditType = new DeferredPromise();
    disposables.add(
      pane.onDidChangeSelection((e) => {
        if (e.reason === EditorPaneSelectionChangeReason.EDIT) {
          onDidFireSelectionEventOfEditType.complete(e);
        }
      })
    );
    const model = disposables.add(
      await accessor.textFileService.files.resolve(
        resource
      )
    );
    model.textEditorModel.setValue("Hello World");
    const event = await onDidFireSelectionEventOfEditType.p;
    assert.strictEqual(event.reason, EditorPaneSelectionChangeReason.EDIT);
    pane.setSelection(
      new Selection(1, 1, 1, 1),
      EditorPaneSelectionChangeReason.USER
    );
    const selection = pane.getSelection();
    assert.ok(selection);
    await pane.group.closeAllEditors();
    const options = selection.restore({});
    pane = await accessor.editorService.openEditor({
      resource,
      options
    });
    assert.ok(pane && isEditorPaneWithSelection(pane));
    const newSelection = pane.getSelection();
    assert.ok(newSelection);
    assert.strictEqual(
      newSelection.compare(selection),
      EditorPaneSelectionCompareResult.IDENTICAL
    );
    await model.revert();
    await pane.group.closeAllEditors();
  });
  test("TextEditorPaneSelection", () => {
    const sel1 = new TextEditorPaneSelection(new Selection(1, 1, 2, 2));
    const sel2 = new TextEditorPaneSelection(new Selection(5, 5, 6, 6));
    const sel3 = new TextEditorPaneSelection(new Selection(50, 50, 60, 60));
    const sel4 = {
      compare: () => {
        throw new Error();
      },
      restore: (options) => options
    };
    assert.strictEqual(
      sel1.compare(sel1),
      EditorPaneSelectionCompareResult.IDENTICAL
    );
    assert.strictEqual(
      sel1.compare(sel2),
      EditorPaneSelectionCompareResult.SIMILAR
    );
    assert.strictEqual(
      sel1.compare(sel3),
      EditorPaneSelectionCompareResult.DIFFERENT
    );
    assert.strictEqual(
      sel1.compare(sel4),
      EditorPaneSelectionCompareResult.DIFFERENT
    );
  });
  ensureNoDisposablesAreLeakedInTestSuite();
});
