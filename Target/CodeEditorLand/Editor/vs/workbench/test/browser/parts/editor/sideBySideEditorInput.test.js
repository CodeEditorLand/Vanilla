var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import { URI } from "../../../../../base/common/uri.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { EditorResourceAccessor, IResourceSideBySideEditorInput, isResourceSideBySideEditorInput, isSideBySideEditorInput, IUntypedEditorInput } from "../../../../common/editor.js";
import { EditorInput } from "../../../../common/editor/editorInput.js";
import { SideBySideEditorInput } from "../../../../common/editor/sideBySideEditorInput.js";
import { TestFileEditorInput, workbenchInstantiationService } from "../../workbenchTestServices.js";
suite("SideBySideEditorInput", () => {
  const disposables = new DisposableStore();
  teardown(() => {
    disposables.clear();
  });
  class MyEditorInput extends EditorInput {
    constructor(resource = void 0) {
      super();
      this.resource = resource;
    }
    static {
      __name(this, "MyEditorInput");
    }
    fireCapabilitiesChangeEvent() {
      this._onDidChangeCapabilities.fire();
    }
    fireDirtyChangeEvent() {
      this._onDidChangeDirty.fire();
    }
    fireLabelChangeEvent() {
      this._onDidChangeLabel.fire();
    }
    get typeId() {
      return "myEditorInput";
    }
    resolve() {
      return null;
    }
    toUntyped() {
      return { resource: this.resource, options: { override: this.typeId } };
    }
    matches(otherInput) {
      if (super.matches(otherInput)) {
        return true;
      }
      const resource = EditorResourceAccessor.getCanonicalUri(otherInput);
      return resource?.toString() === this.resource?.toString();
    }
  }
  test("basics", () => {
    const instantiationService = workbenchInstantiationService(void 0, disposables);
    let counter = 0;
    const input = disposables.add(new MyEditorInput(URI.file("/fake")));
    disposables.add(input.onWillDispose(() => {
      assert(true);
      counter++;
    }));
    const otherInput = disposables.add(new MyEditorInput(URI.file("/fake2")));
    disposables.add(otherInput.onWillDispose(() => {
      assert(true);
      counter++;
    }));
    const sideBySideInput = disposables.add(instantiationService.createInstance(SideBySideEditorInput, "name", "description", input, otherInput));
    assert.strictEqual(sideBySideInput.getName(), "name");
    assert.strictEqual(sideBySideInput.getDescription(), "description");
    assert.ok(isSideBySideEditorInput(sideBySideInput));
    assert.ok(!isSideBySideEditorInput(input));
    assert.strictEqual(sideBySideInput.secondary, input);
    assert.strictEqual(sideBySideInput.primary, otherInput);
    assert(sideBySideInput.matches(sideBySideInput));
    assert(!sideBySideInput.matches(otherInput));
    sideBySideInput.dispose();
    assert.strictEqual(counter, 0);
    const sideBySideInputSame = disposables.add(instantiationService.createInstance(SideBySideEditorInput, void 0, void 0, input, input));
    assert.strictEqual(sideBySideInputSame.getName(), input.getName());
    assert.strictEqual(sideBySideInputSame.getDescription(), input.getDescription());
    assert.strictEqual(sideBySideInputSame.getTitle(), input.getTitle());
    assert.strictEqual(sideBySideInputSame.resource?.toString(), input.resource?.toString());
  });
  test("events dispatching", () => {
    const instantiationService = workbenchInstantiationService(void 0, disposables);
    const input = disposables.add(new MyEditorInput());
    const otherInput = disposables.add(new MyEditorInput());
    const sideBySideInut = disposables.add(instantiationService.createInstance(SideBySideEditorInput, "name", "description", otherInput, input));
    assert.ok(isSideBySideEditorInput(sideBySideInut));
    let capabilitiesChangeCounter = 0;
    disposables.add(sideBySideInut.onDidChangeCapabilities(() => capabilitiesChangeCounter++));
    let dirtyChangeCounter = 0;
    disposables.add(sideBySideInut.onDidChangeDirty(() => dirtyChangeCounter++));
    let labelChangeCounter = 0;
    disposables.add(sideBySideInut.onDidChangeLabel(() => labelChangeCounter++));
    input.fireCapabilitiesChangeEvent();
    assert.strictEqual(capabilitiesChangeCounter, 1);
    otherInput.fireCapabilitiesChangeEvent();
    assert.strictEqual(capabilitiesChangeCounter, 2);
    input.fireDirtyChangeEvent();
    otherInput.fireDirtyChangeEvent();
    assert.strictEqual(dirtyChangeCounter, 1);
    input.fireLabelChangeEvent();
    otherInput.fireLabelChangeEvent();
    assert.strictEqual(labelChangeCounter, 2);
  });
  test("toUntyped", () => {
    const instantiationService = workbenchInstantiationService(void 0, disposables);
    const primaryInput = disposables.add(new MyEditorInput(URI.file("/fake")));
    const secondaryInput = disposables.add(new MyEditorInput(URI.file("/fake2")));
    const sideBySideInput = disposables.add(instantiationService.createInstance(SideBySideEditorInput, "Side By Side Test", void 0, secondaryInput, primaryInput));
    const untypedSideBySideInput = sideBySideInput.toUntyped();
    assert.ok(isResourceSideBySideEditorInput(untypedSideBySideInput));
  });
  test("untyped matches", () => {
    const instantiationService = workbenchInstantiationService(void 0, disposables);
    const primaryInput = disposables.add(new TestFileEditorInput(URI.file("/fake"), "primaryId"));
    const secondaryInput = disposables.add(new TestFileEditorInput(URI.file("/fake2"), "secondaryId"));
    const sideBySideInput = disposables.add(instantiationService.createInstance(SideBySideEditorInput, "Side By Side Test", void 0, secondaryInput, primaryInput));
    const primaryUntypedInput = { resource: URI.file("/fake"), options: { override: "primaryId" } };
    const secondaryUntypedInput = { resource: URI.file("/fake2"), options: { override: "secondaryId" } };
    const sideBySideUntyped = { primary: primaryUntypedInput, secondary: secondaryUntypedInput };
    assert.ok(sideBySideInput.matches(sideBySideUntyped));
    const primaryUntypedInput2 = { resource: URI.file("/fake"), options: { override: "primaryIdWrong" } };
    const secondaryUntypedInput2 = { resource: URI.file("/fake2"), options: { override: "secondaryId" } };
    const sideBySideUntyped2 = { primary: primaryUntypedInput2, secondary: secondaryUntypedInput2 };
    assert.ok(!sideBySideInput.matches(sideBySideUntyped2));
    const primaryUntypedInput3 = { resource: URI.file("/fake"), options: { override: "primaryId" } };
    const secondaryUntypedInput3 = { resource: URI.file("/fake2Wrong"), options: { override: "secondaryId" } };
    const sideBySideUntyped3 = { primary: primaryUntypedInput3, secondary: secondaryUntypedInput3 };
    assert.ok(!sideBySideInput.matches(sideBySideUntyped3));
  });
  ensureNoDisposablesAreLeakedInTestSuite();
});
//# sourceMappingURL=sideBySideEditorInput.test.js.map
