import assert from "assert";
import { CancellationToken } from "../../../../../base/common/cancellation.js";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import {
  TestServiceAccessor,
  workbenchInstantiationService
} from "../../../../test/browser/workbenchTestServices.js";
import { UntitledTextEditorInput } from "../../common/untitledTextEditorInput.js";
suite("Untitled text editors", () => {
  const disposables = new DisposableStore();
  let instantiationService;
  let accessor;
  setup(() => {
    instantiationService = workbenchInstantiationService(
      void 0,
      disposables
    );
    accessor = instantiationService.createInstance(TestServiceAccessor);
    disposables.add(accessor.untitledTextEditorService);
  });
  teardown(() => {
    disposables.clear();
  });
  test("backup and restore (simple)", async () => testBackupAndRestore("Some very small file text content."));
  test("backup and restore (large, #121347)", async () => {
    const largeContent = "\uAD6D\uC5B4\uD55C\n".repeat(1e5);
    return testBackupAndRestore(largeContent);
  });
  async function testBackupAndRestore(content) {
    const service = accessor.untitledTextEditorService;
    const originalInput = disposables.add(
      instantiationService.createInstance(
        UntitledTextEditorInput,
        service.create()
      )
    );
    const restoredInput = disposables.add(
      instantiationService.createInstance(
        UntitledTextEditorInput,
        service.create()
      )
    );
    const originalModel = disposables.add(await originalInput.resolve());
    originalModel.textEditorModel?.setValue(content);
    const backup = await originalModel.backup(CancellationToken.None);
    const modelRestoredIdentifier = {
      typeId: originalModel.typeId,
      resource: restoredInput.resource
    };
    await accessor.workingCopyBackupService.backup(
      modelRestoredIdentifier,
      backup.content
    );
    const restoredModel = disposables.add(await restoredInput.resolve());
    assert.strictEqual(restoredModel.textEditorModel?.getValue(), content);
    assert.strictEqual(restoredModel.isDirty(), true);
  }
  ensureNoDisposablesAreLeakedInTestSuite();
});
