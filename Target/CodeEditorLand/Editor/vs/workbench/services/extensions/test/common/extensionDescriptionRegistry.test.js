var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { URI } from "../../../../../base/common/uri.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { ExtensionIdentifier, IExtensionDescription, TargetPlatform } from "../../../../../platform/extensions/common/extensions.js";
import { ExtensionDescriptionRegistry, IActivationEventsReader } from "../../common/extensionDescriptionRegistry.js";
suite("ExtensionDescriptionRegistry", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  test("allow removing and adding the same extension at a different version", () => {
    const idA = new ExtensionIdentifier("a");
    const extensionA1 = desc(idA, "1.0.0");
    const extensionA2 = desc(idA, "2.0.0");
    const basicActivationEventsReader = {
      readActivationEvents: /* @__PURE__ */ __name((extensionDescription) => {
        return extensionDescription.activationEvents ?? [];
      }, "readActivationEvents")
    };
    const registry = new ExtensionDescriptionRegistry(basicActivationEventsReader, [extensionA1]);
    registry.deltaExtensions([extensionA2], [idA]);
    assert.deepStrictEqual(registry.getAllExtensionDescriptions(), [extensionA2]);
  });
  function desc(id, version, activationEvents = ["*"]) {
    return {
      name: id.value,
      publisher: "test",
      version: "0.0.0",
      engines: { vscode: "^1.0.0" },
      identifier: id,
      extensionLocation: URI.parse(`nothing://nowhere`),
      isBuiltin: false,
      isUnderDevelopment: false,
      isUserBuiltin: false,
      activationEvents,
      main: "index.js",
      targetPlatform: TargetPlatform.UNDEFINED,
      extensionDependencies: [],
      enabledApiProposals: void 0
    };
  }
  __name(desc, "desc");
});
//# sourceMappingURL=extensionDescriptionRegistry.test.js.map
