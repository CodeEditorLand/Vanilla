import assert from "assert";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import { URI } from "../../../../../base/common/uri.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { DiffEditorInput } from "../../../../common/editor/diffEditorInput.js";
import { TextDiffEditorModel } from "../../../../common/editor/textDiffEditorModel.js";
import { TextResourceEditorInput } from "../../../../common/editor/textResourceEditorInput.js";
import {
  TestServiceAccessor,
  workbenchInstantiationService
} from "../../workbenchTestServices.js";
suite("TextDiffEditorModel", () => {
  const disposables = new DisposableStore();
  let instantiationService;
  let accessor;
  setup(() => {
    instantiationService = workbenchInstantiationService(
      void 0,
      disposables
    );
    accessor = instantiationService.createInstance(TestServiceAccessor);
  });
  teardown(() => {
    disposables.clear();
  });
  test("basics", async () => {
    disposables.add(
      accessor.textModelResolverService.registerTextModelContentProvider(
        "test",
        {
          provideTextContent: async (resource) => {
            if (resource.scheme === "test") {
              const modelContent = "Hello Test";
              const languageSelection = accessor.languageService.createById("json");
              return disposables.add(
                accessor.modelService.createModel(
                  modelContent,
                  languageSelection,
                  resource
                )
              );
            }
            return null;
          }
        }
      )
    );
    const input = disposables.add(
      instantiationService.createInstance(
        TextResourceEditorInput,
        URI.from({ scheme: "test", authority: null, path: "thePath" }),
        "name",
        "description",
        void 0,
        void 0
      )
    );
    const otherInput = disposables.add(
      instantiationService.createInstance(
        TextResourceEditorInput,
        URI.from({ scheme: "test", authority: null, path: "thePath" }),
        "name2",
        "description",
        void 0,
        void 0
      )
    );
    const diffInput = disposables.add(
      instantiationService.createInstance(
        DiffEditorInput,
        "name",
        "description",
        input,
        otherInput,
        void 0
      )
    );
    let model = disposables.add(
      await diffInput.resolve()
    );
    assert(model);
    assert(model instanceof TextDiffEditorModel);
    const diffEditorModel = model.textDiffEditorModel;
    assert(diffEditorModel.original);
    assert(diffEditorModel.modified);
    model = disposables.add(
      await diffInput.resolve()
    );
    assert(model.isResolved());
    assert(diffEditorModel !== model.textDiffEditorModel);
    diffInput.dispose();
    assert(!model.textDiffEditorModel);
  });
  ensureNoDisposablesAreLeakedInTestSuite();
});
