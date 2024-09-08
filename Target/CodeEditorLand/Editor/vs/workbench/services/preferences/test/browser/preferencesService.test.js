import assert from "assert";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { TestCommandService } from "../../../../../editor/test/browser/editorTestServices.js";
import { ICommandService } from "../../../../../platform/commands/common/commands.js";
import { SyncDescriptor } from "../../../../../platform/instantiation/common/descriptors.js";
import { ServiceCollection } from "../../../../../platform/instantiation/common/serviceCollection.js";
import { IURLService } from "../../../../../platform/url/common/url.js";
import { DEFAULT_EDITOR_ASSOCIATION } from "../../../../common/editor.js";
import {
  TestEditorService,
  TestRemoteAgentService,
  workbenchInstantiationService
} from "../../../../test/browser/workbenchTestServices.js";
import { IJSONEditingService } from "../../../configuration/common/jsonEditing.js";
import { TestJSONEditingService } from "../../../configuration/test/common/testServices.js";
import { IRemoteAgentService } from "../../../remote/common/remoteAgentService.js";
import { PreferencesService } from "../../browser/preferencesService.js";
import {
  IPreferencesService
} from "../../common/preferences.js";
suite("PreferencesService", () => {
  let testInstantiationService;
  let testObject;
  let editorService;
  const disposables = ensureNoDisposablesAreLeakedInTestSuite();
  setup(() => {
    editorService = disposables.add(new TestEditorService2());
    testInstantiationService = workbenchInstantiationService(
      {
        editorService: () => editorService
      },
      disposables
    );
    testInstantiationService.stub(
      IJSONEditingService,
      TestJSONEditingService
    );
    testInstantiationService.stub(
      IRemoteAgentService,
      TestRemoteAgentService
    );
    testInstantiationService.stub(ICommandService, TestCommandService);
    testInstantiationService.stub(IURLService, {
      registerHandler: () => {
      }
    });
    const collection = new ServiceCollection();
    collection.set(
      IPreferencesService,
      new SyncDescriptor(PreferencesService)
    );
    const instantiationService = disposables.add(
      testInstantiationService.createChild(collection)
    );
    testObject = disposables.add(
      instantiationService.createInstance(PreferencesService)
    );
  });
  test("options are preserved when calling openEditor", async () => {
    testObject.openSettings({ jsonEditor: false, query: "test query" });
    const options = editorService.lastOpenEditorOptions;
    assert.strictEqual(options.focusSearch, true);
    assert.strictEqual(options.override, DEFAULT_EDITOR_ASSOCIATION.id);
    assert.strictEqual(options.query, "test query");
  });
});
class TestEditorService2 extends TestEditorService {
  lastOpenEditorOptions;
  async openEditor(editorInput, options) {
    this.lastOpenEditorOptions = options;
    return super.openEditor(editorInput, options);
  }
}
