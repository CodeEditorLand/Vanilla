var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
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
import { Emitter, Event } from "../../../../../base/common/event.js";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import { URI } from "../../../../../base/common/uri.js";
import { mock } from "../../../../../base/test/common/mock.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { TestInstantiationService } from "../../../../../platform/instantiation/test/common/instantiationServiceMock.js";
import { GroupIdentifier, IEditorCloseEvent, IEditorWillMoveEvent } from "../../../../common/editor.js";
import { NotebookEditorWidget } from "../../browser/notebookEditorWidget.js";
import { NotebookEditorWidgetService } from "../../browser/services/notebookEditorServiceImpl.js";
import { NotebookEditorInput } from "../../common/notebookEditorInput.js";
import { setupInstantiationService } from "./testNotebookEditor.js";
import { IEditorGroup, IEditorGroupsService, IEditorPart } from "../../../../services/editor/common/editorGroupsService.js";
import { IEditorService } from "../../../../services/editor/common/editorService.js";
let TestNotebookEditorWidgetService = class extends NotebookEditorWidgetService {
  static {
    __name(this, "TestNotebookEditorWidgetService");
  }
  constructor(editorGroupService, editorService, contextKeyService, instantiationService) {
    super(editorGroupService, editorService, contextKeyService, instantiationService);
  }
  createWidget() {
    return new class extends mock() {
      onWillHide = /* @__PURE__ */ __name(() => {
      }, "onWillHide");
      getDomNode = /* @__PURE__ */ __name(() => {
        return { remove: /* @__PURE__ */ __name(() => {
        }, "remove") };
      }, "getDomNode");
      dispose = /* @__PURE__ */ __name(() => {
      }, "dispose");
    }();
  }
};
TestNotebookEditorWidgetService = __decorateClass([
  __decorateParam(0, IEditorGroupsService),
  __decorateParam(1, IEditorService),
  __decorateParam(2, IContextKeyService),
  __decorateParam(3, IInstantiationService)
], TestNotebookEditorWidgetService);
function createNotebookInput(path, editorType) {
  return new class extends mock() {
    resource = URI.parse(path);
    get typeId() {
      return editorType;
    }
  }();
}
__name(createNotebookInput, "createNotebookInput");
suite("NotebookEditorWidgetService", () => {
  let disposables;
  let instantiationService;
  let editorGroup1;
  let editorGroup2;
  let ondidRemoveGroup;
  let onDidCloseEditor;
  let onWillMoveEditor;
  teardown(() => disposables.dispose());
  ensureNoDisposablesAreLeakedInTestSuite();
  setup(() => {
    disposables = new DisposableStore();
    ondidRemoveGroup = new Emitter();
    onDidCloseEditor = new Emitter();
    onWillMoveEditor = new Emitter();
    editorGroup1 = new class extends mock() {
      id = 1;
      onDidCloseEditor = onDidCloseEditor.event;
      onWillMoveEditor = onWillMoveEditor.event;
    }();
    editorGroup2 = new class extends mock() {
      id = 2;
      onDidCloseEditor = Event.None;
      onWillMoveEditor = Event.None;
    }();
    instantiationService = setupInstantiationService(disposables);
    instantiationService.stub(IEditorGroupsService, new class extends mock() {
      onDidRemoveGroup = ondidRemoveGroup.event;
      onDidAddGroup = Event.None;
      whenReady = Promise.resolve();
      groups = [editorGroup1, editorGroup2];
      getPart(container) {
        return { windowId: 0 };
      }
    }());
    instantiationService.stub(IEditorService, new class extends mock() {
      onDidEditorsChange = Event.None;
    }());
  });
  test("Retrieve widget within group", async function() {
    const notebookEditorInput = createNotebookInput("/test.np", "type1");
    const notebookEditorService = disposables.add(instantiationService.createInstance(TestNotebookEditorWidgetService));
    const widget = notebookEditorService.retrieveWidget(instantiationService, 1, notebookEditorInput);
    const value = widget.value;
    const widget2 = notebookEditorService.retrieveWidget(instantiationService, 1, notebookEditorInput);
    assert.notStrictEqual(widget2.value, void 0, "should create a widget");
    assert.strictEqual(value, widget2.value, "should return the same widget");
    assert.strictEqual(widget.value, void 0, "initial borrow should no longer have widget");
  });
  test("Retrieve independent widgets", async function() {
    const inputType1 = createNotebookInput("/test.np", "type1");
    const inputType2 = createNotebookInput("/test.np", "type2");
    const notebookEditorService = disposables.add(instantiationService.createInstance(TestNotebookEditorWidgetService));
    const widget = notebookEditorService.retrieveWidget(instantiationService, 1, inputType1);
    const widgetDiffGroup = notebookEditorService.retrieveWidget(instantiationService, 2, inputType1);
    const widgetDiffType = notebookEditorService.retrieveWidget(instantiationService, 1, inputType2);
    assert.notStrictEqual(widget.value, void 0, "should create a widget");
    assert.notStrictEqual(widgetDiffGroup.value, void 0, "should create a widget");
    assert.notStrictEqual(widgetDiffType.value, void 0, "should create a widget");
    assert.notStrictEqual(widget.value, widgetDiffGroup.value, "should return a different widget");
    assert.notStrictEqual(widget.value, widgetDiffType.value, "should return a different widget");
  });
  test("Only relevant widgets get disposed", async function() {
    const inputType1 = createNotebookInput("/test.np", "type1");
    const inputType2 = createNotebookInput("/test.np", "type2");
    const notebookEditorService = disposables.add(instantiationService.createInstance(TestNotebookEditorWidgetService));
    const widget = notebookEditorService.retrieveWidget(instantiationService, 1, inputType1);
    const widgetDiffType = notebookEditorService.retrieveWidget(instantiationService, 1, inputType2);
    const widgetDiffGroup = notebookEditorService.retrieveWidget(instantiationService, 2, inputType1);
    ondidRemoveGroup.fire(editorGroup1);
    assert.strictEqual(widget.value, void 0, "widgets in group should get disposed");
    assert.strictEqual(widgetDiffType.value, void 0, "widgets in group should get disposed");
    assert.notStrictEqual(widgetDiffGroup.value, void 0, "other group should not be disposed");
  });
  test("Widget should move between groups when editor is moved", async function() {
    const inputType1 = createNotebookInput("/test.np", NotebookEditorInput.ID);
    const notebookEditorService = disposables.add(instantiationService.createInstance(TestNotebookEditorWidgetService));
    const initialValue = notebookEditorService.retrieveWidget(instantiationService, 1, inputType1).value;
    await new Promise((resolve) => setTimeout(resolve, 0));
    onWillMoveEditor.fire({
      editor: inputType1,
      groupId: 1,
      target: 2
    });
    const widgetDiffGroup = notebookEditorService.retrieveWidget(instantiationService, 2, inputType1);
    const widgetFirstGroup = notebookEditorService.retrieveWidget(instantiationService, 1, inputType1);
    assert.notStrictEqual(initialValue, void 0, "valid widget");
    assert.strictEqual(widgetDiffGroup.value, initialValue, "widget should be reused in new group");
    assert.notStrictEqual(widgetFirstGroup.value, initialValue, "should create a new widget in the first group");
  });
});
//# sourceMappingURL=NotebookEditorWidgetService.test.js.map
