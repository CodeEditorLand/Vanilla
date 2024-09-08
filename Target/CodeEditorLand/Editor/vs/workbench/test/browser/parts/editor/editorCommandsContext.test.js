import assert from "assert";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import { URI } from "../../../../../base/common/uri.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { SyncDescriptor } from "../../../../../platform/instantiation/common/descriptors.js";
import { resolveCommandsContext } from "../../../../browser/parts/editor/editorCommandsContext.js";
import { EditorService } from "../../../../services/editor/browser/editorService.js";
import {
  GroupDirection,
  IEditorGroupsService
} from "../../../../services/editor/common/editorGroupsService.js";
import { IEditorService } from "../../../../services/editor/common/editorService.js";
import {
  TestEditorInput,
  TestFileEditorInput,
  TestServiceAccessor,
  createEditorPart,
  registerTestEditor,
  registerTestFileEditor,
  registerTestResourceEditor,
  registerTestSideBySideEditor,
  workbenchInstantiationService
} from "../../workbenchTestServices.js";
class TestListService {
  lastFocusedList = void 0;
}
suite("Resolving Editor Commands Context", () => {
  const disposables = new DisposableStore();
  const TEST_EDITOR_ID = "MyTestEditorForEditors";
  let instantiationService;
  let accessor;
  const testListService = new TestListService();
  setup(() => {
    instantiationService = workbenchInstantiationService(
      void 0,
      disposables
    );
    accessor = instantiationService.createInstance(TestServiceAccessor);
    disposables.add(accessor.untitledTextEditorService);
    disposables.add(registerTestFileEditor());
    disposables.add(registerTestSideBySideEditor());
    disposables.add(registerTestResourceEditor());
    disposables.add(
      registerTestEditor(TEST_EDITOR_ID, [
        new SyncDescriptor(TestFileEditorInput)
      ])
    );
  });
  teardown(() => {
    disposables.clear();
  });
  let index = 0;
  function input(id = String(index++)) {
    return disposables.add(
      new TestEditorInput(URI.parse(`file://${id}`), "testInput")
    );
  }
  async function createServices() {
    const instantiationService2 = workbenchInstantiationService(
      void 0,
      disposables
    );
    const part = await createEditorPart(instantiationService2, disposables);
    instantiationService2.stub(IEditorGroupsService, part);
    const editorService = disposables.add(
      instantiationService2.createInstance(EditorService, void 0)
    );
    instantiationService2.stub(IEditorService, editorService);
    return instantiationService2.createInstance(TestServiceAccessor);
  }
  test("use editor group selection", async () => {
    const accessor2 = await createServices();
    const activeGroup = accessor2.editorGroupService.activeGroup;
    const input1 = input();
    const input2 = input();
    const input3 = input();
    activeGroup.openEditor(input1, { pinned: true });
    activeGroup.openEditor(input2, { pinned: true });
    activeGroup.openEditor(input3, { pinned: true });
    activeGroup.setSelection(input1, [input2]);
    const editorCommandContext = {
      groupId: activeGroup.id,
      editorIndex: activeGroup.getIndexOfEditor(input1),
      preserveFocus: true
    };
    const resolvedContext1 = resolveCommandsContext(
      [editorCommandContext],
      accessor2.editorService,
      accessor2.editorGroupService,
      testListService
    );
    assert.strictEqual(resolvedContext1.groupedEditors.length, 1);
    assert.strictEqual(
      resolvedContext1.groupedEditors[0].group.id,
      activeGroup.id
    );
    assert.strictEqual(
      resolvedContext1.groupedEditors[0].editors.length,
      2
    );
    assert.strictEqual(
      resolvedContext1.groupedEditors[0].editors[0],
      input1
    );
    assert.strictEqual(
      resolvedContext1.groupedEditors[0].editors[1],
      input2
    );
    assert.strictEqual(resolvedContext1.preserveFocus, true);
    const resolvedContext2 = resolveCommandsContext(
      [input2.resource],
      accessor2.editorService,
      accessor2.editorGroupService,
      testListService
    );
    assert.strictEqual(resolvedContext2.groupedEditors.length, 1);
    assert.strictEqual(
      resolvedContext2.groupedEditors[0].group.id,
      activeGroup.id
    );
    assert.strictEqual(
      resolvedContext2.groupedEditors[0].editors.length,
      2
    );
    assert.strictEqual(
      resolvedContext2.groupedEditors[0].editors[0],
      input2
    );
    assert.strictEqual(
      resolvedContext2.groupedEditors[0].editors[1],
      input1
    );
    assert.strictEqual(resolvedContext2.preserveFocus, false);
    const editor1CommandContext = {
      groupId: activeGroup.id,
      editorIndex: activeGroup.getIndexOfEditor(input1),
      preserveFocus: true
    };
    const resolvedContext3 = resolveCommandsContext(
      [editor1CommandContext],
      accessor2.editorService,
      accessor2.editorGroupService,
      testListService
    );
    assert.strictEqual(resolvedContext3.groupedEditors.length, 1);
    assert.strictEqual(
      resolvedContext3.groupedEditors[0].group.id,
      activeGroup.id
    );
    assert.strictEqual(
      resolvedContext3.groupedEditors[0].editors.length,
      2
    );
    assert.strictEqual(
      resolvedContext3.groupedEditors[0].editors[0],
      input1
    );
    assert.strictEqual(
      resolvedContext3.groupedEditors[0].editors[1],
      input2
    );
    assert.strictEqual(resolvedContext3.preserveFocus, true);
  });
  test("don't use editor group selection", async () => {
    const accessor2 = await createServices();
    const activeGroup = accessor2.editorGroupService.activeGroup;
    const input1 = input();
    const input2 = input();
    const input3 = input();
    activeGroup.openEditor(input1, { pinned: true });
    activeGroup.openEditor(input2, { pinned: true });
    activeGroup.openEditor(input3, { pinned: true });
    activeGroup.setSelection(input1, [input2]);
    const editorCommandContext = {
      groupId: activeGroup.id,
      editorIndex: activeGroup.getIndexOfEditor(input3),
      preserveFocus: true
    };
    const resolvedContext1 = resolveCommandsContext(
      [editorCommandContext],
      accessor2.editorService,
      accessor2.editorGroupService,
      testListService
    );
    assert.strictEqual(resolvedContext1.groupedEditors.length, 1);
    assert.strictEqual(
      resolvedContext1.groupedEditors[0].group.id,
      activeGroup.id
    );
    assert.strictEqual(
      resolvedContext1.groupedEditors[0].editors.length,
      1
    );
    assert.strictEqual(
      resolvedContext1.groupedEditors[0].editors[0],
      input3
    );
    assert.strictEqual(resolvedContext1.preserveFocus, true);
    const resolvedContext2 = resolveCommandsContext(
      [input3.resource],
      accessor2.editorService,
      accessor2.editorGroupService,
      testListService
    );
    assert.strictEqual(resolvedContext2.groupedEditors.length, 1);
    assert.strictEqual(
      resolvedContext2.groupedEditors[0].group.id,
      activeGroup.id
    );
    assert.strictEqual(
      resolvedContext2.groupedEditors[0].editors.length,
      1
    );
    assert.strictEqual(
      resolvedContext2.groupedEditors[0].editors[0],
      input3
    );
    assert.strictEqual(resolvedContext2.preserveFocus, false);
  });
  test("inactive edior group command context", async () => {
    const accessor2 = await createServices();
    const editorGroupService = accessor2.editorGroupService;
    const group1 = editorGroupService.activeGroup;
    const group2 = editorGroupService.addGroup(
      group1,
      GroupDirection.RIGHT
    );
    const input11 = input();
    const input12 = input();
    group1.openEditor(input11, { pinned: true });
    group1.openEditor(input12, { pinned: true });
    const input21 = input();
    group2.openEditor(input21, { pinned: true });
    editorGroupService.activateGroup(group1);
    group1.setSelection(input11, [input12]);
    const editorCommandContext1 = {
      groupId: group2.id,
      editorIndex: group2.getIndexOfEditor(input21),
      preserveFocus: true
    };
    const resolvedContext1 = resolveCommandsContext(
      [editorCommandContext1],
      accessor2.editorService,
      accessor2.editorGroupService,
      testListService
    );
    assert.strictEqual(resolvedContext1.groupedEditors.length, 1);
    assert.strictEqual(
      resolvedContext1.groupedEditors[0].group.id,
      group2.id
    );
    assert.strictEqual(
      resolvedContext1.groupedEditors[0].editors.length,
      1
    );
    assert.strictEqual(
      resolvedContext1.groupedEditors[0].editors[0],
      input21
    );
    assert.strictEqual(resolvedContext1.preserveFocus, true);
    const editorCommandContext2 = {
      groupId: group2.id,
      preserveFocus: true
    };
    const resolvedContext2 = resolveCommandsContext(
      [editorCommandContext2],
      accessor2.editorService,
      accessor2.editorGroupService,
      testListService
    );
    assert.strictEqual(resolvedContext2.groupedEditors.length, 1);
    assert.strictEqual(
      resolvedContext2.groupedEditors[0].group.id,
      group2.id
    );
    assert.strictEqual(
      resolvedContext2.groupedEditors[0].editors.length,
      1
    );
    assert.strictEqual(
      resolvedContext1.groupedEditors[0].editors[0],
      input21
    );
    assert.strictEqual(resolvedContext2.preserveFocus, true);
  });
  ensureNoDisposablesAreLeakedInTestSuite();
});
