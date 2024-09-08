import assert from "assert";
import { timeout } from "../../../../../base/common/async.js";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import { URI } from "../../../../../base/common/uri.js";
import {
  ensureNoDisposablesAreLeakedInTestSuite,
  toResource
} from "../../../../../base/test/common/utils.js";
import { PLAINTEXT_LANGUAGE_ID } from "../../../../../editor/common/languages/modesRegistry.js";
import {
  FileOperationResult,
  NotModifiedSinceFileOperationError,
  TooLargeFileOperationError
} from "../../../../../platform/files/common/files.js";
import { InMemoryFileSystemProvider } from "../../../../../platform/files/common/inMemoryFilesystemProvider.js";
import { Registry } from "../../../../../platform/registry/common/platform.js";
import {
  EditorExtensions,
  EditorInputCapabilities,
  Verbosity
} from "../../../../common/editor.js";
import { BinaryEditorModel } from "../../../../common/editor/binaryEditorModel.js";
import { TextEditorService } from "../../../../services/textfile/common/textEditorService.js";
import { TextFileEditorModel } from "../../../../services/textfile/common/textFileEditorModel.js";
import {
  EncodingMode,
  TextFileOperationError,
  TextFileOperationResult
} from "../../../../services/textfile/common/textfiles.js";
import {
  TestServiceAccessor,
  getLastResolvedFileStat,
  workbenchInstantiationService
} from "../../../../test/browser/workbenchTestServices.js";
import { FileEditorInputSerializer } from "../../browser/editors/fileEditorHandler.js";
import { FileEditorInput } from "../../browser/editors/fileEditorInput.js";
suite("Files - FileEditorInput", () => {
  const disposables = new DisposableStore();
  let instantiationService;
  let accessor;
  function createFileInput(resource, preferredResource, preferredLanguageId, preferredName, preferredDescription, preferredContents) {
    return disposables.add(
      instantiationService.createInstance(
        FileEditorInput,
        resource,
        preferredResource,
        preferredName,
        preferredDescription,
        void 0,
        preferredLanguageId,
        preferredContents
      )
    );
  }
  class TestTextEditorService extends TextEditorService {
    createTextEditor(input) {
      return createFileInput(input.resource);
    }
    async resolveTextEditor(input) {
      return createFileInput(input.resource);
    }
  }
  setup(() => {
    instantiationService = workbenchInstantiationService(
      {
        textEditorService: (instantiationService2) => instantiationService2.createInstance(TestTextEditorService)
      },
      disposables
    );
    accessor = instantiationService.createInstance(TestServiceAccessor);
  });
  teardown(() => {
    disposables.clear();
  });
  test("Basics", async function() {
    let input = createFileInput(toResource.call(this, "/foo/bar/file.js"));
    const otherInput = createFileInput(
      toResource.call(this, "foo/bar/otherfile.js")
    );
    const otherInputSame = createFileInput(
      toResource.call(this, "foo/bar/file.js")
    );
    assert(input.matches(input));
    assert(input.matches(otherInputSame));
    assert(!input.matches(otherInput));
    assert.ok(input.getName());
    assert.ok(input.getDescription());
    assert.ok(input.getTitle(Verbosity.SHORT));
    assert.ok(!input.hasCapability(EditorInputCapabilities.Untitled));
    assert.ok(!input.hasCapability(EditorInputCapabilities.Readonly));
    assert.ok(!input.isReadonly());
    assert.ok(!input.hasCapability(EditorInputCapabilities.Singleton));
    assert.ok(!input.hasCapability(EditorInputCapabilities.RequiresTrust));
    const untypedInput = input.toUntyped({ preserveViewState: 0 });
    assert.strictEqual(
      untypedInput.resource.toString(),
      input.resource.toString()
    );
    assert.strictEqual("file.js", input.getName());
    assert.strictEqual(
      toResource.call(this, "/foo/bar/file.js").fsPath,
      input.resource.fsPath
    );
    assert(input.resource instanceof URI);
    input = createFileInput(toResource.call(this, "/foo/bar.html"));
    const inputToResolve = createFileInput(
      toResource.call(this, "/foo/bar/file.js")
    );
    const sameOtherInput = createFileInput(
      toResource.call(this, "/foo/bar/file.js")
    );
    let resolved = await inputToResolve.resolve();
    assert.ok(inputToResolve.isResolved());
    const resolvedModelA = resolved;
    resolved = await inputToResolve.resolve();
    assert(resolvedModelA === resolved);
    try {
      DisposableStore.DISABLE_DISPOSED_WARNING = true;
      const otherResolved = await sameOtherInput.resolve();
      assert(otherResolved === resolvedModelA);
      inputToResolve.dispose();
      resolved = await inputToResolve.resolve();
      assert(resolvedModelA === resolved);
      inputToResolve.dispose();
      sameOtherInput.dispose();
      resolvedModelA.dispose();
      resolved = await inputToResolve.resolve();
      assert(resolvedModelA !== resolved);
      const stat = getLastResolvedFileStat(resolved);
      resolved = await inputToResolve.resolve();
      await timeout(0);
      assert(stat !== getLastResolvedFileStat(resolved));
    } finally {
      DisposableStore.DISABLE_DISPOSED_WARNING = false;
    }
  });
  test("reports as untitled without supported file scheme", async function() {
    const input = createFileInput(
      toResource.call(this, "/foo/bar/file.js").with({ scheme: "someTestingScheme" })
    );
    assert.ok(input.hasCapability(EditorInputCapabilities.Untitled));
    assert.ok(!input.hasCapability(EditorInputCapabilities.Readonly));
    assert.ok(!input.isReadonly());
  });
  test("reports as readonly with readonly file scheme", async function() {
    const inMemoryFilesystemProvider = disposables.add(
      new InMemoryFileSystemProvider()
    );
    inMemoryFilesystemProvider.setReadOnly(true);
    disposables.add(
      accessor.fileService.registerProvider(
        "someTestingReadonlyScheme",
        inMemoryFilesystemProvider
      )
    );
    const input = createFileInput(
      toResource.call(this, "/foo/bar/file.js").with({ scheme: "someTestingReadonlyScheme" })
    );
    assert.ok(!input.hasCapability(EditorInputCapabilities.Untitled));
    assert.ok(input.hasCapability(EditorInputCapabilities.Readonly));
    assert.ok(input.isReadonly());
  });
  test("preferred resource", function() {
    const resource = toResource.call(this, "/foo/bar/updatefile.js");
    const preferredResource = toResource.call(
      this,
      "/foo/bar/UPDATEFILE.js"
    );
    const inputWithoutPreferredResource = createFileInput(resource);
    assert.strictEqual(
      inputWithoutPreferredResource.resource.toString(),
      resource.toString()
    );
    assert.strictEqual(
      inputWithoutPreferredResource.preferredResource.toString(),
      resource.toString()
    );
    const inputWithPreferredResource = createFileInput(
      resource,
      preferredResource
    );
    assert.strictEqual(
      inputWithPreferredResource.resource.toString(),
      resource.toString()
    );
    assert.strictEqual(
      inputWithPreferredResource.preferredResource.toString(),
      preferredResource.toString()
    );
    let didChangeLabel = false;
    disposables.add(
      inputWithPreferredResource.onDidChangeLabel((e) => {
        didChangeLabel = true;
      })
    );
    assert.strictEqual(
      inputWithPreferredResource.getName(),
      "UPDATEFILE.js"
    );
    const otherPreferredResource = toResource.call(
      this,
      "/FOO/BAR/updateFILE.js"
    );
    inputWithPreferredResource.setPreferredResource(otherPreferredResource);
    assert.strictEqual(
      inputWithPreferredResource.resource.toString(),
      resource.toString()
    );
    assert.strictEqual(
      inputWithPreferredResource.preferredResource.toString(),
      otherPreferredResource.toString()
    );
    assert.strictEqual(
      inputWithPreferredResource.getName(),
      "updateFILE.js"
    );
    assert.strictEqual(didChangeLabel, true);
  });
  test("preferred language", async function() {
    const languageId = "file-input-test";
    disposables.add(
      accessor.languageService.registerLanguage({
        id: languageId
      })
    );
    const input = createFileInput(
      toResource.call(this, "/foo/bar/file.js"),
      void 0,
      languageId
    );
    assert.strictEqual(input.getPreferredLanguageId(), languageId);
    const model = disposables.add(
      await input.resolve()
    );
    assert.strictEqual(model.textEditorModel.getLanguageId(), languageId);
    input.setLanguageId("text");
    assert.strictEqual(input.getPreferredLanguageId(), "text");
    assert.strictEqual(
      model.textEditorModel.getLanguageId(),
      PLAINTEXT_LANGUAGE_ID
    );
    const input2 = createFileInput(
      toResource.call(this, "/foo/bar/file.js")
    );
    input2.setPreferredLanguageId(languageId);
    const model2 = disposables.add(
      await input2.resolve()
    );
    assert.strictEqual(model2.textEditorModel.getLanguageId(), languageId);
  });
  test("preferred contents", async function() {
    const input = createFileInput(
      toResource.call(this, "/foo/bar/file.js"),
      void 0,
      void 0,
      void 0,
      void 0,
      "My contents"
    );
    const model = disposables.add(
      await input.resolve()
    );
    assert.strictEqual(model.textEditorModel.getValue(), "My contents");
    assert.strictEqual(input.isDirty(), true);
    const untypedInput = input.toUntyped({ preserveViewState: 0 });
    assert.strictEqual(untypedInput.contents, "My contents");
    const untypedInputWithoutContents = input.toUntyped();
    assert.strictEqual(untypedInputWithoutContents.contents, void 0);
    input.setPreferredContents("Other contents");
    await input.resolve();
    assert.strictEqual(model.textEditorModel.getValue(), "Other contents");
    model.textEditorModel?.setValue("Changed contents");
    await input.resolve();
    assert.strictEqual(
      model.textEditorModel.getValue(),
      "Changed contents"
    );
    const input2 = createFileInput(
      toResource.call(this, "/foo/bar/file.js")
    );
    input2.setPreferredContents("My contents");
    const model2 = await input2.resolve();
    assert.strictEqual(model2.textEditorModel.getValue(), "My contents");
    assert.strictEqual(input2.isDirty(), true);
  });
  test("matches", function() {
    const input1 = createFileInput(
      toResource.call(this, "/foo/bar/updatefile.js")
    );
    const input2 = createFileInput(
      toResource.call(this, "/foo/bar/updatefile.js")
    );
    const input3 = createFileInput(
      toResource.call(this, "/foo/bar/other.js")
    );
    const input2Upper = createFileInput(
      toResource.call(this, "/foo/bar/UPDATEFILE.js")
    );
    assert.strictEqual(input1.matches(input1), true);
    assert.strictEqual(input1.matches(input2), true);
    assert.strictEqual(input1.matches(input3), false);
    assert.strictEqual(input1.matches(input2Upper), false);
  });
  test("getEncoding/setEncoding", async function() {
    const input = createFileInput(
      toResource.call(this, "/foo/bar/updatefile.js")
    );
    await input.setEncoding("utf16", EncodingMode.Encode);
    assert.strictEqual(input.getEncoding(), "utf16");
    const resolved = disposables.add(
      await input.resolve()
    );
    assert.strictEqual(input.getEncoding(), resolved.getEncoding());
  });
  test("save", async function() {
    const input = createFileInput(
      toResource.call(this, "/foo/bar/updatefile.js")
    );
    const resolved = disposables.add(
      await input.resolve()
    );
    resolved.textEditorModel.setValue("changed");
    assert.ok(input.isDirty());
    assert.ok(input.isModified());
    await input.save(0);
    assert.ok(!input.isDirty());
    assert.ok(!input.isModified());
  });
  test("revert", async function() {
    const input = createFileInput(
      toResource.call(this, "/foo/bar/updatefile.js")
    );
    const resolved = disposables.add(
      await input.resolve()
    );
    resolved.textEditorModel.setValue("changed");
    assert.ok(input.isDirty());
    assert.ok(input.isModified());
    await input.revert(0);
    assert.ok(!input.isDirty());
    assert.ok(!input.isModified());
    input.dispose();
    assert.ok(input.isDisposed());
  });
  test("resolve handles binary files", async function() {
    const input = createFileInput(
      toResource.call(this, "/foo/bar/updatefile.js")
    );
    accessor.textFileService.setReadStreamErrorOnce(
      new TextFileOperationError(
        "error",
        TextFileOperationResult.FILE_IS_BINARY
      )
    );
    const resolved = disposables.add(await input.resolve());
    assert.ok(resolved);
  });
  test("resolve throws for too large files", async function() {
    const input = createFileInput(
      toResource.call(this, "/foo/bar/updatefile.js")
    );
    let e;
    accessor.textFileService.setReadStreamErrorOnce(
      new TooLargeFileOperationError(
        "error",
        FileOperationResult.FILE_TOO_LARGE,
        1e3
      )
    );
    try {
      await input.resolve();
    } catch (error) {
      e = error;
    }
    assert.ok(e);
  });
  test("attaches to model when created and reports dirty", async function() {
    const input = createFileInput(
      toResource.call(this, "/foo/bar/updatefile.js")
    );
    let listenerCount = 0;
    disposables.add(
      input.onDidChangeDirty(() => {
        listenerCount++;
      })
    );
    const model = disposables.add(
      await accessor.textFileService.files.resolve(input.resource)
    );
    model.textEditorModel?.setValue("hello world");
    assert.strictEqual(listenerCount, 1);
    assert.ok(input.isDirty());
  });
  test("force open text/binary", async function() {
    const input = createFileInput(
      toResource.call(this, "/foo/bar/updatefile.js")
    );
    input.setForceOpenAsBinary();
    let resolved = disposables.add(await input.resolve());
    assert.ok(resolved instanceof BinaryEditorModel);
    input.setForceOpenAsText();
    resolved = disposables.add(await input.resolve());
    assert.ok(resolved instanceof TextFileEditorModel);
  });
  test("file editor serializer", async function() {
    instantiationService.invokeFunction(
      (accessor2) => Registry.as(
        EditorExtensions.EditorFactory
      ).start(accessor2)
    );
    const input = createFileInput(
      toResource.call(this, "/foo/bar/updatefile.js")
    );
    disposables.add(
      Registry.as(
        EditorExtensions.EditorFactory
      ).registerEditorSerializer(
        "workbench.editors.files.fileEditorInput",
        FileEditorInputSerializer
      )
    );
    const editorSerializer = Registry.as(
      EditorExtensions.EditorFactory
    ).getEditorSerializer(input.typeId);
    if (!editorSerializer) {
      assert.fail("File Editor Input Serializer missing");
    }
    assert.strictEqual(editorSerializer.canSerialize(input), true);
    const inputSerialized = editorSerializer.serialize(input);
    if (!inputSerialized) {
      assert.fail("Unexpected serialized file input");
    }
    const inputDeserialized = editorSerializer.deserialize(
      instantiationService,
      inputSerialized
    );
    assert.strictEqual(
      inputDeserialized ? input.matches(inputDeserialized) : false,
      true
    );
    const preferredResource = toResource.call(
      this,
      "/foo/bar/UPDATEfile.js"
    );
    const inputWithPreferredResource = createFileInput(
      toResource.call(this, "/foo/bar/updatefile.js"),
      preferredResource
    );
    const inputWithPreferredResourceSerialized = editorSerializer.serialize(
      inputWithPreferredResource
    );
    if (!inputWithPreferredResourceSerialized) {
      assert.fail("Unexpected serialized file input");
    }
    const inputWithPreferredResourceDeserialized = editorSerializer.deserialize(
      instantiationService,
      inputWithPreferredResourceSerialized
    );
    assert.strictEqual(
      inputWithPreferredResource.resource.toString(),
      inputWithPreferredResourceDeserialized.resource.toString()
    );
    assert.strictEqual(
      inputWithPreferredResource.preferredResource.toString(),
      inputWithPreferredResourceDeserialized.preferredResource.toString()
    );
  });
  test("preferred name/description", async function() {
    const customFileInput = createFileInput(
      toResource.call(this, "/foo/bar/updatefile.js").with({ scheme: "test-custom" }),
      void 0,
      void 0,
      "My Name",
      "My Description"
    );
    let didChangeLabelCounter = 0;
    disposables.add(
      customFileInput.onDidChangeLabel(() => {
        didChangeLabelCounter++;
      })
    );
    assert.strictEqual(customFileInput.getName(), "My Name");
    assert.strictEqual(customFileInput.getDescription(), "My Description");
    customFileInput.setPreferredName("My Name 2");
    customFileInput.setPreferredDescription("My Description 2");
    assert.strictEqual(customFileInput.getName(), "My Name 2");
    assert.strictEqual(
      customFileInput.getDescription(),
      "My Description 2"
    );
    assert.strictEqual(didChangeLabelCounter, 2);
    customFileInput.dispose();
    const fileInput = createFileInput(
      toResource.call(this, "/foo/bar/updatefile.js"),
      void 0,
      void 0,
      "My Name",
      "My Description"
    );
    didChangeLabelCounter = 0;
    disposables.add(
      fileInput.onDidChangeLabel(() => {
        didChangeLabelCounter++;
      })
    );
    assert.notStrictEqual(fileInput.getName(), "My Name");
    assert.notStrictEqual(fileInput.getDescription(), "My Description");
    fileInput.setPreferredName("My Name 2");
    fileInput.setPreferredDescription("My Description 2");
    assert.notStrictEqual(fileInput.getName(), "My Name 2");
    assert.notStrictEqual(fileInput.getDescription(), "My Description 2");
    assert.strictEqual(didChangeLabelCounter, 0);
  });
  test("reports readonly changes", async function() {
    const input = createFileInput(
      toResource.call(this, "/foo/bar/updatefile.js")
    );
    let listenerCount = 0;
    disposables.add(
      input.onDidChangeCapabilities(() => {
        listenerCount++;
      })
    );
    const model = disposables.add(
      await accessor.textFileService.files.resolve(input.resource)
    );
    assert.strictEqual(model.isReadonly(), false);
    assert.strictEqual(
      input.hasCapability(EditorInputCapabilities.Readonly),
      false
    );
    assert.strictEqual(input.isReadonly(), false);
    const stat = await accessor.fileService.resolve(input.resource, {
      resolveMetadata: true
    });
    try {
      accessor.fileService.readShouldThrowError = new NotModifiedSinceFileOperationError(
        "file not modified since",
        { ...stat, readonly: true }
      );
      await input.resolve();
    } finally {
      accessor.fileService.readShouldThrowError = void 0;
    }
    assert.strictEqual(!!model.isReadonly(), true);
    assert.strictEqual(
      input.hasCapability(EditorInputCapabilities.Readonly),
      true
    );
    assert.strictEqual(!!input.isReadonly(), true);
    assert.strictEqual(listenerCount, 1);
    try {
      accessor.fileService.readShouldThrowError = new NotModifiedSinceFileOperationError(
        "file not modified since",
        { ...stat, readonly: false }
      );
      await input.resolve();
    } finally {
      accessor.fileService.readShouldThrowError = void 0;
    }
    assert.strictEqual(model.isReadonly(), false);
    assert.strictEqual(
      input.hasCapability(EditorInputCapabilities.Readonly),
      false
    );
    assert.strictEqual(input.isReadonly(), false);
    assert.strictEqual(listenerCount, 2);
  });
  ensureNoDisposablesAreLeakedInTestSuite();
});
