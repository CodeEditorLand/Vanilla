var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { ITextModel } from "../../../../../editor/common/model.js";
import { URI } from "../../../../../base/common/uri.js";
import { TextResourceEditorInput } from "../../../../common/editor/textResourceEditorInput.js";
import { TextResourceEditorModel } from "../../../../common/editor/textResourceEditorModel.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { workbenchInstantiationService, TestServiceAccessor, ITestTextFileEditorModelManager } from "../../../../test/browser/workbenchTestServices.js";
import { ensureNoDisposablesAreLeakedInTestSuite, toResource } from "../../../../../base/test/common/utils.js";
import { TextFileEditorModel } from "../../../textfile/common/textFileEditorModel.js";
import { snapshotToString } from "../../../textfile/common/textfiles.js";
import { TextFileEditorModelManager } from "../../../textfile/common/textFileEditorModelManager.js";
import { Event } from "../../../../../base/common/event.js";
import { timeout } from "../../../../../base/common/async.js";
import { UntitledTextEditorInput } from "../../../untitled/common/untitledTextEditorInput.js";
import { createTextBufferFactory } from "../../../../../editor/common/model/textModel.js";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
suite("Workbench - TextModelResolverService", () => {
  const disposables = new DisposableStore();
  let instantiationService;
  let accessor;
  setup(() => {
    instantiationService = workbenchInstantiationService(void 0, disposables);
    accessor = instantiationService.createInstance(TestServiceAccessor);
    disposables.add(accessor.textFileService.files);
  });
  teardown(() => {
    disposables.clear();
  });
  test("resolve resource", async () => {
    disposables.add(accessor.textModelResolverService.registerTextModelContentProvider("test", {
      provideTextContent: /* @__PURE__ */ __name(async function(resource2) {
        if (resource2.scheme === "test") {
          const modelContent = "Hello Test";
          const languageSelection = accessor.languageService.createById("json");
          return accessor.modelService.createModel(modelContent, languageSelection, resource2);
        }
        return null;
      }, "provideTextContent")
    }));
    const resource = URI.from({ scheme: "test", authority: null, path: "thePath" });
    const input = instantiationService.createInstance(TextResourceEditorInput, resource, "The Name", "The Description", void 0, void 0);
    const model = disposables.add(await input.resolve());
    assert.ok(model);
    assert.strictEqual(snapshotToString(model.createSnapshot()), "Hello Test");
    let disposed = false;
    const disposedPromise = new Promise((resolve) => {
      Event.once(model.onWillDispose)(() => {
        disposed = true;
        resolve();
      });
    });
    input.dispose();
    await disposedPromise;
    assert.strictEqual(disposed, true);
  });
  test("resolve file", async function() {
    const textModel = disposables.add(instantiationService.createInstance(TextFileEditorModel, toResource.call(this, "/path/file_resolver.txt"), "utf8", void 0));
    accessor.textFileService.files.add(textModel.resource, textModel);
    await textModel.resolve();
    const ref = await accessor.textModelResolverService.createModelReference(textModel.resource);
    const model = ref.object;
    const editorModel = model.textEditorModel;
    assert.ok(editorModel);
    assert.strictEqual(editorModel.getValue(), "Hello Html");
    let disposed = false;
    Event.once(model.onWillDispose)(() => {
      disposed = true;
    });
    ref.dispose();
    await timeout(0);
    assert.strictEqual(disposed, true);
  });
  test("resolved dirty file eventually disposes", async function() {
    const textModel = disposables.add(instantiationService.createInstance(TextFileEditorModel, toResource.call(this, "/path/file_resolver.txt"), "utf8", void 0));
    accessor.textFileService.files.add(textModel.resource, textModel);
    await textModel.resolve();
    textModel.updateTextEditorModel(createTextBufferFactory("make dirty"));
    const ref = await accessor.textModelResolverService.createModelReference(textModel.resource);
    let disposed = false;
    Event.once(textModel.onWillDispose)(() => {
      disposed = true;
    });
    ref.dispose();
    await timeout(0);
    assert.strictEqual(disposed, false);
    textModel.revert();
    await timeout(0);
    assert.strictEqual(disposed, true);
  });
  test("resolved dirty file does not dispose when new reference created", async function() {
    const textModel = disposables.add(instantiationService.createInstance(TextFileEditorModel, toResource.call(this, "/path/file_resolver.txt"), "utf8", void 0));
    accessor.textFileService.files.add(textModel.resource, textModel);
    await textModel.resolve();
    textModel.updateTextEditorModel(createTextBufferFactory("make dirty"));
    const ref1 = await accessor.textModelResolverService.createModelReference(textModel.resource);
    let disposed = false;
    Event.once(textModel.onWillDispose)(() => {
      disposed = true;
    });
    ref1.dispose();
    await timeout(0);
    assert.strictEqual(disposed, false);
    const ref2 = await accessor.textModelResolverService.createModelReference(textModel.resource);
    textModel.revert();
    await timeout(0);
    assert.strictEqual(disposed, false);
    ref2.dispose();
    await timeout(0);
    assert.strictEqual(disposed, true);
  });
  test("resolve untitled", async () => {
    const service = accessor.untitledTextEditorService;
    const untitledModel = disposables.add(service.create());
    const input = disposables.add(instantiationService.createInstance(UntitledTextEditorInput, untitledModel));
    await input.resolve();
    const ref = await accessor.textModelResolverService.createModelReference(input.resource);
    const model = ref.object;
    assert.strictEqual(untitledModel, model);
    const editorModel = model.textEditorModel;
    assert.ok(editorModel);
    ref.dispose();
    input.dispose();
    model.dispose();
  });
  test("even loading documents should be refcounted", async () => {
    let resolveModel;
    const waitForIt = new Promise((resolve) => resolveModel = resolve);
    disposables.add(accessor.textModelResolverService.registerTextModelContentProvider("test", {
      provideTextContent: /* @__PURE__ */ __name(async (resource) => {
        await waitForIt;
        const modelContent = "Hello Test";
        const languageSelection = accessor.languageService.createById("json");
        return disposables.add(accessor.modelService.createModel(modelContent, languageSelection, resource));
      }, "provideTextContent")
    }));
    const uri = URI.from({ scheme: "test", authority: null, path: "thePath" });
    const modelRefPromise1 = accessor.textModelResolverService.createModelReference(uri);
    const modelRefPromise2 = accessor.textModelResolverService.createModelReference(uri);
    resolveModel();
    const modelRef1 = await modelRefPromise1;
    const model1 = modelRef1.object;
    const modelRef2 = await modelRefPromise2;
    const model2 = modelRef2.object;
    const textModel = model1.textEditorModel;
    assert.strictEqual(model1, model2, "they are the same model");
    assert(!textModel.isDisposed(), "the text model should not be disposed");
    modelRef1.dispose();
    assert(!textModel.isDisposed(), "the text model should still not be disposed");
    const p1 = new Promise((resolve) => disposables.add(textModel.onWillDispose(resolve)));
    modelRef2.dispose();
    await p1;
    assert(textModel.isDisposed(), "the text model should finally be disposed");
  });
  ensureNoDisposablesAreLeakedInTestSuite();
});
//# sourceMappingURL=textModelResolverService.test.js.map
