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
import { Registry } from "../../../platform/registry/common/platform.js";
import { IQuickAccessRegistry, Extensions, IQuickAccessProvider, QuickAccessRegistry } from "../../../platform/quickinput/common/quickAccess.js";
import { IQuickPick, IQuickPickItem, IQuickInputService } from "../../../platform/quickinput/common/quickInput.js";
import { CancellationToken } from "../../../base/common/cancellation.js";
import { TestServiceAccessor, workbenchInstantiationService, createEditorPart } from "./workbenchTestServices.js";
import { DisposableStore, toDisposable, IDisposable } from "../../../base/common/lifecycle.js";
import { timeout } from "../../../base/common/async.js";
import { PickerQuickAccessProvider, FastAndSlowPicks } from "../../../platform/quickinput/browser/pickerQuickAccess.js";
import { URI } from "../../../base/common/uri.js";
import { IEditorGroupsService } from "../../services/editor/common/editorGroupsService.js";
import { IEditorService } from "../../services/editor/common/editorService.js";
import { EditorService } from "../../services/editor/browser/editorService.js";
import { PickerEditorState } from "../../browser/quickaccess.js";
import { EditorsOrder } from "../../common/editor.js";
import { Range } from "../../../editor/common/core/range.js";
import { TestInstantiationService } from "../../../platform/instantiation/test/common/instantiationServiceMock.js";
suite("QuickAccess", () => {
  let disposables;
  let instantiationService;
  let accessor;
  let providerDefaultCalled = false;
  let providerDefaultCanceled = false;
  let providerDefaultDisposed = false;
  let provider1Called = false;
  let provider1Canceled = false;
  let provider1Disposed = false;
  let provider2Called = false;
  let provider2Canceled = false;
  let provider2Disposed = false;
  let provider3Called = false;
  let provider3Canceled = false;
  let provider3Disposed = false;
  let TestProviderDefault = class {
    constructor(quickInputService, disposables2) {
      this.quickInputService = quickInputService;
    }
    static {
      __name(this, "TestProviderDefault");
    }
    provide(picker, token) {
      assert.ok(picker);
      providerDefaultCalled = true;
      token.onCancellationRequested(() => providerDefaultCanceled = true);
      setTimeout(() => this.quickInputService.quickAccess.show(providerDescriptor3.prefix));
      return toDisposable(() => providerDefaultDisposed = true);
    }
  };
  TestProviderDefault = __decorateClass([
    __decorateParam(0, IQuickInputService)
  ], TestProviderDefault);
  class TestProvider1 {
    static {
      __name(this, "TestProvider1");
    }
    provide(picker, token) {
      assert.ok(picker);
      provider1Called = true;
      token.onCancellationRequested(() => provider1Canceled = true);
      return toDisposable(() => provider1Disposed = true);
    }
  }
  class TestProvider2 {
    static {
      __name(this, "TestProvider2");
    }
    provide(picker, token) {
      assert.ok(picker);
      provider2Called = true;
      token.onCancellationRequested(() => provider2Canceled = true);
      return toDisposable(() => provider2Disposed = true);
    }
  }
  class TestProvider3 {
    static {
      __name(this, "TestProvider3");
    }
    provide(picker, token) {
      assert.ok(picker);
      provider3Called = true;
      token.onCancellationRequested(() => provider3Canceled = true);
      setTimeout(() => picker.hide());
      return toDisposable(() => provider3Disposed = true);
    }
  }
  const providerDescriptorDefault = { ctor: TestProviderDefault, prefix: "", helpEntries: [] };
  const providerDescriptor1 = { ctor: TestProvider1, prefix: "test", helpEntries: [] };
  const providerDescriptor2 = { ctor: TestProvider2, prefix: "test something", helpEntries: [] };
  const providerDescriptor3 = { ctor: TestProvider3, prefix: "changed", helpEntries: [] };
  setup(() => {
    disposables = new DisposableStore();
    instantiationService = workbenchInstantiationService(void 0, disposables);
    accessor = instantiationService.createInstance(TestServiceAccessor);
  });
  teardown(() => {
    disposables.dispose();
  });
  test("registry", () => {
    const registry = Registry.as(Extensions.Quickaccess);
    const restore = registry.clear();
    assert.ok(!registry.getQuickAccessProvider("test"));
    const disposables2 = new DisposableStore();
    disposables2.add(registry.registerQuickAccessProvider(providerDescriptorDefault));
    assert(registry.getQuickAccessProvider("") === providerDescriptorDefault);
    assert(registry.getQuickAccessProvider("test") === providerDescriptorDefault);
    const disposable = disposables2.add(registry.registerQuickAccessProvider(providerDescriptor1));
    assert(registry.getQuickAccessProvider("test") === providerDescriptor1);
    const providers = registry.getQuickAccessProviders();
    assert(providers.some((provider) => provider.prefix === "test"));
    disposable.dispose();
    assert(registry.getQuickAccessProvider("test") === providerDescriptorDefault);
    disposables2.dispose();
    assert.ok(!registry.getQuickAccessProvider("test"));
    restore();
  });
  test("provider", async () => {
    const registry = Registry.as(Extensions.Quickaccess);
    const restore = registry.clear();
    const disposables2 = new DisposableStore();
    disposables2.add(registry.registerQuickAccessProvider(providerDescriptorDefault));
    disposables2.add(registry.registerQuickAccessProvider(providerDescriptor1));
    disposables2.add(registry.registerQuickAccessProvider(providerDescriptor2));
    disposables2.add(registry.registerQuickAccessProvider(providerDescriptor3));
    accessor.quickInputService.quickAccess.show("test");
    assert.strictEqual(providerDefaultCalled, false);
    assert.strictEqual(provider1Called, true);
    assert.strictEqual(provider2Called, false);
    assert.strictEqual(provider3Called, false);
    assert.strictEqual(providerDefaultCanceled, false);
    assert.strictEqual(provider1Canceled, false);
    assert.strictEqual(provider2Canceled, false);
    assert.strictEqual(provider3Canceled, false);
    assert.strictEqual(providerDefaultDisposed, false);
    assert.strictEqual(provider1Disposed, false);
    assert.strictEqual(provider2Disposed, false);
    assert.strictEqual(provider3Disposed, false);
    provider1Called = false;
    accessor.quickInputService.quickAccess.show("test something");
    assert.strictEqual(providerDefaultCalled, false);
    assert.strictEqual(provider1Called, false);
    assert.strictEqual(provider2Called, true);
    assert.strictEqual(provider3Called, false);
    assert.strictEqual(providerDefaultCanceled, false);
    assert.strictEqual(provider1Canceled, true);
    assert.strictEqual(provider2Canceled, false);
    assert.strictEqual(provider3Canceled, false);
    assert.strictEqual(providerDefaultDisposed, false);
    assert.strictEqual(provider1Disposed, true);
    assert.strictEqual(provider2Disposed, false);
    assert.strictEqual(provider3Disposed, false);
    provider2Called = false;
    provider1Canceled = false;
    provider1Disposed = false;
    accessor.quickInputService.quickAccess.show("usedefault");
    assert.strictEqual(providerDefaultCalled, true);
    assert.strictEqual(provider1Called, false);
    assert.strictEqual(provider2Called, false);
    assert.strictEqual(provider3Called, false);
    assert.strictEqual(providerDefaultCanceled, false);
    assert.strictEqual(provider1Canceled, false);
    assert.strictEqual(provider2Canceled, true);
    assert.strictEqual(provider3Canceled, false);
    assert.strictEqual(providerDefaultDisposed, false);
    assert.strictEqual(provider1Disposed, false);
    assert.strictEqual(provider2Disposed, true);
    assert.strictEqual(provider3Disposed, false);
    await timeout(1);
    assert.strictEqual(providerDefaultCanceled, true);
    assert.strictEqual(providerDefaultDisposed, true);
    assert.strictEqual(provider3Called, true);
    await timeout(1);
    assert.strictEqual(provider3Canceled, true);
    assert.strictEqual(provider3Disposed, true);
    disposables2.dispose();
    restore();
  });
  let fastProviderCalled = false;
  let slowProviderCalled = false;
  let fastAndSlowProviderCalled = false;
  let slowProviderCanceled = false;
  let fastAndSlowProviderCanceled = false;
  class FastTestQuickPickProvider extends PickerQuickAccessProvider {
    static {
      __name(this, "FastTestQuickPickProvider");
    }
    constructor() {
      super("fast");
    }
    _getPicks(filter, disposables2, token) {
      fastProviderCalled = true;
      return [{ label: "Fast Pick" }];
    }
  }
  class SlowTestQuickPickProvider extends PickerQuickAccessProvider {
    static {
      __name(this, "SlowTestQuickPickProvider");
    }
    constructor() {
      super("slow");
    }
    async _getPicks(filter, disposables2, token) {
      slowProviderCalled = true;
      await timeout(1);
      if (token.isCancellationRequested) {
        slowProviderCanceled = true;
      }
      return [{ label: "Slow Pick" }];
    }
  }
  class FastAndSlowTestQuickPickProvider extends PickerQuickAccessProvider {
    static {
      __name(this, "FastAndSlowTestQuickPickProvider");
    }
    constructor() {
      super("bothFastAndSlow");
    }
    _getPicks(filter, disposables2, token) {
      fastAndSlowProviderCalled = true;
      return {
        picks: [{ label: "Fast Pick" }],
        additionalPicks: (async () => {
          await timeout(1);
          if (token.isCancellationRequested) {
            fastAndSlowProviderCanceled = true;
          }
          return [{ label: "Slow Pick" }];
        })()
      };
    }
  }
  const fastProviderDescriptor = { ctor: FastTestQuickPickProvider, prefix: "fast", helpEntries: [] };
  const slowProviderDescriptor = { ctor: SlowTestQuickPickProvider, prefix: "slow", helpEntries: [] };
  const fastAndSlowProviderDescriptor = { ctor: FastAndSlowTestQuickPickProvider, prefix: "bothFastAndSlow", helpEntries: [] };
  test("quick pick access - show()", async () => {
    const registry = Registry.as(Extensions.Quickaccess);
    const restore = registry.clear();
    const disposables2 = new DisposableStore();
    disposables2.add(registry.registerQuickAccessProvider(fastProviderDescriptor));
    disposables2.add(registry.registerQuickAccessProvider(slowProviderDescriptor));
    disposables2.add(registry.registerQuickAccessProvider(fastAndSlowProviderDescriptor));
    accessor.quickInputService.quickAccess.show("fast");
    assert.strictEqual(fastProviderCalled, true);
    assert.strictEqual(slowProviderCalled, false);
    assert.strictEqual(fastAndSlowProviderCalled, false);
    fastProviderCalled = false;
    accessor.quickInputService.quickAccess.show("slow");
    await timeout(2);
    assert.strictEqual(fastProviderCalled, false);
    assert.strictEqual(slowProviderCalled, true);
    assert.strictEqual(slowProviderCanceled, false);
    assert.strictEqual(fastAndSlowProviderCalled, false);
    slowProviderCalled = false;
    accessor.quickInputService.quickAccess.show("bothFastAndSlow");
    await timeout(2);
    assert.strictEqual(fastProviderCalled, false);
    assert.strictEqual(slowProviderCalled, false);
    assert.strictEqual(fastAndSlowProviderCalled, true);
    assert.strictEqual(fastAndSlowProviderCanceled, false);
    fastAndSlowProviderCalled = false;
    accessor.quickInputService.quickAccess.show("slow");
    accessor.quickInputService.quickAccess.show("bothFastAndSlow");
    accessor.quickInputService.quickAccess.show("fast");
    assert.strictEqual(fastProviderCalled, true);
    assert.strictEqual(slowProviderCalled, true);
    assert.strictEqual(fastAndSlowProviderCalled, true);
    await timeout(2);
    assert.strictEqual(slowProviderCanceled, true);
    assert.strictEqual(fastAndSlowProviderCanceled, true);
    disposables2.dispose();
    restore();
  });
  test("quick pick access - pick()", async () => {
    const registry = Registry.as(Extensions.Quickaccess);
    const restore = registry.clear();
    const disposables2 = new DisposableStore();
    disposables2.add(registry.registerQuickAccessProvider(fastProviderDescriptor));
    const result = accessor.quickInputService.quickAccess.pick("fast");
    assert.strictEqual(fastProviderCalled, true);
    assert.ok(result instanceof Promise);
    disposables2.dispose();
    restore();
  });
  test("PickerEditorState can properly restore editors", async () => {
    const part = await createEditorPart(instantiationService, disposables);
    instantiationService.stub(IEditorGroupsService, part);
    const editorService = disposables.add(instantiationService.createInstance(EditorService, void 0));
    instantiationService.stub(IEditorService, editorService);
    const editorViewState = disposables.add(instantiationService.createInstance(PickerEditorState));
    disposables.add(part);
    disposables.add(editorService);
    const input1 = {
      resource: URI.parse("foo://bar1"),
      options: {
        pinned: true,
        preserveFocus: true,
        selection: new Range(1, 0, 1, 3)
      }
    };
    const input2 = {
      resource: URI.parse("foo://bar2"),
      options: {
        pinned: true,
        selection: new Range(1, 0, 1, 3)
      }
    };
    const input3 = {
      resource: URI.parse("foo://bar3")
    };
    const input4 = {
      resource: URI.parse("foo://bar4")
    };
    const editor = await editorService.openEditor(input1);
    assert.strictEqual(editor, editorService.activeEditorPane);
    editorViewState.set();
    await editorService.openEditor(input2);
    await editorViewState.openTransientEditor(input3);
    await editorViewState.openTransientEditor(input4);
    await editorViewState.restore();
    assert.strictEqual(part.activeGroup.activeEditor?.resource, input1.resource);
    assert.deepStrictEqual(part.activeGroup.getEditors(EditorsOrder.MOST_RECENTLY_ACTIVE).map((e) => e.resource), [input1.resource, input2.resource]);
    if (part.activeGroup.activeEditorPane?.getSelection) {
      assert.deepStrictEqual(part.activeGroup.activeEditorPane?.getSelection(), input1.options.selection);
    }
    await part.activeGroup.closeAllEditors();
  });
});
//# sourceMappingURL=quickAccess.test.js.map
