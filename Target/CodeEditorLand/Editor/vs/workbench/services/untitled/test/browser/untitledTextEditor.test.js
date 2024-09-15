var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { URI } from "../../../../../base/common/uri.js";
import { join } from "../../../../../base/common/path.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { IUntitledTextEditorService, UntitledTextEditorService } from "../../common/untitledTextEditorService.js";
import { workbenchInstantiationService, TestServiceAccessor } from "../../../../test/browser/workbenchTestServices.js";
import { snapshotToString } from "../../../textfile/common/textfiles.js";
import { PLAINTEXT_LANGUAGE_ID } from "../../../../../editor/common/languages/modesRegistry.js";
import { ISingleEditOperation } from "../../../../../editor/common/core/editOperation.js";
import { Range } from "../../../../../editor/common/core/range.js";
import { UntitledTextEditorInput } from "../../common/untitledTextEditorInput.js";
import { IUntitledTextEditorModel, UntitledTextEditorModel } from "../../common/untitledTextEditorModel.js";
import { CancellationToken } from "../../../../../base/common/cancellation.js";
import { EditorInputCapabilities } from "../../../../common/editor.js";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import { isReadable, isReadableStream } from "../../../../../base/common/stream.js";
import { readableToBuffer, streamToBuffer, VSBufferReadable, VSBufferReadableStream } from "../../../../../base/common/buffer.js";
import { LanguageDetectionLanguageEventSource } from "../../../languageDetection/common/languageDetectionWorkerService.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { timeout } from "../../../../../base/common/async.js";
suite("Untitled text editors", () => {
  class TestUntitledTextEditorInput extends UntitledTextEditorInput {
    static {
      __name(this, "TestUntitledTextEditorInput");
    }
    getModel() {
      return this.model;
    }
  }
  const disposables = new DisposableStore();
  let instantiationService;
  let accessor;
  setup(() => {
    instantiationService = workbenchInstantiationService(void 0, disposables);
    accessor = instantiationService.createInstance(TestServiceAccessor);
    disposables.add(accessor.untitledTextEditorService);
  });
  teardown(() => {
    disposables.clear();
  });
  test("basics", async () => {
    const service = accessor.untitledTextEditorService;
    const workingCopyService = accessor.workingCopyService;
    const events = [];
    disposables.add(service.onDidCreate((model2) => {
      events.push(model2);
    }));
    const input1 = instantiationService.createInstance(TestUntitledTextEditorInput, service.create());
    await input1.resolve();
    assert.strictEqual(service.get(input1.resource), input1.getModel());
    assert.ok(!accessor.untitledTextEditorService.isUntitledWithAssociatedResource(input1.resource));
    assert.strictEqual(events.length, 1);
    assert.strictEqual(events[0].resource.toString(), input1.getModel().resource.toString());
    assert.ok(service.get(input1.resource));
    assert.ok(!service.get(URI.file("testing")));
    assert.ok(input1.hasCapability(EditorInputCapabilities.Untitled));
    assert.ok(!input1.hasCapability(EditorInputCapabilities.Readonly));
    assert.ok(!input1.isReadonly());
    assert.ok(!input1.hasCapability(EditorInputCapabilities.Singleton));
    assert.ok(!input1.hasCapability(EditorInputCapabilities.RequiresTrust));
    assert.ok(!input1.hasCapability(EditorInputCapabilities.Scratchpad));
    const input2 = instantiationService.createInstance(TestUntitledTextEditorInput, service.create());
    assert.strictEqual(service.get(input2.resource), input2.getModel());
    const untypedInput = input1.toUntyped({ preserveViewState: 0 });
    assert.strictEqual(untypedInput.forceUntitled, true);
    assert.strictEqual(service.get(input1.resource), input1.getModel());
    assert.strictEqual(service.get(input2.resource), input2.getModel());
    await input1.revert(0);
    assert.ok(input1.isDisposed());
    assert.ok(!service.get(input1.resource));
    const model = await input2.resolve();
    assert.strictEqual(await service.resolve({ untitledResource: input2.resource }), model);
    assert.ok(service.get(model.resource));
    assert.strictEqual(events.length, 2);
    assert.strictEqual(events[1].resource.toString(), input2.resource.toString());
    assert.ok(!input2.isDirty());
    const resourcePromise = awaitDidChangeDirty(accessor.untitledTextEditorService);
    model.textEditorModel?.setValue("foo bar");
    const resource = await resourcePromise;
    assert.strictEqual(resource.toString(), input2.resource.toString());
    assert.ok(input2.isDirty());
    const dirtyUntypedInput = input2.toUntyped({ preserveViewState: 0 });
    assert.strictEqual(dirtyUntypedInput.contents, "foo bar");
    assert.strictEqual(dirtyUntypedInput.resource, void 0);
    const dirtyUntypedInputWithResource = input2.toUntyped({ preserveViewState: 0, preserveResource: true });
    assert.strictEqual(dirtyUntypedInputWithResource.contents, "foo bar");
    assert.strictEqual(dirtyUntypedInputWithResource?.resource?.toString(), input2.resource.toString());
    const dirtyUntypedInputWithoutContent = input2.toUntyped();
    assert.strictEqual(dirtyUntypedInputWithoutContent.resource?.toString(), input2.resource.toString());
    assert.strictEqual(dirtyUntypedInputWithoutContent.contents, void 0);
    assert.ok(workingCopyService.isDirty(input2.resource));
    assert.strictEqual(workingCopyService.dirtyCount, 1);
    await input1.revert(0);
    await input2.revert(0);
    assert.ok(!service.get(input1.resource));
    assert.ok(!service.get(input2.resource));
    assert.ok(!input2.isDirty());
    assert.ok(!model.isDirty());
    assert.ok(!workingCopyService.isDirty(input2.resource));
    assert.strictEqual(workingCopyService.dirtyCount, 0);
    await input1.revert(0);
    assert.ok(input1.isDisposed());
    assert.ok(!service.get(input1.resource));
    input2.dispose();
    assert.ok(!service.get(input2.resource));
  });
  function awaitDidChangeDirty(service) {
    return new Promise((resolve) => {
      const listener = service.onDidChangeDirty(async (model) => {
        listener.dispose();
        resolve(model.resource);
      });
    });
  }
  __name(awaitDidChangeDirty, "awaitDidChangeDirty");
  test("associated resource is dirty", async () => {
    const service = accessor.untitledTextEditorService;
    const file = URI.file(join("C:\\", "/foo/file.txt"));
    let onDidChangeDirtyModel = void 0;
    disposables.add(service.onDidChangeDirty((model2) => {
      onDidChangeDirtyModel = model2;
    }));
    const model = disposables.add(service.create({ associatedResource: file }));
    assert.ok(accessor.untitledTextEditorService.isUntitledWithAssociatedResource(model.resource));
    const untitled = disposables.add(instantiationService.createInstance(UntitledTextEditorInput, model));
    assert.ok(untitled.isDirty());
    assert.strictEqual(model, onDidChangeDirtyModel);
    const resolvedModel = await untitled.resolve();
    assert.ok(resolvedModel.hasAssociatedFilePath);
    assert.strictEqual(untitled.isDirty(), true);
  });
  test("no longer dirty when content gets empty (not with associated resource)", async () => {
    const service = accessor.untitledTextEditorService;
    const workingCopyService = accessor.workingCopyService;
    const input = disposables.add(instantiationService.createInstance(UntitledTextEditorInput, service.create()));
    const model = disposables.add(await input.resolve());
    model.textEditorModel?.setValue("foo bar");
    assert.ok(model.isDirty());
    assert.ok(workingCopyService.isDirty(model.resource, model.typeId));
    model.textEditorModel?.setValue("");
    assert.ok(!model.isDirty());
    assert.ok(!workingCopyService.isDirty(model.resource, model.typeId));
  });
  test("via create options", async () => {
    const service = accessor.untitledTextEditorService;
    const input1 = disposables.add(instantiationService.createInstance(UntitledTextEditorInput, service.create()));
    const model1 = disposables.add(await input1.resolve());
    model1.textEditorModel.setValue("foo bar");
    assert.ok(model1.isDirty());
    model1.textEditorModel.setValue("");
    assert.ok(!model1.isDirty());
    const input2 = disposables.add(instantiationService.createInstance(UntitledTextEditorInput, service.create({ initialValue: "Hello World" })));
    const model2 = disposables.add(await input2.resolve());
    assert.strictEqual(snapshotToString(model2.createSnapshot()), "Hello World");
    const input = disposables.add(instantiationService.createInstance(UntitledTextEditorInput, disposables.add(service.create())));
    const input3 = disposables.add(instantiationService.createInstance(UntitledTextEditorInput, service.create({ untitledResource: input.resource })));
    const model3 = disposables.add(await input3.resolve());
    assert.strictEqual(model3.resource.toString(), input.resource.toString());
    const file = URI.file(join("C:\\", "/foo/file44.txt"));
    const input4 = disposables.add(instantiationService.createInstance(UntitledTextEditorInput, service.create({ associatedResource: file })));
    const model4 = disposables.add(await input4.resolve());
    assert.ok(model4.hasAssociatedFilePath);
    assert.ok(model4.isDirty());
  });
  test("associated path remains dirty when content gets empty", async () => {
    const service = accessor.untitledTextEditorService;
    const file = URI.file(join("C:\\", "/foo/file.txt"));
    const input = disposables.add(instantiationService.createInstance(UntitledTextEditorInput, service.create({ associatedResource: file })));
    const model = disposables.add(await input.resolve());
    model.textEditorModel?.setValue("foo bar");
    assert.ok(model.isDirty());
    model.textEditorModel?.setValue("");
    assert.ok(model.isDirty());
  });
  test("initial content is dirty", async () => {
    const service = accessor.untitledTextEditorService;
    const workingCopyService = accessor.workingCopyService;
    const untitled = disposables.add(instantiationService.createInstance(TestUntitledTextEditorInput, service.create({ initialValue: "Hello World" })));
    assert.ok(untitled.isDirty());
    const backup = (await untitled.getModel().backup(CancellationToken.None)).content;
    if (isReadableStream(backup)) {
      const value = await streamToBuffer(backup);
      assert.strictEqual(value.toString(), "Hello World");
    } else if (isReadable(backup)) {
      const value = readableToBuffer(backup);
      assert.strictEqual(value.toString(), "Hello World");
    } else {
      assert.fail("Missing untitled backup");
    }
    const model = disposables.add(await untitled.resolve());
    assert.ok(model.isDirty());
    assert.strictEqual(workingCopyService.dirtyCount, 1);
  });
  test("created with files.defaultLanguage setting", () => {
    const defaultLanguage = "javascript";
    const config = accessor.testConfigurationService;
    config.setUserConfiguration("files", { "defaultLanguage": defaultLanguage });
    const service = accessor.untitledTextEditorService;
    const input = disposables.add(service.create());
    assert.strictEqual(input.getLanguageId(), defaultLanguage);
    config.setUserConfiguration("files", { "defaultLanguage": void 0 });
  });
  test("created with files.defaultLanguage setting (${activeEditorLanguage})", async () => {
    const config = accessor.testConfigurationService;
    config.setUserConfiguration("files", { "defaultLanguage": "${activeEditorLanguage}" });
    accessor.editorService.activeTextEditorLanguageId = "typescript";
    const service = accessor.untitledTextEditorService;
    const model = disposables.add(service.create());
    assert.strictEqual(model.getLanguageId(), "typescript");
    config.setUserConfiguration("files", { "defaultLanguage": void 0 });
    accessor.editorService.activeTextEditorLanguageId = void 0;
  });
  test("created with language overrides files.defaultLanguage setting", () => {
    const language = "typescript";
    const defaultLanguage = "javascript";
    const config = accessor.testConfigurationService;
    config.setUserConfiguration("files", { "defaultLanguage": defaultLanguage });
    const service = accessor.untitledTextEditorService;
    const input = disposables.add(service.create({ languageId: language }));
    assert.strictEqual(input.getLanguageId(), language);
    config.setUserConfiguration("files", { "defaultLanguage": void 0 });
  });
  test("can change language afterwards", async () => {
    const languageId = "untitled-input-test";
    disposables.add(accessor.languageService.registerLanguage({
      id: languageId
    }));
    const service = accessor.untitledTextEditorService;
    const input = disposables.add(instantiationService.createInstance(UntitledTextEditorInput, service.create({ languageId })));
    assert.strictEqual(input.getLanguageId(), languageId);
    const model = disposables.add(await input.resolve());
    assert.strictEqual(model.getLanguageId(), languageId);
    input.setLanguageId(PLAINTEXT_LANGUAGE_ID);
    assert.strictEqual(input.getLanguageId(), PLAINTEXT_LANGUAGE_ID);
  });
  test("remembers that language was set explicitly", async () => {
    const language = "untitled-input-test";
    disposables.add(accessor.languageService.registerLanguage({
      id: language
    }));
    const service = accessor.untitledTextEditorService;
    const model = disposables.add(service.create());
    const input = disposables.add(instantiationService.createInstance(UntitledTextEditorInput, model));
    assert.ok(!input.hasLanguageSetExplicitly);
    input.setLanguageId(PLAINTEXT_LANGUAGE_ID);
    assert.ok(input.hasLanguageSetExplicitly);
    assert.strictEqual(input.getLanguageId(), PLAINTEXT_LANGUAGE_ID);
  });
  test("remembers that language was set explicitly if set by another source (i.e. ModelService)", async () => {
    const language = "untitled-input-test";
    disposables.add(accessor.languageService.registerLanguage({
      id: language
    }));
    const service = accessor.untitledTextEditorService;
    const model = disposables.add(service.create());
    const input = disposables.add(instantiationService.createInstance(UntitledTextEditorInput, model));
    disposables.add(await input.resolve());
    assert.ok(!input.hasLanguageSetExplicitly);
    model.textEditorModel.setLanguage(accessor.languageService.createById(language));
    assert.ok(input.hasLanguageSetExplicitly);
    assert.strictEqual(model.getLanguageId(), language);
  });
  test("Language is not set explicitly if set by language detection source", async () => {
    const language = "untitled-input-test";
    disposables.add(accessor.languageService.registerLanguage({
      id: language
    }));
    const service = accessor.untitledTextEditorService;
    const model = disposables.add(service.create());
    const input = disposables.add(instantiationService.createInstance(UntitledTextEditorInput, model));
    await input.resolve();
    assert.ok(!input.hasLanguageSetExplicitly);
    model.textEditorModel.setLanguage(
      accessor.languageService.createById(language),
      // This is really what this is testing
      LanguageDetectionLanguageEventSource
    );
    assert.ok(!input.hasLanguageSetExplicitly);
    assert.strictEqual(model.getLanguageId(), language);
  });
  test("service#onDidChangeEncoding", async () => {
    const service = accessor.untitledTextEditorService;
    const input = disposables.add(instantiationService.createInstance(UntitledTextEditorInput, service.create()));
    let counter = 0;
    disposables.add(service.onDidChangeEncoding((model2) => {
      counter++;
      assert.strictEqual(model2.resource.toString(), input.resource.toString());
    }));
    const model = disposables.add(await input.resolve());
    await model.setEncoding("utf16");
    assert.strictEqual(counter, 1);
  });
  test("service#onDidChangeLabel", async () => {
    const service = accessor.untitledTextEditorService;
    const input = disposables.add(instantiationService.createInstance(UntitledTextEditorInput, service.create()));
    let counter = 0;
    disposables.add(service.onDidChangeLabel((model2) => {
      counter++;
      assert.strictEqual(model2.resource.toString(), input.resource.toString());
    }));
    const model = disposables.add(await input.resolve());
    model.textEditorModel?.setValue("Foo Bar");
    assert.strictEqual(counter, 1);
  });
  test("service#onWillDispose", async () => {
    const service = accessor.untitledTextEditorService;
    const input = disposables.add(instantiationService.createInstance(UntitledTextEditorInput, service.create()));
    let counter = 0;
    disposables.add(service.onWillDispose((model2) => {
      counter++;
      assert.strictEqual(model2.resource.toString(), input.resource.toString());
    }));
    const model = disposables.add(await input.resolve());
    assert.strictEqual(counter, 0);
    model.dispose();
    assert.strictEqual(counter, 1);
  });
  test("service#getValue", async () => {
    const service = accessor.untitledTextEditorService;
    const input1 = disposables.add(instantiationService.createInstance(UntitledTextEditorInput, service.create()));
    const model1 = disposables.add(await input1.resolve());
    model1.textEditorModel.setValue("foo bar");
    assert.strictEqual(service.getValue(model1.resource), "foo bar");
    model1.dispose();
    assert.strictEqual(service.getValue(URI.parse("https://www.microsoft.com")), void 0);
  });
  test("model#onDidChangeContent", async function() {
    const service = accessor.untitledTextEditorService;
    const input = disposables.add(instantiationService.createInstance(UntitledTextEditorInput, service.create()));
    let counter = 0;
    const model = disposables.add(await input.resolve());
    disposables.add(model.onDidChangeContent(() => counter++));
    model.textEditorModel?.setValue("foo");
    assert.strictEqual(counter, 1, "Dirty model should trigger event");
    model.textEditorModel?.setValue("bar");
    assert.strictEqual(counter, 2, "Content change when dirty should trigger event");
    model.textEditorModel?.setValue("");
    assert.strictEqual(counter, 3, "Manual revert should trigger event");
    model.textEditorModel?.setValue("foo");
    assert.strictEqual(counter, 4, "Dirty model should trigger event");
  });
  test("model#onDidRevert and input disposed when reverted", async function() {
    const service = accessor.untitledTextEditorService;
    const input = disposables.add(instantiationService.createInstance(UntitledTextEditorInput, service.create()));
    let counter = 0;
    const model = disposables.add(await input.resolve());
    disposables.add(model.onDidRevert(() => counter++));
    model.textEditorModel?.setValue("foo");
    await model.revert();
    assert.ok(input.isDisposed());
    assert.ok(counter === 1);
  });
  test("model#onDidChangeName and input name", async function() {
    const service = accessor.untitledTextEditorService;
    const input = disposables.add(instantiationService.createInstance(UntitledTextEditorInput, service.create()));
    let counter = 0;
    let model = disposables.add(await input.resolve());
    disposables.add(model.onDidChangeName(() => counter++));
    model.textEditorModel?.setValue("foo");
    assert.strictEqual(input.getName(), "foo");
    assert.strictEqual(model.name, "foo");
    assert.strictEqual(counter, 1);
    model.textEditorModel?.setValue("bar");
    assert.strictEqual(input.getName(), "bar");
    assert.strictEqual(model.name, "bar");
    assert.strictEqual(counter, 2);
    model.textEditorModel?.setValue("");
    assert.strictEqual(input.getName(), "Untitled-1");
    assert.strictEqual(model.name, "Untitled-1");
    model.textEditorModel?.setValue("        ");
    assert.strictEqual(input.getName(), "Untitled-1");
    assert.strictEqual(model.name, "Untitled-1");
    model.textEditorModel?.setValue("([]}");
    assert.strictEqual(input.getName(), "Untitled-1");
    assert.strictEqual(model.name, "Untitled-1");
    model.textEditorModel?.setValue("([]}hello   ");
    assert.strictEqual(input.getName(), "([]}hello");
    assert.strictEqual(model.name, "([]}hello");
    model.textEditorModel?.setValue("12345678901234567890123456789012345678901234567890");
    assert.strictEqual(input.getName(), "1234567890123456789012345678901234567890");
    assert.strictEqual(model.name, "1234567890123456789012345678901234567890");
    model.textEditorModel?.setValue("123456789012345678901234567890123456789\u{1F31E}");
    assert.strictEqual(input.getName(), "123456789012345678901234567890123456789");
    assert.strictEqual(model.name, "123456789012345678901234567890123456789");
    model.textEditorModel?.setValue("hello\u202Eworld");
    assert.strictEqual(input.getName(), "helloworld");
    assert.strictEqual(model.name, "helloworld");
    assert.strictEqual(counter, 7);
    model.textEditorModel?.setValue("Hello\nWorld");
    assert.strictEqual(counter, 8);
    function createSingleEditOp(text, positionLineNumber, positionColumn, selectionLineNumber = positionLineNumber, selectionColumn = positionColumn) {
      const range = new Range(
        selectionLineNumber,
        selectionColumn,
        positionLineNumber,
        positionColumn
      );
      return {
        range,
        text,
        forceMoveMarkers: false
      };
    }
    __name(createSingleEditOp, "createSingleEditOp");
    model.textEditorModel?.applyEdits([createSingleEditOp("hello", 2, 2)]);
    assert.strictEqual(counter, 8);
    input.dispose();
    model.dispose();
    const inputWithContents = disposables.add(instantiationService.createInstance(UntitledTextEditorInput, service.create({ initialValue: "Foo" })));
    model = disposables.add(await inputWithContents.resolve());
    assert.strictEqual(inputWithContents.getName(), "Foo");
  });
  test("model#onDidChangeDirty", async function() {
    const service = accessor.untitledTextEditorService;
    const input = disposables.add(instantiationService.createInstance(UntitledTextEditorInput, service.create()));
    let counter = 0;
    const model = disposables.add(await input.resolve());
    disposables.add(model.onDidChangeDirty(() => counter++));
    model.textEditorModel?.setValue("foo");
    assert.strictEqual(counter, 1, "Dirty model should trigger event");
    model.textEditorModel?.setValue("bar");
    assert.strictEqual(counter, 1, "Another change does not fire event");
  });
  test("model#onDidChangeEncoding", async function() {
    const service = accessor.untitledTextEditorService;
    const input = disposables.add(instantiationService.createInstance(UntitledTextEditorInput, service.create()));
    let counter = 0;
    const model = disposables.add(await input.resolve());
    disposables.add(model.onDidChangeEncoding(() => counter++));
    await model.setEncoding("utf16");
    assert.strictEqual(counter, 1, "Dirty model should trigger event");
    await model.setEncoding("utf16");
    assert.strictEqual(counter, 1, "Another change to same encoding does not fire event");
  });
  test("canDispose with dirty model", async function() {
    const service = accessor.untitledTextEditorService;
    const input = disposables.add(instantiationService.createInstance(UntitledTextEditorInput, service.create()));
    const model = disposables.add(await input.resolve());
    model.textEditorModel?.setValue("foo");
    const canDisposePromise = service.canDispose(model);
    assert.ok(canDisposePromise instanceof Promise);
    let canDispose = false;
    (async () => {
      canDispose = await canDisposePromise;
    })();
    assert.strictEqual(canDispose, false);
    model.revert({ soft: true });
    await timeout(0);
    assert.strictEqual(canDispose, true);
    const canDispose2 = service.canDispose(model);
    assert.strictEqual(canDispose2, true);
  });
  ensureNoDisposablesAreLeakedInTestSuite();
});
//# sourceMappingURL=untitledTextEditor.test.js.map
