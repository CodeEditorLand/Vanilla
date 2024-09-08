import assert from "assert";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import { URI } from "../../../../../base/common/uri.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import {
  TestEditorService,
  TestServiceAccessor,
  createEditorPart,
  registerTestResourceEditor,
  workbenchInstantiationService
} from "../../../../test/browser/workbenchTestServices.js";
import { TestWorkingCopy } from "../../../../test/common/workbenchTestServices.js";
import { EditorService } from "../../../editor/browser/editorService.js";
import { IEditorGroupsService } from "../../../editor/common/editorGroupsService.js";
import { UntitledTextEditorInput } from "../../../untitled/common/untitledTextEditorInput.js";
import {
  WorkingCopyEditorService
} from "../../common/workingCopyEditorService.js";
suite("WorkingCopyEditorService", () => {
  const disposables = new DisposableStore();
  setup(() => {
    disposables.add(registerTestResourceEditor());
  });
  teardown(() => {
    disposables.clear();
  });
  test("registry - basics", () => {
    const service = disposables.add(
      new WorkingCopyEditorService(
        disposables.add(new TestEditorService())
      )
    );
    let handlerEvent;
    disposables.add(
      service.onDidRegisterHandler((handler) => {
        handlerEvent = handler;
      })
    );
    const editorHandler = {
      handles: (workingCopy) => false,
      isOpen: () => false,
      createEditor: (workingCopy) => {
        throw new Error();
      }
    };
    disposables.add(service.registerHandler(editorHandler));
    assert.strictEqual(handlerEvent, editorHandler);
  });
  test("findEditor", async () => {
    const disposables2 = new DisposableStore();
    const instantiationService = workbenchInstantiationService(
      void 0,
      disposables2
    );
    const part = await createEditorPart(instantiationService, disposables2);
    instantiationService.stub(IEditorGroupsService, part);
    const editorService = disposables2.add(
      instantiationService.createInstance(EditorService, void 0)
    );
    const accessor = instantiationService.createInstance(TestServiceAccessor);
    const service = disposables2.add(
      new WorkingCopyEditorService(editorService)
    );
    const resource = URI.parse("custom://some/folder/custom.txt");
    const testWorkingCopy = disposables2.add(
      new TestWorkingCopy(resource, false, "testWorkingCopyTypeId1")
    );
    assert.strictEqual(service.findEditor(testWorkingCopy), void 0);
    const editorHandler = {
      handles: (workingCopy) => workingCopy === testWorkingCopy,
      isOpen: (workingCopy, editor) => workingCopy === testWorkingCopy,
      createEditor: (workingCopy) => {
        throw new Error();
      }
    };
    disposables2.add(service.registerHandler(editorHandler));
    const editor1 = disposables2.add(
      instantiationService.createInstance(
        UntitledTextEditorInput,
        accessor.untitledTextEditorService.create({
          initialValue: "foo"
        })
      )
    );
    const editor2 = disposables2.add(
      instantiationService.createInstance(
        UntitledTextEditorInput,
        accessor.untitledTextEditorService.create({
          initialValue: "foo"
        })
      )
    );
    await editorService.openEditors([
      { editor: editor1 },
      { editor: editor2 }
    ]);
    assert.ok(service.findEditor(testWorkingCopy));
    disposables2.dispose();
  });
  ensureNoDisposablesAreLeakedInTestSuite();
});
