var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import assert from "assert";
import { CancellationToken } from "../../../../../base/common/cancellation.js";
import {
  DisposableStore
} from "../../../../../base/common/lifecycle.js";
import { extUri } from "../../../../../base/common/resources.js";
import { URI } from "../../../../../base/common/uri.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { TestConfigurationService } from "../../../../../platform/configuration/test/common/testConfigurationService.js";
import { SyncDescriptor } from "../../../../../platform/instantiation/common/descriptors.js";
import { Registry } from "../../../../../platform/registry/common/platform.js";
import { ITelemetryService } from "../../../../../platform/telemetry/common/telemetry.js";
import { NullTelemetryService } from "../../../../../platform/telemetry/common/telemetryUtils.js";
import { TestThemeService } from "../../../../../platform/theme/test/common/testThemeService.js";
import { IWorkspaceTrustManagementService } from "../../../../../platform/workspace/common/workspaceTrust.js";
import {
  EditorPaneDescriptor
} from "../../../../browser/editor.js";
import {
  EditorMemento,
  EditorPane
} from "../../../../browser/parts/editor/editorPane.js";
import { WorkspaceTrustRequiredPlaceholderEditor } from "../../../../browser/parts/editor/editorPlaceholder.js";
import {
  EditorExtensions,
  EditorInputCapabilities
} from "../../../../common/editor.js";
import { EditorInput } from "../../../../common/editor/editorInput.js";
import { TextResourceEditorInput } from "../../../../common/editor/textResourceEditorInput.js";
import { EditorService } from "../../../../services/editor/browser/editorService.js";
import {
  IEditorGroupsService
} from "../../../../services/editor/common/editorGroupsService.js";
import { IEditorService } from "../../../../services/editor/common/editorService.js";
import {
  TestStorageService,
  TestWorkspaceTrustManagementService
} from "../../../common/workbenchTestServices.js";
import {
  TestEditorGroupView,
  TestEditorGroupsService,
  TestEditorInput,
  TestTextResourceConfigurationService,
  createEditorPart,
  registerTestResourceEditor,
  workbenchInstantiationService
} from "../../workbenchTestServices.js";
const NullThemeService = new TestThemeService();
const editorRegistry = Registry.as(
  EditorExtensions.EditorPane
);
const editorInputRegistry = Registry.as(
  EditorExtensions.EditorFactory
);
class TestEditor extends EditorPane {
  constructor(group) {
    const disposables = new DisposableStore();
    super(
      "TestEditor",
      group,
      NullTelemetryService,
      NullThemeService,
      disposables.add(new TestStorageService())
    );
    this._register(disposables);
  }
  getId() {
    return "testEditor";
  }
  layout() {
  }
  createEditor() {
  }
}
class OtherTestEditor extends EditorPane {
  constructor(group) {
    const disposables = new DisposableStore();
    super(
      "testOtherEditor",
      group,
      NullTelemetryService,
      NullThemeService,
      disposables.add(new TestStorageService())
    );
    this._register(disposables);
  }
  getId() {
    return "testOtherEditor";
  }
  layout() {
  }
  createEditor() {
  }
}
class TestInputSerializer {
  canSerialize(editorInput) {
    return true;
  }
  serialize(input) {
    return input.toString();
  }
  deserialize(instantiationService, raw) {
    return {};
  }
}
class TestInput extends EditorInput {
  resource = void 0;
  prefersEditorPane(editors) {
    return editors[1];
  }
  get typeId() {
    return "testInput";
  }
  resolve() {
    return null;
  }
}
class OtherTestInput extends EditorInput {
  resource = void 0;
  get typeId() {
    return "otherTestInput";
  }
  resolve() {
    return null;
  }
}
class TestResourceEditorInput extends TextResourceEditorInput {
}
suite("EditorPane", () => {
  const disposables = new DisposableStore();
  teardown(() => {
    disposables.clear();
  });
  test("EditorPane API", async () => {
    const group = new TestEditorGroupView(1);
    const editor = new TestEditor(group);
    assert.ok(editor.group);
    const input = disposables.add(new OtherTestInput());
    const options = {};
    assert(!editor.isVisible());
    assert(!editor.input);
    await editor.setInput(
      input,
      options,
      /* @__PURE__ */ Object.create(null),
      CancellationToken.None
    );
    assert.strictEqual(input, editor.input);
    editor.setVisible(true);
    assert(editor.isVisible());
    editor.dispose();
    editor.clearInput();
    editor.setVisible(false);
    assert(!editor.isVisible());
    assert(!editor.input);
    assert(!editor.getControl());
  });
  test("EditorPaneDescriptor", () => {
    const editorDescriptor = EditorPaneDescriptor.create(
      TestEditor,
      "id",
      "name"
    );
    assert.strictEqual(editorDescriptor.typeId, "id");
    assert.strictEqual(editorDescriptor.name, "name");
  });
  test("Editor Pane Registration", () => {
    const editorDescriptor1 = EditorPaneDescriptor.create(
      TestEditor,
      "id1",
      "name"
    );
    const editorDescriptor2 = EditorPaneDescriptor.create(
      OtherTestEditor,
      "id2",
      "name"
    );
    const oldEditorsCnt = editorRegistry.getEditorPanes().length;
    const oldInputCnt = editorRegistry.getEditors().length;
    disposables.add(
      editorRegistry.registerEditorPane(editorDescriptor1, [
        new SyncDescriptor(TestInput)
      ])
    );
    disposables.add(
      editorRegistry.registerEditorPane(editorDescriptor2, [
        new SyncDescriptor(TestInput),
        new SyncDescriptor(OtherTestInput)
      ])
    );
    assert.strictEqual(
      editorRegistry.getEditorPanes().length,
      oldEditorsCnt + 2
    );
    assert.strictEqual(editorRegistry.getEditors().length, oldInputCnt + 3);
    assert.strictEqual(
      editorRegistry.getEditorPane(disposables.add(new TestInput())),
      editorDescriptor2
    );
    assert.strictEqual(
      editorRegistry.getEditorPane(disposables.add(new OtherTestInput())),
      editorDescriptor2
    );
    assert.strictEqual(
      editorRegistry.getEditorPaneByType("id1"),
      editorDescriptor1
    );
    assert.strictEqual(
      editorRegistry.getEditorPaneByType("id2"),
      editorDescriptor2
    );
    assert(!editorRegistry.getEditorPaneByType("id3"));
  });
  test("Editor Pane Lookup favors specific class over superclass (match on specific class)", () => {
    const d1 = EditorPaneDescriptor.create(TestEditor, "id1", "name");
    disposables.add(registerTestResourceEditor());
    disposables.add(
      editorRegistry.registerEditorPane(d1, [
        new SyncDescriptor(TestResourceEditorInput)
      ])
    );
    const inst = workbenchInstantiationService(void 0, disposables);
    const group = new TestEditorGroupView(1);
    const editor = disposables.add(
      editorRegistry.getEditorPane(
        disposables.add(
          inst.createInstance(
            TestResourceEditorInput,
            URI.file("/fake"),
            "fake",
            "",
            void 0,
            void 0
          )
        )
      ).instantiate(inst, group)
    );
    assert.strictEqual(editor.getId(), "testEditor");
    const otherEditor = disposables.add(
      editorRegistry.getEditorPane(
        disposables.add(
          inst.createInstance(
            TextResourceEditorInput,
            URI.file("/fake"),
            "fake",
            "",
            void 0,
            void 0
          )
        )
      ).instantiate(inst, group)
    );
    assert.strictEqual(
      otherEditor.getId(),
      "workbench.editors.textResourceEditor"
    );
  });
  test("Editor Pane Lookup favors specific class over superclass (match on super class)", () => {
    const inst = workbenchInstantiationService(void 0, disposables);
    const group = new TestEditorGroupView(1);
    disposables.add(registerTestResourceEditor());
    const editor = disposables.add(
      editorRegistry.getEditorPane(
        disposables.add(
          inst.createInstance(
            TestResourceEditorInput,
            URI.file("/fake"),
            "fake",
            "",
            void 0,
            void 0
          )
        )
      ).instantiate(inst, group)
    );
    assert.strictEqual(
      "workbench.editors.textResourceEditor",
      editor.getId()
    );
  });
  test("Editor Input Serializer", () => {
    const testInput = disposables.add(
      new TestEditorInput(URI.file("/fake"), "testTypeId")
    );
    workbenchInstantiationService(void 0, disposables).invokeFunction(
      (accessor) => editorInputRegistry.start(accessor)
    );
    disposables.add(
      editorInputRegistry.registerEditorSerializer(
        testInput.typeId,
        TestInputSerializer
      )
    );
    let factory = editorInputRegistry.getEditorSerializer("testTypeId");
    assert(factory);
    factory = editorInputRegistry.getEditorSerializer(testInput);
    assert(factory);
    assert.throws(
      () => editorInputRegistry.registerEditorSerializer(
        testInput.typeId,
        TestInputSerializer
      )
    );
  });
  test("EditorMemento - basics", () => {
    const testGroup0 = new TestEditorGroupView(0);
    const testGroup1 = new TestEditorGroupView(1);
    const testGroup4 = new TestEditorGroupView(4);
    const configurationService = new TestTextResourceConfigurationService();
    const editorGroupService = new TestEditorGroupsService([
      testGroup0,
      testGroup1,
      new TestEditorGroupView(2)
    ]);
    const rawMemento = /* @__PURE__ */ Object.create(null);
    let memento = disposables.add(
      new EditorMemento(
        "id",
        "key",
        rawMemento,
        3,
        editorGroupService,
        configurationService
      )
    );
    let res = memento.loadEditorState(testGroup0, URI.file("/A"));
    assert.ok(!res);
    memento.saveEditorState(testGroup0, URI.file("/A"), { line: 3 });
    res = memento.loadEditorState(testGroup0, URI.file("/A"));
    assert.ok(res);
    assert.strictEqual(res.line, 3);
    memento.saveEditorState(testGroup1, URI.file("/A"), { line: 5 });
    res = memento.loadEditorState(testGroup1, URI.file("/A"));
    assert.ok(res);
    assert.strictEqual(res.line, 5);
    memento.saveEditorState(testGroup0, URI.file("/B"), { line: 1 });
    memento.saveEditorState(testGroup0, URI.file("/C"), { line: 1 });
    memento.saveEditorState(testGroup0, URI.file("/D"), { line: 1 });
    memento.saveEditorState(testGroup0, URI.file("/E"), { line: 1 });
    assert.ok(!memento.loadEditorState(testGroup0, URI.file("/A")));
    assert.ok(!memento.loadEditorState(testGroup0, URI.file("/B")));
    assert.ok(memento.loadEditorState(testGroup0, URI.file("/C")));
    assert.ok(memento.loadEditorState(testGroup0, URI.file("/D")));
    assert.ok(memento.loadEditorState(testGroup0, URI.file("/E")));
    memento.saveEditorState(testGroup4, URI.file("/E"), { line: 1 });
    assert.ok(memento.loadEditorState(testGroup4, URI.file("/E")));
    memento.saveEditorState(testGroup4, URI.file("/C"), { line: 1 });
    assert.ok(memento.loadEditorState(testGroup4, URI.file("/C")));
    memento.saveState();
    memento = disposables.add(
      new EditorMemento(
        "id",
        "key",
        rawMemento,
        3,
        editorGroupService,
        configurationService
      )
    );
    assert.ok(memento.loadEditorState(testGroup0, URI.file("/C")));
    assert.ok(memento.loadEditorState(testGroup0, URI.file("/D")));
    assert.ok(memento.loadEditorState(testGroup0, URI.file("/E")));
    assert.ok(!memento.loadEditorState(testGroup4, URI.file("/E")));
    assert.ok(!memento.loadEditorState(testGroup4, URI.file("/C")));
    memento.clearEditorState(URI.file("/C"), testGroup4);
    memento.clearEditorState(URI.file("/E"));
    assert.ok(!memento.loadEditorState(testGroup4, URI.file("/C")));
    assert.ok(memento.loadEditorState(testGroup0, URI.file("/D")));
    assert.ok(!memento.loadEditorState(testGroup0, URI.file("/E")));
  });
  test("EditorMemento - move", () => {
    const testGroup0 = new TestEditorGroupView(0);
    const configurationService = new TestTextResourceConfigurationService();
    const editorGroupService = new TestEditorGroupsService([testGroup0]);
    const rawMemento = /* @__PURE__ */ Object.create(null);
    const memento = disposables.add(
      new EditorMemento(
        "id",
        "key",
        rawMemento,
        3,
        editorGroupService,
        configurationService
      )
    );
    memento.saveEditorState(
      testGroup0,
      URI.file("/some/folder/file-1.txt"),
      { line: 1 }
    );
    memento.saveEditorState(
      testGroup0,
      URI.file("/some/folder/file-2.txt"),
      { line: 2 }
    );
    memento.saveEditorState(testGroup0, URI.file("/some/other/file.txt"), {
      line: 3
    });
    memento.moveEditorState(
      URI.file("/some/folder/file-1.txt"),
      URI.file("/some/folder/file-moved.txt"),
      extUri
    );
    let res = memento.loadEditorState(
      testGroup0,
      URI.file("/some/folder/file-1.txt")
    );
    assert.ok(!res);
    res = memento.loadEditorState(
      testGroup0,
      URI.file("/some/folder/file-moved.txt")
    );
    assert.strictEqual(res?.line, 1);
    memento.moveEditorState(
      URI.file("/some/folder"),
      URI.file("/some/folder-moved"),
      extUri
    );
    res = memento.loadEditorState(
      testGroup0,
      URI.file("/some/folder-moved/file-moved.txt")
    );
    assert.strictEqual(res?.line, 1);
    res = memento.loadEditorState(
      testGroup0,
      URI.file("/some/folder-moved/file-2.txt")
    );
    assert.strictEqual(res?.line, 2);
  });
  test("EditoMemento - use with editor input", () => {
    const testGroup0 = new TestEditorGroupView(0);
    class TestEditorInput2 extends EditorInput {
      constructor(resource, id = "testEditorInputForMementoTest") {
        super();
        this.resource = resource;
        this.id = id;
      }
      get typeId() {
        return "testEditorInputForMementoTest";
      }
      async resolve() {
        return null;
      }
      matches(other) {
        return other && this.id === other.id && other instanceof TestEditorInput2;
      }
    }
    const rawMemento = /* @__PURE__ */ Object.create(null);
    const memento = disposables.add(
      new EditorMemento(
        "id",
        "key",
        rawMemento,
        3,
        new TestEditorGroupsService(),
        new TestTextResourceConfigurationService()
      )
    );
    const testInputA = disposables.add(new TestEditorInput2(URI.file("/A")));
    let res = memento.loadEditorState(testGroup0, testInputA);
    assert.ok(!res);
    memento.saveEditorState(testGroup0, testInputA, { line: 3 });
    res = memento.loadEditorState(testGroup0, testInputA);
    assert.ok(res);
    assert.strictEqual(res.line, 3);
    testInputA.dispose();
    res = memento.loadEditorState(testGroup0, testInputA);
    assert.ok(!res);
  });
  test("EditoMemento - clear on editor dispose", () => {
    const testGroup0 = new TestEditorGroupView(0);
    class TestEditorInput2 extends EditorInput {
      constructor(resource, id = "testEditorInputForMementoTest") {
        super();
        this.resource = resource;
        this.id = id;
      }
      get typeId() {
        return "testEditorInputForMementoTest";
      }
      async resolve() {
        return null;
      }
      matches(other) {
        return other && this.id === other.id && other instanceof TestEditorInput2;
      }
    }
    const rawMemento = /* @__PURE__ */ Object.create(null);
    const memento = disposables.add(
      new EditorMemento(
        "id",
        "key",
        rawMemento,
        3,
        new TestEditorGroupsService(),
        new TestTextResourceConfigurationService()
      )
    );
    const testInputA = disposables.add(new TestEditorInput2(URI.file("/A")));
    let res = memento.loadEditorState(testGroup0, testInputA);
    assert.ok(!res);
    memento.saveEditorState(testGroup0, testInputA.resource, { line: 3 });
    res = memento.loadEditorState(testGroup0, testInputA);
    assert.ok(res);
    assert.strictEqual(res.line, 3);
    testInputA.dispose();
    res = memento.loadEditorState(testGroup0, testInputA);
    assert.ok(res);
    const testInputB = disposables.add(new TestEditorInput2(URI.file("/B")));
    res = memento.loadEditorState(testGroup0, testInputB);
    assert.ok(!res);
    memento.saveEditorState(testGroup0, testInputB.resource, { line: 3 });
    res = memento.loadEditorState(testGroup0, testInputB);
    assert.ok(res);
    assert.strictEqual(res.line, 3);
    memento.clearEditorStateOnDispose(testInputB.resource, testInputB);
    testInputB.dispose();
    res = memento.loadEditorState(testGroup0, testInputB);
    assert.ok(!res);
  });
  test("EditorMemento - workbench.editor.sharedViewState", () => {
    const testGroup0 = new TestEditorGroupView(0);
    const testGroup1 = new TestEditorGroupView(1);
    const configurationService = new TestTextResourceConfigurationService(
      new TestConfigurationService({
        workbench: {
          editor: {
            sharedViewState: true
          }
        }
      })
    );
    const editorGroupService = new TestEditorGroupsService([testGroup0]);
    const rawMemento = /* @__PURE__ */ Object.create(null);
    const memento = disposables.add(
      new EditorMemento(
        "id",
        "key",
        rawMemento,
        3,
        editorGroupService,
        configurationService
      )
    );
    const resource = URI.file("/some/folder/file-1.txt");
    memento.saveEditorState(testGroup0, resource, { line: 1 });
    let res = memento.loadEditorState(testGroup0, resource);
    assert.strictEqual(res.line, 1);
    res = memento.loadEditorState(testGroup1, resource);
    assert.strictEqual(res.line, 1);
    memento.saveEditorState(testGroup0, resource, { line: 3 });
    res = memento.loadEditorState(testGroup1, resource);
    assert.strictEqual(res.line, 3);
    memento.saveEditorState(testGroup1, resource, { line: 1 });
    res = memento.loadEditorState(testGroup1, resource);
    assert.strictEqual(res.line, 1);
    memento.clearEditorState(resource, testGroup0);
    memento.clearEditorState(resource, testGroup1);
    res = memento.loadEditorState(testGroup1, resource);
    assert.strictEqual(res.line, 1);
    memento.clearEditorState(resource);
    res = memento.loadEditorState(testGroup1, resource);
    assert.ok(!res);
  });
  test("WorkspaceTrustRequiredEditor", async () => {
    let TrustRequiredTestEditor = class extends EditorPane {
      constructor(group2, telemetryService) {
        super(
          "TestEditor",
          group2,
          NullTelemetryService,
          NullThemeService,
          disposables.add(new TestStorageService())
        );
      }
      getId() {
        return "trustRequiredTestEditor";
      }
      layout() {
      }
      createEditor() {
      }
    };
    TrustRequiredTestEditor = __decorateClass([
      __decorateParam(1, ITelemetryService)
    ], TrustRequiredTestEditor);
    class TrustRequiredTestInput extends EditorInput {
      resource = void 0;
      get typeId() {
        return "trustRequiredTestInput";
      }
      get capabilities() {
        return EditorInputCapabilities.RequiresTrust;
      }
      resolve() {
        return null;
      }
    }
    const instantiationService = workbenchInstantiationService(
      void 0,
      disposables
    );
    const workspaceTrustService = disposables.add(
      instantiationService.createInstance(
        TestWorkspaceTrustManagementService
      )
    );
    instantiationService.stub(
      IWorkspaceTrustManagementService,
      workspaceTrustService
    );
    workspaceTrustService.setWorkspaceTrust(false);
    const editorPart = await createEditorPart(
      instantiationService,
      disposables
    );
    instantiationService.stub(IEditorGroupsService, editorPart);
    const editorService = disposables.add(
      instantiationService.createInstance(EditorService, void 0)
    );
    instantiationService.stub(IEditorService, editorService);
    const group = editorPart.activeGroup;
    const editorDescriptor = EditorPaneDescriptor.create(
      TrustRequiredTestEditor,
      "id1",
      "name"
    );
    disposables.add(
      editorRegistry.registerEditorPane(editorDescriptor, [
        new SyncDescriptor(TrustRequiredTestInput)
      ])
    );
    const testInput = disposables.add(new TrustRequiredTestInput());
    await group.openEditor(testInput);
    assert.strictEqual(
      group.activeEditorPane?.getId(),
      WorkspaceTrustRequiredPlaceholderEditor.ID
    );
    const getEditorPaneIdAsync = () => new Promise((resolve) => {
      disposables.add(
        editorService.onDidActiveEditorChange(() => {
          resolve(group.activeEditorPane?.getId());
        })
      );
    });
    workspaceTrustService.setWorkspaceTrust(true);
    assert.strictEqual(
      await getEditorPaneIdAsync(),
      "trustRequiredTestEditor"
    );
    workspaceTrustService.setWorkspaceTrust(false);
    assert.strictEqual(
      await getEditorPaneIdAsync(),
      WorkspaceTrustRequiredPlaceholderEditor.ID
    );
    await group.closeAllEditors();
  });
  ensureNoDisposablesAreLeakedInTestSuite();
});
