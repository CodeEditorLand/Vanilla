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
import {
  Disposable,
  DisposableStore
} from "../../../../../base/common/lifecycle.js";
import { isLinux } from "../../../../../base/common/platform.js";
import { URI } from "../../../../../base/common/uri.js";
import {
  ensureNoDisposablesAreLeakedInTestSuite,
  toResource
} from "../../../../../base/test/common/utils.js";
import { ILanguageService } from "../../../../../editor/common/languages/language.js";
import { IFileService } from "../../../../../platform/files/common/files.js";
import { NullFileSystemProvider } from "../../../../../platform/files/test/common/nullFileSystemProvider.js";
import { SyncDescriptor } from "../../../../../platform/instantiation/common/descriptors.js";
import {
  isResourceDiffEditorInput,
  isResourceSideBySideEditorInput,
  isUntitledResourceEditorInput
} from "../../../../common/editor.js";
import { DiffEditorInput } from "../../../../common/editor/diffEditorInput.js";
import { SideBySideEditorInput } from "../../../../common/editor/sideBySideEditorInput.js";
import { TextResourceEditorInput } from "../../../../common/editor/textResourceEditorInput.js";
import { FileEditorInput } from "../../../../contrib/files/browser/editors/fileEditorInput.js";
import {
  TestFileEditorInput,
  registerTestEditor,
  registerTestResourceEditor,
  registerTestSideBySideEditor,
  workbenchInstantiationService
} from "../../../../test/browser/workbenchTestServices.js";
import { UntitledTextEditorInput } from "../../../untitled/common/untitledTextEditorInput.js";
import { TextEditorService } from "../../common/textEditorService.js";
suite("TextEditorService", () => {
  const TEST_EDITOR_ID = "MyTestEditorForEditorService";
  const TEST_EDITOR_INPUT_ID = "testEditorInputForEditorService";
  let FileServiceProvider = class extends Disposable {
    constructor(scheme, fileService) {
      super();
      this._register(
        fileService.registerProvider(
          scheme,
          new NullFileSystemProvider()
        )
      );
    }
  };
  FileServiceProvider = __decorateClass([
    __decorateParam(1, IFileService)
  ], FileServiceProvider);
  const disposables = new DisposableStore();
  setup(() => {
    disposables.add(
      registerTestEditor(
        TEST_EDITOR_ID,
        [new SyncDescriptor(TestFileEditorInput)],
        TEST_EDITOR_INPUT_ID
      )
    );
    disposables.add(registerTestResourceEditor());
    disposables.add(registerTestSideBySideEditor());
  });
  teardown(() => {
    disposables.clear();
  });
  test("createTextEditor - basics", async function() {
    const instantiationService = workbenchInstantiationService(
      void 0,
      disposables
    );
    const languageService = instantiationService.get(ILanguageService);
    const service = disposables.add(
      instantiationService.createInstance(TextEditorService)
    );
    const languageId = "create-input-test";
    disposables.add(
      languageService.registerLanguage({
        id: languageId
      })
    );
    let input = disposables.add(
      service.createTextEditor({
        resource: toResource.call(this, "/index.html"),
        options: { selection: { startLineNumber: 1, startColumn: 1 } }
      })
    );
    assert(input instanceof FileEditorInput);
    let contentInput = input;
    assert.strictEqual(
      contentInput.resource.fsPath,
      toResource.call(this, "/index.html").fsPath
    );
    input = disposables.add(
      service.createTextEditor({
        resource: toResource.call(this, "/index.html")
      })
    );
    const inputDifferentCase = disposables.add(
      service.createTextEditor({
        resource: toResource.call(this, "/INDEX.html")
      })
    );
    if (isLinux) {
      assert.notStrictEqual(input, inputDifferentCase);
      assert.notStrictEqual(
        input.resource?.toString(),
        inputDifferentCase.resource?.toString()
      );
    } else {
      assert.strictEqual(input, inputDifferentCase);
      assert.strictEqual(
        input.resource?.toString(),
        inputDifferentCase.resource?.toString()
      );
    }
    assert.strictEqual(
      disposables.add(service.createTextEditor(input)),
      input
    );
    input = disposables.add(
      service.createTextEditor({
        resource: toResource.call(this, "/index.html"),
        encoding: "utf16le",
        options: { selection: { startLineNumber: 1, startColumn: 1 } }
      })
    );
    assert(input instanceof FileEditorInput);
    contentInput = input;
    assert.strictEqual(contentInput.getPreferredEncoding(), "utf16le");
    input = disposables.add(
      service.createTextEditor({
        resource: toResource.call(this, "/index.html"),
        languageId
      })
    );
    assert(input instanceof FileEditorInput);
    contentInput = input;
    assert.strictEqual(contentInput.getPreferredLanguageId(), languageId);
    let fileModel = disposables.add(
      await contentInput.resolve()
    );
    assert.strictEqual(
      fileModel.textEditorModel?.getLanguageId(),
      languageId
    );
    input = disposables.add(
      service.createTextEditor({
        resource: toResource.call(this, "/index.html"),
        contents: "My contents"
      })
    );
    assert(input instanceof FileEditorInput);
    contentInput = input;
    fileModel = disposables.add(
      await contentInput.resolve()
    );
    assert.strictEqual(
      fileModel.textEditorModel?.getValue(),
      "My contents"
    );
    assert.strictEqual(fileModel.isDirty(), true);
    input = disposables.add(
      service.createTextEditor({
        resource: toResource.call(this, "/index.html"),
        languageId: "text"
      })
    );
    assert(input instanceof FileEditorInput);
    contentInput = input;
    assert.strictEqual(contentInput.getPreferredLanguageId(), "text");
    input = disposables.add(
      service.createTextEditor({
        resource: void 0,
        options: { selection: { startLineNumber: 1, startColumn: 1 } }
      })
    );
    assert(input instanceof UntitledTextEditorInput);
    let untypedInput = {
      contents: "Hello Untitled",
      options: { selection: { startLineNumber: 1, startColumn: 1 } }
    };
    input = disposables.add(service.createTextEditor(untypedInput));
    assert.ok(isUntitledResourceEditorInput(untypedInput));
    assert(input instanceof UntitledTextEditorInput);
    let model = disposables.add(
      await input.resolve()
    );
    assert.strictEqual(model.textEditorModel?.getValue(), "Hello Untitled");
    input = disposables.add(
      service.createTextEditor({
        resource: void 0,
        languageId,
        options: { selection: { startLineNumber: 1, startColumn: 1 } }
      })
    );
    assert(input instanceof UntitledTextEditorInput);
    model = disposables.add(
      await input.resolve()
    );
    assert.strictEqual(model.getLanguageId(), languageId);
    input = disposables.add(
      service.createTextEditor({
        resource: URI.file("/some/path.txt"),
        forceUntitled: true,
        options: { selection: { startLineNumber: 1, startColumn: 1 } }
      })
    );
    assert(input instanceof UntitledTextEditorInput);
    assert.ok(input.hasAssociatedFilePath);
    untypedInput = {
      resource: URI.parse("untitled://Untitled-1"),
      forceUntitled: true,
      options: { selection: { startLineNumber: 1, startColumn: 1 } }
    };
    assert.ok(isUntitledResourceEditorInput(untypedInput));
    input = disposables.add(service.createTextEditor(untypedInput));
    assert(input instanceof UntitledTextEditorInput);
    assert.ok(!input.hasAssociatedFilePath);
    untypedInput = { resource: URI.file("/fake"), forceUntitled: true };
    assert.ok(isUntitledResourceEditorInput(untypedInput));
    input = disposables.add(service.createTextEditor(untypedInput));
    assert(input instanceof UntitledTextEditorInput);
    const provider = disposables.add(
      instantiationService.createInstance(
        FileServiceProvider,
        "untitled-custom"
      )
    );
    input = disposables.add(
      service.createTextEditor({
        resource: URI.parse("untitled-custom://some/path"),
        forceUntitled: true,
        options: { selection: { startLineNumber: 1, startColumn: 1 } }
      })
    );
    assert(input instanceof UntitledTextEditorInput);
    assert.ok(input.hasAssociatedFilePath);
    provider.dispose();
    input = disposables.add(
      service.createTextEditor({
        resource: URI.parse("custom:resource")
      })
    );
    assert(input instanceof TextResourceEditorInput);
    const resourceDiffInput = {
      modified: { resource: toResource.call(this, "/modified.html") },
      original: { resource: toResource.call(this, "/original.html") }
    };
    assert.strictEqual(isResourceDiffEditorInput(resourceDiffInput), true);
    input = disposables.add(service.createTextEditor(resourceDiffInput));
    assert(input instanceof DiffEditorInput);
    disposables.add(input.modified);
    disposables.add(input.original);
    assert.strictEqual(
      input.original.resource?.toString(),
      resourceDiffInput.original.resource.toString()
    );
    assert.strictEqual(
      input.modified.resource?.toString(),
      resourceDiffInput.modified.resource.toString()
    );
    const untypedDiffInput = input.toUntyped();
    assert.strictEqual(
      untypedDiffInput.original.resource?.toString(),
      resourceDiffInput.original.resource.toString()
    );
    assert.strictEqual(
      untypedDiffInput.modified.resource?.toString(),
      resourceDiffInput.modified.resource.toString()
    );
    const sideBySideResourceInput = {
      primary: { resource: toResource.call(this, "/primary.html") },
      secondary: { resource: toResource.call(this, "/secondary.html") }
    };
    assert.strictEqual(
      isResourceSideBySideEditorInput(sideBySideResourceInput),
      true
    );
    input = disposables.add(
      service.createTextEditor(sideBySideResourceInput)
    );
    assert(input instanceof SideBySideEditorInput);
    disposables.add(input.primary);
    disposables.add(input.secondary);
    assert.strictEqual(
      input.primary.resource?.toString(),
      sideBySideResourceInput.primary.resource.toString()
    );
    assert.strictEqual(
      input.secondary.resource?.toString(),
      sideBySideResourceInput.secondary.resource.toString()
    );
    const untypedSideBySideInput = input.toUntyped();
    assert.strictEqual(
      untypedSideBySideInput.primary.resource?.toString(),
      sideBySideResourceInput.primary.resource.toString()
    );
    assert.strictEqual(
      untypedSideBySideInput.secondary.resource?.toString(),
      sideBySideResourceInput.secondary.resource.toString()
    );
  });
  test("createTextEditor- caching", function() {
    const instantiationService = workbenchInstantiationService(
      void 0,
      disposables
    );
    const service = disposables.add(
      instantiationService.createInstance(TextEditorService)
    );
    const fileResource1 = toResource.call(this, "/foo/bar/cache1.js");
    const fileEditorInput1 = disposables.add(
      service.createTextEditor({ resource: fileResource1 })
    );
    assert.ok(fileEditorInput1);
    const fileResource2 = toResource.call(this, "/foo/bar/cache2.js");
    const fileEditorInput2 = disposables.add(
      service.createTextEditor({ resource: fileResource2 })
    );
    assert.ok(fileEditorInput2);
    assert.notStrictEqual(fileEditorInput1, fileEditorInput2);
    const fileEditorInput1Again = disposables.add(
      service.createTextEditor({ resource: fileResource1 })
    );
    assert.strictEqual(fileEditorInput1Again, fileEditorInput1);
    fileEditorInput1Again.dispose();
    assert.ok(fileEditorInput1.isDisposed());
    const fileEditorInput1AgainAndAgain = disposables.add(
      service.createTextEditor({ resource: fileResource1 })
    );
    assert.notStrictEqual(fileEditorInput1AgainAndAgain, fileEditorInput1);
    assert.ok(!fileEditorInput1AgainAndAgain.isDisposed());
    const resource1 = URI.from({
      scheme: "custom",
      path: "/foo/bar/cache1.js"
    });
    const input1 = disposables.add(
      service.createTextEditor({ resource: resource1 })
    );
    assert.ok(input1);
    const resource2 = URI.from({
      scheme: "custom",
      path: "/foo/bar/cache2.js"
    });
    const input2 = disposables.add(
      service.createTextEditor({ resource: resource2 })
    );
    assert.ok(input2);
    assert.notStrictEqual(input1, input2);
    const input1Again = disposables.add(
      service.createTextEditor({ resource: resource1 })
    );
    assert.strictEqual(input1Again, input1);
    input1Again.dispose();
    assert.ok(input1.isDisposed());
    const input1AgainAndAgain = disposables.add(
      service.createTextEditor({ resource: resource1 })
    );
    assert.notStrictEqual(input1AgainAndAgain, input1);
    assert.ok(!input1AgainAndAgain.isDisposed());
  });
  ensureNoDisposablesAreLeakedInTestSuite();
});
