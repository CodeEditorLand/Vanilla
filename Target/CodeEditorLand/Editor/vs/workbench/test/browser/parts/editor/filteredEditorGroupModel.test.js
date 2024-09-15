var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { EditorGroupModel, ISerializedEditorGroupModel } from "../../../../common/editor/editorGroupModel.js";
import { EditorExtensions, IEditorFactoryRegistry, IFileEditorInput, IEditorSerializer, EditorsOrder, GroupModelChangeKind } from "../../../../common/editor.js";
import { URI } from "../../../../../base/common/uri.js";
import { TestLifecycleService } from "../../workbenchTestServices.js";
import { TestConfigurationService } from "../../../../../platform/configuration/test/common/testConfigurationService.js";
import { TestInstantiationService } from "../../../../../platform/instantiation/test/common/instantiationServiceMock.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { ILifecycleService } from "../../../../services/lifecycle/common/lifecycle.js";
import { IWorkspaceContextService } from "../../../../../platform/workspace/common/workspace.js";
import { Registry } from "../../../../../platform/registry/common/platform.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { ITelemetryService } from "../../../../../platform/telemetry/common/telemetry.js";
import { NullTelemetryService } from "../../../../../platform/telemetry/common/telemetryUtils.js";
import { IStorageService } from "../../../../../platform/storage/common/storage.js";
import { DisposableStore, IDisposable, toDisposable } from "../../../../../base/common/lifecycle.js";
import { TestContextService, TestStorageService } from "../../../common/workbenchTestServices.js";
import { EditorInput } from "../../../../common/editor/editorInput.js";
import { isEqual } from "../../../../../base/common/resources.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { StickyEditorGroupModel, UnstickyEditorGroupModel } from "../../../../common/editor/filteredEditorGroupModel.js";
suite("FilteredEditorGroupModel", () => {
  let testInstService;
  suiteTeardown(() => {
    testInstService?.dispose();
    testInstService = void 0;
  });
  function inst() {
    if (!testInstService) {
      testInstService = new TestInstantiationService();
    }
    const inst2 = testInstService;
    inst2.stub(IStorageService, disposables.add(new TestStorageService()));
    inst2.stub(ILifecycleService, disposables.add(new TestLifecycleService()));
    inst2.stub(IWorkspaceContextService, new TestContextService());
    inst2.stub(ITelemetryService, NullTelemetryService);
    const config = new TestConfigurationService();
    config.setUserConfiguration("workbench", { editor: { openPositioning: "right", focusRecentEditorAfterClose: true } });
    inst2.stub(IConfigurationService, config);
    return inst2;
  }
  __name(inst, "inst");
  function createEditorGroupModel(serialized) {
    const group = disposables.add(inst().createInstance(EditorGroupModel, serialized));
    disposables.add(toDisposable(() => {
      for (const editor of group.getEditors(EditorsOrder.MOST_RECENTLY_ACTIVE)) {
        group.closeEditor(editor);
      }
    }));
    return group;
  }
  __name(createEditorGroupModel, "createEditorGroupModel");
  let index = 0;
  class TestEditorInput extends EditorInput {
    constructor(id) {
      super();
      this.id = id;
    }
    static {
      __name(this, "TestEditorInput");
    }
    resource = void 0;
    get typeId() {
      return "testEditorInputForGroups";
    }
    async resolve() {
      return null;
    }
    matches(other) {
      return other && this.id === other.id && other instanceof TestEditorInput;
    }
    setDirty() {
      this._onDidChangeDirty.fire();
    }
    setLabel() {
      this._onDidChangeLabel.fire();
    }
  }
  class NonSerializableTestEditorInput extends EditorInput {
    constructor(id) {
      super();
      this.id = id;
    }
    static {
      __name(this, "NonSerializableTestEditorInput");
    }
    resource = void 0;
    get typeId() {
      return "testEditorInputForGroups-nonSerializable";
    }
    async resolve() {
      return null;
    }
    matches(other) {
      return other && this.id === other.id && other instanceof NonSerializableTestEditorInput;
    }
  }
  class TestFileEditorInput extends EditorInput {
    constructor(id, resource) {
      super();
      this.id = id;
      this.resource = resource;
    }
    static {
      __name(this, "TestFileEditorInput");
    }
    preferredResource = this.resource;
    get typeId() {
      return "testFileEditorInputForGroups";
    }
    get editorId() {
      return this.id;
    }
    async resolve() {
      return null;
    }
    setPreferredName(name) {
    }
    setPreferredDescription(description) {
    }
    setPreferredResource(resource) {
    }
    async setEncoding(encoding) {
    }
    getEncoding() {
      return void 0;
    }
    setPreferredEncoding(encoding) {
    }
    setForceOpenAsBinary() {
    }
    setPreferredContents(contents) {
    }
    setLanguageId(languageId) {
    }
    setPreferredLanguageId(languageId) {
    }
    isResolved() {
      return false;
    }
    matches(other) {
      if (super.matches(other)) {
        return true;
      }
      if (other instanceof TestFileEditorInput) {
        return isEqual(other.resource, this.resource);
      }
      return false;
    }
  }
  function input(id = String(index++), nonSerializable, resource) {
    if (resource) {
      return disposables.add(new TestFileEditorInput(id, resource));
    }
    return nonSerializable ? disposables.add(new NonSerializableTestEditorInput(id)) : disposables.add(new TestEditorInput(id));
  }
  __name(input, "input");
  function closeAllEditors(group) {
    for (const editor of group.getEditors(EditorsOrder.SEQUENTIAL)) {
      group.closeEditor(editor, void 0, false);
    }
  }
  __name(closeAllEditors, "closeAllEditors");
  class TestEditorInputSerializer {
    static {
      __name(this, "TestEditorInputSerializer");
    }
    static disableSerialize = false;
    static disableDeserialize = false;
    canSerialize(editorInput) {
      return true;
    }
    serialize(editorInput) {
      if (TestEditorInputSerializer.disableSerialize) {
        return void 0;
      }
      const testEditorInput = editorInput;
      const testInput = {
        id: testEditorInput.id
      };
      return JSON.stringify(testInput);
    }
    deserialize(instantiationService, serializedEditorInput) {
      if (TestEditorInputSerializer.disableDeserialize) {
        return void 0;
      }
      const testInput = JSON.parse(serializedEditorInput);
      return disposables.add(new TestEditorInput(testInput.id));
    }
  }
  const disposables = new DisposableStore();
  setup(() => {
    TestEditorInputSerializer.disableSerialize = false;
    TestEditorInputSerializer.disableDeserialize = false;
    disposables.add(Registry.as(EditorExtensions.EditorFactory).registerEditorSerializer("testEditorInputForGroups", TestEditorInputSerializer));
  });
  teardown(() => {
    disposables.clear();
    index = 1;
  });
  test("Sticky/Unsticky count", async () => {
    const model = createEditorGroupModel();
    const stickyFilteredEditorGroup = disposables.add(new StickyEditorGroupModel(model));
    const unstickyFilteredEditorGroup = disposables.add(new UnstickyEditorGroupModel(model));
    const input1 = input();
    const input2 = input();
    model.openEditor(input1, { pinned: true, sticky: true });
    model.openEditor(input2, { pinned: true, sticky: true });
    assert.strictEqual(stickyFilteredEditorGroup.count, 2);
    assert.strictEqual(unstickyFilteredEditorGroup.count, 0);
    model.unstick(input1);
    assert.strictEqual(stickyFilteredEditorGroup.count, 1);
    assert.strictEqual(unstickyFilteredEditorGroup.count, 1);
    model.unstick(input2);
    assert.strictEqual(stickyFilteredEditorGroup.count, 0);
    assert.strictEqual(unstickyFilteredEditorGroup.count, 2);
  });
  test("Sticky/Unsticky stickyCount", async () => {
    const model = createEditorGroupModel();
    const stickyFilteredEditorGroup = disposables.add(new StickyEditorGroupModel(model));
    const unstickyFilteredEditorGroup = disposables.add(new UnstickyEditorGroupModel(model));
    const input1 = input();
    const input2 = input();
    model.openEditor(input1, { pinned: true, sticky: true });
    model.openEditor(input2, { pinned: true, sticky: true });
    assert.strictEqual(stickyFilteredEditorGroup.stickyCount, 2);
    assert.strictEqual(unstickyFilteredEditorGroup.stickyCount, 0);
    model.unstick(input1);
    assert.strictEqual(stickyFilteredEditorGroup.stickyCount, 1);
    assert.strictEqual(unstickyFilteredEditorGroup.stickyCount, 0);
    model.unstick(input2);
    assert.strictEqual(stickyFilteredEditorGroup.stickyCount, 0);
    assert.strictEqual(unstickyFilteredEditorGroup.stickyCount, 0);
  });
  test("Sticky/Unsticky isEmpty", async () => {
    const model = createEditorGroupModel();
    const stickyFilteredEditorGroup = disposables.add(new StickyEditorGroupModel(model));
    const unstickyFilteredEditorGroup = disposables.add(new UnstickyEditorGroupModel(model));
    const input1 = input();
    const input2 = input();
    model.openEditor(input1, { pinned: true, sticky: false });
    model.openEditor(input2, { pinned: true, sticky: false });
    assert.strictEqual(stickyFilteredEditorGroup.count === 0, true);
    assert.strictEqual(unstickyFilteredEditorGroup.count === 0, false);
    model.stick(input1);
    assert.strictEqual(stickyFilteredEditorGroup.count === 0, false);
    assert.strictEqual(unstickyFilteredEditorGroup.count === 0, false);
    model.stick(input2);
    assert.strictEqual(stickyFilteredEditorGroup.count === 0, false);
    assert.strictEqual(unstickyFilteredEditorGroup.count === 0, true);
  });
  test("Sticky/Unsticky editors", async () => {
    const model = createEditorGroupModel();
    const stickyFilteredEditorGroup = disposables.add(new StickyEditorGroupModel(model));
    const unstickyFilteredEditorGroup = disposables.add(new UnstickyEditorGroupModel(model));
    const input1 = input();
    const input2 = input();
    model.openEditor(input1, { pinned: true, sticky: true });
    model.openEditor(input2, { pinned: true, sticky: true });
    assert.strictEqual(stickyFilteredEditorGroup.getEditors(EditorsOrder.SEQUENTIAL).length, 2);
    assert.strictEqual(unstickyFilteredEditorGroup.getEditors(EditorsOrder.SEQUENTIAL).length, 0);
    model.unstick(input1);
    assert.strictEqual(stickyFilteredEditorGroup.getEditors(EditorsOrder.SEQUENTIAL).length, 1);
    assert.strictEqual(unstickyFilteredEditorGroup.getEditors(EditorsOrder.SEQUENTIAL).length, 1);
    assert.strictEqual(stickyFilteredEditorGroup.getEditors(EditorsOrder.SEQUENTIAL)[0], input2);
    assert.strictEqual(unstickyFilteredEditorGroup.getEditors(EditorsOrder.SEQUENTIAL)[0], input1);
    model.unstick(input2);
    assert.strictEqual(stickyFilteredEditorGroup.getEditors(EditorsOrder.SEQUENTIAL).length, 0);
    assert.strictEqual(unstickyFilteredEditorGroup.getEditors(EditorsOrder.SEQUENTIAL).length, 2);
  });
  test("Sticky/Unsticky activeEditor", async () => {
    const model = createEditorGroupModel();
    const stickyFilteredEditorGroup = disposables.add(new StickyEditorGroupModel(model));
    const unstickyFilteredEditorGroup = disposables.add(new UnstickyEditorGroupModel(model));
    const input1 = input();
    const input2 = input();
    model.openEditor(input1, { pinned: true, sticky: true, active: true });
    assert.strictEqual(stickyFilteredEditorGroup.activeEditor, input1);
    assert.strictEqual(unstickyFilteredEditorGroup.activeEditor, null);
    model.openEditor(input2, { pinned: true, sticky: false, active: true });
    assert.strictEqual(stickyFilteredEditorGroup.activeEditor, null);
    assert.strictEqual(unstickyFilteredEditorGroup.activeEditor, input2);
    model.closeEditor(input1);
    assert.strictEqual(stickyFilteredEditorGroup.activeEditor, null);
    assert.strictEqual(unstickyFilteredEditorGroup.activeEditor, input2);
    model.closeEditor(input2);
    assert.strictEqual(stickyFilteredEditorGroup.activeEditor, null);
    assert.strictEqual(unstickyFilteredEditorGroup.activeEditor, null);
  });
  test("Sticky/Unsticky previewEditor", async () => {
    const model = createEditorGroupModel();
    const stickyFilteredEditorGroup = disposables.add(new StickyEditorGroupModel(model));
    const unstickyFilteredEditorGroup = disposables.add(new UnstickyEditorGroupModel(model));
    const input1 = input();
    const input2 = input();
    model.openEditor(input1);
    assert.strictEqual(stickyFilteredEditorGroup.previewEditor, null);
    assert.strictEqual(unstickyFilteredEditorGroup.previewEditor, input1);
    model.openEditor(input2, { sticky: true });
    assert.strictEqual(stickyFilteredEditorGroup.previewEditor, null);
    assert.strictEqual(unstickyFilteredEditorGroup.previewEditor, input1);
  });
  test("Sticky/Unsticky isSticky()", async () => {
    const model = createEditorGroupModel();
    const stickyFilteredEditorGroup = disposables.add(new StickyEditorGroupModel(model));
    const unstickyFilteredEditorGroup = disposables.add(new UnstickyEditorGroupModel(model));
    const input1 = input();
    const input2 = input();
    model.openEditor(input1, { pinned: true, sticky: true });
    model.openEditor(input2, { pinned: true, sticky: true });
    assert.strictEqual(stickyFilteredEditorGroup.isSticky(input1), true);
    assert.strictEqual(stickyFilteredEditorGroup.isSticky(input2), true);
    model.unstick(input1);
    model.closeEditor(input1);
    model.openEditor(input2, { pinned: true, sticky: true });
    assert.strictEqual(unstickyFilteredEditorGroup.isSticky(input1), false);
    assert.strictEqual(unstickyFilteredEditorGroup.isSticky(input2), false);
  });
  test("Sticky/Unsticky isPinned()", async () => {
    const model = createEditorGroupModel();
    const stickyFilteredEditorGroup = disposables.add(new StickyEditorGroupModel(model));
    const unstickyFilteredEditorGroup = disposables.add(new UnstickyEditorGroupModel(model));
    const input1 = input();
    const input2 = input();
    const input3 = input();
    const input4 = input();
    model.openEditor(input1, { pinned: true, sticky: true });
    model.openEditor(input2, { pinned: true, sticky: false });
    model.openEditor(input3, { pinned: false, sticky: true });
    model.openEditor(input4, { pinned: false, sticky: false });
    assert.strictEqual(stickyFilteredEditorGroup.isPinned(input1), true);
    assert.strictEqual(unstickyFilteredEditorGroup.isPinned(input2), true);
    assert.strictEqual(stickyFilteredEditorGroup.isPinned(input3), true);
    assert.strictEqual(unstickyFilteredEditorGroup.isPinned(input4), false);
  });
  test("Sticky/Unsticky isActive()", async () => {
    const model = createEditorGroupModel();
    const stickyFilteredEditorGroup = disposables.add(new StickyEditorGroupModel(model));
    const unstickyFilteredEditorGroup = disposables.add(new UnstickyEditorGroupModel(model));
    const input1 = input();
    const input2 = input();
    model.openEditor(input1, { pinned: true, sticky: true, active: true });
    assert.strictEqual(stickyFilteredEditorGroup.isActive(input1), true);
    model.openEditor(input2, { pinned: true, sticky: false, active: true });
    assert.strictEqual(stickyFilteredEditorGroup.isActive(input1), false);
    assert.strictEqual(unstickyFilteredEditorGroup.isActive(input2), true);
    model.unstick(input1);
    assert.strictEqual(unstickyFilteredEditorGroup.isActive(input1), false);
    assert.strictEqual(unstickyFilteredEditorGroup.isActive(input2), true);
  });
  test("Sticky/Unsticky getEditors()", async () => {
    const model = createEditorGroupModel();
    const stickyFilteredEditorGroup = disposables.add(new StickyEditorGroupModel(model));
    const unstickyFilteredEditorGroup = disposables.add(new UnstickyEditorGroupModel(model));
    const input1 = input();
    const input2 = input();
    model.openEditor(input1, { pinned: true, sticky: true, active: true });
    model.openEditor(input2, { pinned: true, sticky: true, active: true });
    assert.strictEqual(stickyFilteredEditorGroup.getEditors(EditorsOrder.SEQUENTIAL).length, 2);
    assert.strictEqual(stickyFilteredEditorGroup.getEditors(EditorsOrder.MOST_RECENTLY_ACTIVE).length, 2);
    assert.strictEqual(unstickyFilteredEditorGroup.getEditors(EditorsOrder.SEQUENTIAL).length, 0);
    assert.strictEqual(unstickyFilteredEditorGroup.getEditors(EditorsOrder.MOST_RECENTLY_ACTIVE).length, 0);
    assert.strictEqual(stickyFilteredEditorGroup.getEditors(EditorsOrder.SEQUENTIAL, { excludeSticky: true }).length, 0);
    assert.strictEqual(stickyFilteredEditorGroup.getEditors(EditorsOrder.SEQUENTIAL, { excludeSticky: false }).length, 2);
    assert.strictEqual(unstickyFilteredEditorGroup.getEditors(EditorsOrder.SEQUENTIAL, { excludeSticky: true }).length, 0);
    assert.strictEqual(unstickyFilteredEditorGroup.getEditors(EditorsOrder.SEQUENTIAL, { excludeSticky: false }).length, 0);
    assert.strictEqual(stickyFilteredEditorGroup.getEditors(EditorsOrder.MOST_RECENTLY_ACTIVE)[0], input2);
    assert.strictEqual(stickyFilteredEditorGroup.getEditors(EditorsOrder.MOST_RECENTLY_ACTIVE)[1], input1);
    model.unstick(input1);
    assert.strictEqual(stickyFilteredEditorGroup.getEditors(EditorsOrder.SEQUENTIAL).length, 1);
    assert.strictEqual(unstickyFilteredEditorGroup.getEditors(EditorsOrder.MOST_RECENTLY_ACTIVE).length, 1);
    assert.strictEqual(stickyFilteredEditorGroup.getEditors(EditorsOrder.MOST_RECENTLY_ACTIVE)[0], input2);
    assert.strictEqual(unstickyFilteredEditorGroup.getEditors(EditorsOrder.SEQUENTIAL)[0], input1);
    model.unstick(input2);
    assert.strictEqual(stickyFilteredEditorGroup.getEditors(EditorsOrder.SEQUENTIAL).length, 0);
    assert.strictEqual(unstickyFilteredEditorGroup.getEditors(EditorsOrder.MOST_RECENTLY_ACTIVE).length, 2);
    assert.strictEqual(unstickyFilteredEditorGroup.getEditors(EditorsOrder.MOST_RECENTLY_ACTIVE)[0], input2);
    assert.strictEqual(unstickyFilteredEditorGroup.getEditors(EditorsOrder.MOST_RECENTLY_ACTIVE)[1], input1);
    assert.strictEqual(unstickyFilteredEditorGroup.getEditors(EditorsOrder.SEQUENTIAL)[0], input2);
    assert.strictEqual(unstickyFilteredEditorGroup.getEditors(EditorsOrder.SEQUENTIAL)[1], input1);
  });
  test("Sticky/Unsticky getEditorByIndex()", async () => {
    const model = createEditorGroupModel();
    const stickyFilteredEditorGroup = disposables.add(new StickyEditorGroupModel(model));
    const unstickyFilteredEditorGroup = disposables.add(new UnstickyEditorGroupModel(model));
    const input1 = input();
    const input2 = input();
    const input3 = input();
    model.openEditor(input1, { pinned: true, sticky: true });
    model.openEditor(input2, { pinned: true, sticky: true });
    assert.strictEqual(stickyFilteredEditorGroup.getEditorByIndex(0), input1);
    assert.strictEqual(stickyFilteredEditorGroup.getEditorByIndex(1), input2);
    assert.strictEqual(stickyFilteredEditorGroup.getEditorByIndex(2), void 0);
    assert.strictEqual(unstickyFilteredEditorGroup.getEditorByIndex(0), void 0);
    assert.strictEqual(unstickyFilteredEditorGroup.getEditorByIndex(1), void 0);
    model.openEditor(input3, { pinned: true, sticky: false });
    assert.strictEqual(stickyFilteredEditorGroup.getEditorByIndex(0), input1);
    assert.strictEqual(stickyFilteredEditorGroup.getEditorByIndex(1), input2);
    assert.strictEqual(stickyFilteredEditorGroup.getEditorByIndex(2), void 0);
    assert.strictEqual(unstickyFilteredEditorGroup.getEditorByIndex(0), input3);
    assert.strictEqual(unstickyFilteredEditorGroup.getEditorByIndex(1), void 0);
    model.unstick(input1);
    assert.strictEqual(stickyFilteredEditorGroup.getEditorByIndex(0), input2);
    assert.strictEqual(stickyFilteredEditorGroup.getEditorByIndex(1), void 0);
    assert.strictEqual(unstickyFilteredEditorGroup.getEditorByIndex(0), input1);
    assert.strictEqual(unstickyFilteredEditorGroup.getEditorByIndex(1), input3);
    assert.strictEqual(unstickyFilteredEditorGroup.getEditorByIndex(2), void 0);
  });
  test("Sticky/Unsticky indexOf()", async () => {
    const model = createEditorGroupModel();
    const stickyFilteredEditorGroup = disposables.add(new StickyEditorGroupModel(model));
    const unstickyFilteredEditorGroup = disposables.add(new UnstickyEditorGroupModel(model));
    const input1 = input();
    const input2 = input();
    const input3 = input();
    model.openEditor(input1, { pinned: true, sticky: true });
    model.openEditor(input2, { pinned: true, sticky: true });
    assert.strictEqual(stickyFilteredEditorGroup.indexOf(input1), 0);
    assert.strictEqual(stickyFilteredEditorGroup.indexOf(input2), 1);
    assert.strictEqual(unstickyFilteredEditorGroup.indexOf(input1), -1);
    assert.strictEqual(unstickyFilteredEditorGroup.indexOf(input2), -1);
    model.openEditor(input3, { pinned: true, sticky: false });
    assert.strictEqual(stickyFilteredEditorGroup.indexOf(input1), 0);
    assert.strictEqual(stickyFilteredEditorGroup.indexOf(input2), 1);
    assert.strictEqual(stickyFilteredEditorGroup.indexOf(input3), -1);
    assert.strictEqual(unstickyFilteredEditorGroup.indexOf(input1), -1);
    assert.strictEqual(unstickyFilteredEditorGroup.indexOf(input2), -1);
    assert.strictEqual(unstickyFilteredEditorGroup.indexOf(input3), 0);
    model.unstick(input1);
    assert.strictEqual(stickyFilteredEditorGroup.indexOf(input1), -1);
    assert.strictEqual(stickyFilteredEditorGroup.indexOf(input2), 0);
    assert.strictEqual(stickyFilteredEditorGroup.indexOf(input3), -1);
    assert.strictEqual(unstickyFilteredEditorGroup.indexOf(input1), 0);
    assert.strictEqual(unstickyFilteredEditorGroup.indexOf(input2), -1);
    assert.strictEqual(unstickyFilteredEditorGroup.indexOf(input3), 1);
  });
  test("Sticky/Unsticky isFirst()", async () => {
    const model = createEditorGroupModel();
    const stickyFilteredEditorGroup = disposables.add(new StickyEditorGroupModel(model));
    const unstickyFilteredEditorGroup = disposables.add(new UnstickyEditorGroupModel(model));
    const input1 = input();
    const input2 = input();
    model.openEditor(input1, { pinned: true, sticky: true });
    assert.strictEqual(stickyFilteredEditorGroup.isFirst(input1), true);
    model.openEditor(input2, { pinned: true, sticky: true });
    assert.strictEqual(stickyFilteredEditorGroup.isFirst(input1), true);
    assert.strictEqual(stickyFilteredEditorGroup.isFirst(input2), false);
    model.unstick(input1);
    assert.strictEqual(unstickyFilteredEditorGroup.isFirst(input1), true);
    assert.strictEqual(stickyFilteredEditorGroup.isFirst(input2), true);
    model.unstick(input2);
    assert.strictEqual(unstickyFilteredEditorGroup.isFirst(input1), false);
    assert.strictEqual(unstickyFilteredEditorGroup.isFirst(input2), true);
    model.moveEditor(input2, 1);
    assert.strictEqual(unstickyFilteredEditorGroup.isFirst(input1), true);
    assert.strictEqual(unstickyFilteredEditorGroup.isFirst(input2), false);
  });
  test("Sticky/Unsticky isLast()", async () => {
    const model = createEditorGroupModel();
    const stickyFilteredEditorGroup = disposables.add(new StickyEditorGroupModel(model));
    const unstickyFilteredEditorGroup = disposables.add(new UnstickyEditorGroupModel(model));
    const input1 = input();
    const input2 = input();
    model.openEditor(input1, { pinned: true, sticky: true });
    assert.strictEqual(stickyFilteredEditorGroup.isLast(input1), true);
    model.openEditor(input2, { pinned: true, sticky: true });
    assert.strictEqual(stickyFilteredEditorGroup.isLast(input1), false);
    assert.strictEqual(stickyFilteredEditorGroup.isLast(input2), true);
    model.unstick(input1);
    assert.strictEqual(unstickyFilteredEditorGroup.isLast(input1), true);
    assert.strictEqual(stickyFilteredEditorGroup.isLast(input2), true);
    model.unstick(input2);
    assert.strictEqual(unstickyFilteredEditorGroup.isLast(input1), true);
    assert.strictEqual(unstickyFilteredEditorGroup.isLast(input2), false);
    model.moveEditor(input2, 1);
    assert.strictEqual(unstickyFilteredEditorGroup.isLast(input1), false);
    assert.strictEqual(unstickyFilteredEditorGroup.isLast(input2), true);
  });
  test("Sticky/Unsticky contains()", async () => {
    const model = createEditorGroupModel();
    const stickyFilteredEditorGroup = disposables.add(new StickyEditorGroupModel(model));
    const unstickyFilteredEditorGroup = disposables.add(new UnstickyEditorGroupModel(model));
    const input1 = input();
    const input2 = input();
    model.openEditor(input1, { pinned: true, sticky: true });
    model.openEditor(input2, { pinned: true, sticky: true });
    assert.strictEqual(stickyFilteredEditorGroup.contains(input1), true);
    assert.strictEqual(stickyFilteredEditorGroup.contains(input2), true);
    assert.strictEqual(unstickyFilteredEditorGroup.contains(input1), false);
    assert.strictEqual(unstickyFilteredEditorGroup.contains(input2), false);
    model.unstick(input1);
    assert.strictEqual(stickyFilteredEditorGroup.contains(input1), false);
    assert.strictEqual(stickyFilteredEditorGroup.contains(input2), true);
    assert.strictEqual(unstickyFilteredEditorGroup.contains(input1), true);
    assert.strictEqual(unstickyFilteredEditorGroup.contains(input2), false);
    model.unstick(input2);
    assert.strictEqual(stickyFilteredEditorGroup.contains(input1), false);
    assert.strictEqual(stickyFilteredEditorGroup.contains(input2), false);
    assert.strictEqual(unstickyFilteredEditorGroup.contains(input1), true);
    assert.strictEqual(unstickyFilteredEditorGroup.contains(input2), true);
  });
  test("Sticky/Unsticky group information", async () => {
    const model = createEditorGroupModel();
    const stickyFilteredEditorGroup = disposables.add(new StickyEditorGroupModel(model));
    const unstickyFilteredEditorGroup = disposables.add(new UnstickyEditorGroupModel(model));
    assert.strictEqual(stickyFilteredEditorGroup.id, model.id);
    assert.strictEqual(unstickyFilteredEditorGroup.id, model.id);
    assert.strictEqual(stickyFilteredEditorGroup.isLocked, model.isLocked);
    assert.strictEqual(unstickyFilteredEditorGroup.isLocked, model.isLocked);
    model.lock(true);
    assert.strictEqual(stickyFilteredEditorGroup.isLocked, model.isLocked);
    assert.strictEqual(unstickyFilteredEditorGroup.isLocked, model.isLocked);
    model.lock(false);
    assert.strictEqual(stickyFilteredEditorGroup.isLocked, model.isLocked);
    assert.strictEqual(unstickyFilteredEditorGroup.isLocked, model.isLocked);
  });
  test("Multiple Editors - Editor Emits Dirty and Label Changed", function() {
    const model1 = createEditorGroupModel();
    const model2 = createEditorGroupModel();
    const stickyFilteredEditorGroup1 = disposables.add(new StickyEditorGroupModel(model1));
    const unstickyFilteredEditorGroup1 = disposables.add(new UnstickyEditorGroupModel(model1));
    const stickyFilteredEditorGroup2 = disposables.add(new StickyEditorGroupModel(model2));
    const unstickyFilteredEditorGroup2 = disposables.add(new UnstickyEditorGroupModel(model2));
    const input1 = input();
    const input2 = input();
    model1.openEditor(input1, { pinned: true, active: true });
    model2.openEditor(input2, { pinned: true, active: true, sticky: true });
    let dirty1CounterSticky = 0;
    disposables.add(stickyFilteredEditorGroup1.onDidModelChange((e) => {
      if (e.kind === GroupModelChangeKind.EDITOR_DIRTY) {
        dirty1CounterSticky++;
      }
    }));
    let dirty1CounterUnsticky = 0;
    disposables.add(unstickyFilteredEditorGroup1.onDidModelChange((e) => {
      if (e.kind === GroupModelChangeKind.EDITOR_DIRTY) {
        dirty1CounterUnsticky++;
      }
    }));
    let dirty2CounterSticky = 0;
    disposables.add(stickyFilteredEditorGroup2.onDidModelChange((e) => {
      if (e.kind === GroupModelChangeKind.EDITOR_DIRTY) {
        dirty2CounterSticky++;
      }
    }));
    let dirty2CounterUnsticky = 0;
    disposables.add(unstickyFilteredEditorGroup2.onDidModelChange((e) => {
      if (e.kind === GroupModelChangeKind.EDITOR_DIRTY) {
        dirty2CounterUnsticky++;
      }
    }));
    let label1ChangeCounterSticky = 0;
    disposables.add(stickyFilteredEditorGroup1.onDidModelChange((e) => {
      if (e.kind === GroupModelChangeKind.EDITOR_LABEL) {
        label1ChangeCounterSticky++;
      }
    }));
    let label1ChangeCounterUnsticky = 0;
    disposables.add(unstickyFilteredEditorGroup1.onDidModelChange((e) => {
      if (e.kind === GroupModelChangeKind.EDITOR_LABEL) {
        label1ChangeCounterUnsticky++;
      }
    }));
    let label2ChangeCounterSticky = 0;
    disposables.add(stickyFilteredEditorGroup2.onDidModelChange((e) => {
      if (e.kind === GroupModelChangeKind.EDITOR_LABEL) {
        label2ChangeCounterSticky++;
      }
    }));
    let label2ChangeCounterUnsticky = 0;
    disposables.add(unstickyFilteredEditorGroup2.onDidModelChange((e) => {
      if (e.kind === GroupModelChangeKind.EDITOR_LABEL) {
        label2ChangeCounterUnsticky++;
      }
    }));
    input1.setDirty();
    input1.setLabel();
    assert.strictEqual(dirty1CounterSticky, 0);
    assert.strictEqual(dirty1CounterUnsticky, 1);
    assert.strictEqual(label1ChangeCounterSticky, 0);
    assert.strictEqual(label1ChangeCounterUnsticky, 1);
    input2.setDirty();
    input2.setLabel();
    assert.strictEqual(dirty2CounterSticky, 1);
    assert.strictEqual(dirty2CounterUnsticky, 0);
    assert.strictEqual(label2ChangeCounterSticky, 1);
    assert.strictEqual(label2ChangeCounterUnsticky, 0);
    closeAllEditors(model2);
    input2.setDirty();
    input2.setLabel();
    assert.strictEqual(dirty2CounterSticky, 1);
    assert.strictEqual(dirty2CounterUnsticky, 0);
    assert.strictEqual(label2ChangeCounterSticky, 1);
    assert.strictEqual(label2ChangeCounterUnsticky, 0);
    assert.strictEqual(dirty1CounterSticky, 0);
    assert.strictEqual(dirty1CounterUnsticky, 1);
    assert.strictEqual(label1ChangeCounterSticky, 0);
    assert.strictEqual(label1ChangeCounterUnsticky, 1);
  });
  test("Sticky/Unsticky isTransient()", async () => {
    const model = createEditorGroupModel();
    const stickyFilteredEditorGroup = disposables.add(new StickyEditorGroupModel(model));
    const unstickyFilteredEditorGroup = disposables.add(new UnstickyEditorGroupModel(model));
    const input1 = input();
    const input2 = input();
    const input3 = input();
    const input4 = input();
    model.openEditor(input1, { pinned: true, transient: false });
    model.openEditor(input2, { pinned: true });
    model.openEditor(input3, { pinned: true, transient: true });
    model.openEditor(input4, { pinned: false, transient: true });
    assert.strictEqual(stickyFilteredEditorGroup.isTransient(input1), false);
    assert.strictEqual(unstickyFilteredEditorGroup.isTransient(input2), false);
    assert.strictEqual(stickyFilteredEditorGroup.isTransient(input3), true);
    assert.strictEqual(unstickyFilteredEditorGroup.isTransient(input4), true);
  });
  ensureNoDisposablesAreLeakedInTestSuite();
});
//# sourceMappingURL=filteredEditorGroupModel.test.js.map
