import assert from "assert";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import { URI } from "../../../../../base/common/uri.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import {
  EditorResourceAccessor,
  isDiffEditorInput,
  isResourceDiffEditorInput,
  isResourceSideBySideEditorInput
} from "../../../../common/editor.js";
import { DiffEditorInput } from "../../../../common/editor/diffEditorInput.js";
import { EditorInput } from "../../../../common/editor/editorInput.js";
import { workbenchInstantiationService } from "../../workbenchTestServices.js";
suite("Diff editor input", () => {
  class MyEditorInput extends EditorInput {
    constructor(resource = void 0) {
      super();
      this.resource = resource;
    }
    get typeId() {
      return "myEditorInput";
    }
    resolve() {
      return null;
    }
    toUntyped() {
      return {
        resource: this.resource,
        options: { override: this.typeId }
      };
    }
    matches(otherInput) {
      if (super.matches(otherInput)) {
        return true;
      }
      const resource = EditorResourceAccessor.getCanonicalUri(otherInput);
      return resource?.toString() === this.resource?.toString();
    }
  }
  const disposables = new DisposableStore();
  teardown(() => {
    disposables.clear();
  });
  test("basics", () => {
    const instantiationService = workbenchInstantiationService(
      void 0,
      disposables
    );
    let counter = 0;
    const input = disposables.add(new MyEditorInput());
    disposables.add(
      input.onWillDispose(() => {
        assert(true);
        counter++;
      })
    );
    const otherInput = disposables.add(new MyEditorInput());
    disposables.add(
      otherInput.onWillDispose(() => {
        assert(true);
        counter++;
      })
    );
    const diffInput = instantiationService.createInstance(
      DiffEditorInput,
      "name",
      "description",
      input,
      otherInput,
      void 0
    );
    assert.ok(isDiffEditorInput(diffInput));
    assert.ok(!isDiffEditorInput(input));
    assert.strictEqual(diffInput.original, input);
    assert.strictEqual(diffInput.modified, otherInput);
    assert(diffInput.matches(diffInput));
    assert(!diffInput.matches(otherInput));
    diffInput.dispose();
    assert.strictEqual(counter, 0);
  });
  test("toUntyped", () => {
    const instantiationService = workbenchInstantiationService(
      void 0,
      disposables
    );
    const input = disposables.add(new MyEditorInput(URI.file("foo/bar1")));
    const otherInput = disposables.add(
      new MyEditorInput(URI.file("foo/bar2"))
    );
    const diffInput = instantiationService.createInstance(
      DiffEditorInput,
      "name",
      "description",
      input,
      otherInput,
      void 0
    );
    const untypedDiffInput = diffInput.toUntyped();
    assert.ok(isResourceDiffEditorInput(untypedDiffInput));
    assert.ok(!isResourceSideBySideEditorInput(untypedDiffInput));
    assert.ok(diffInput.matches(untypedDiffInput));
  });
  test("disposes when input inside disposes", () => {
    const instantiationService = workbenchInstantiationService(
      void 0,
      disposables
    );
    let counter = 0;
    let input = disposables.add(new MyEditorInput());
    let otherInput = disposables.add(new MyEditorInput());
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
    disposables.add(
      diffInput.onWillDispose(() => {
        counter++;
        assert(true);
      })
    );
    input.dispose();
    input = disposables.add(new MyEditorInput());
    otherInput = disposables.add(new MyEditorInput());
    const diffInput2 = disposables.add(
      instantiationService.createInstance(
        DiffEditorInput,
        "name",
        "description",
        input,
        otherInput,
        void 0
      )
    );
    disposables.add(
      diffInput2.onWillDispose(() => {
        counter++;
        assert(true);
      })
    );
    otherInput.dispose();
    assert.strictEqual(counter, 2);
  });
  ensureNoDisposablesAreLeakedInTestSuite();
});
