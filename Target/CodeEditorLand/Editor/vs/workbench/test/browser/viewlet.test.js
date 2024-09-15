var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { Registry } from "../../../platform/registry/common/platform.js";
import { PaneCompositeDescriptor, Extensions, PaneCompositeRegistry, PaneComposite } from "../../browser/panecomposite.js";
import { isFunction } from "../../../base/common/types.js";
import { IBoundarySashes } from "../../../base/browser/ui/sash/sash.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../base/test/common/utils.js";
suite("Viewlets", () => {
  class TestViewlet extends PaneComposite {
    static {
      __name(this, "TestViewlet");
    }
    constructor() {
      super("id", null, null, null, null, null, null, null);
    }
    layout(dimension) {
      throw new Error("Method not implemented.");
    }
    setBoundarySashes(sashes) {
      throw new Error("Method not implemented.");
    }
    createViewPaneContainer() {
      return null;
    }
  }
  test("ViewletDescriptor API", function() {
    const d = PaneCompositeDescriptor.create(TestViewlet, "id", "name", "class", 5);
    assert.strictEqual(d.id, "id");
    assert.strictEqual(d.name, "name");
    assert.strictEqual(d.cssClass, "class");
    assert.strictEqual(d.order, 5);
  });
  test("Editor Aware ViewletDescriptor API", function() {
    let d = PaneCompositeDescriptor.create(TestViewlet, "id", "name", "class", 5);
    assert.strictEqual(d.id, "id");
    assert.strictEqual(d.name, "name");
    d = PaneCompositeDescriptor.create(TestViewlet, "id", "name", "class", 5);
    assert.strictEqual(d.id, "id");
    assert.strictEqual(d.name, "name");
  });
  test("Viewlet extension point and registration", function() {
    assert(isFunction(Registry.as(Extensions.Viewlets).registerPaneComposite));
    assert(isFunction(Registry.as(Extensions.Viewlets).getPaneComposite));
    assert(isFunction(Registry.as(Extensions.Viewlets).getPaneComposites));
    const oldCount = Registry.as(Extensions.Viewlets).getPaneComposites().length;
    const d = PaneCompositeDescriptor.create(TestViewlet, "reg-test-id", "name");
    Registry.as(Extensions.Viewlets).registerPaneComposite(d);
    assert(d === Registry.as(Extensions.Viewlets).getPaneComposite("reg-test-id"));
    assert.strictEqual(oldCount + 1, Registry.as(Extensions.Viewlets).getPaneComposites().length);
  });
  ensureNoDisposablesAreLeakedInTestSuite();
});
//# sourceMappingURL=viewlet.test.js.map
