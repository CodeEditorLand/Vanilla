var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import { isWeb } from "../../../../../base/common/platform.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { TestConfigurationService } from "../../../../../platform/configuration/test/common/testConfigurationService.js";
import { ExtensionUntrustedWorkspaceSupportType, IExtensionManifest } from "../../../../../platform/extensions/common/extensions.js";
import { TestInstantiationService } from "../../../../../platform/instantiation/test/common/instantiationServiceMock.js";
import { NullLogService } from "../../../../../platform/log/common/log.js";
import { IProductService } from "../../../../../platform/product/common/productService.js";
import { IWorkspaceTrustEnablementService } from "../../../../../platform/workspace/common/workspaceTrust.js";
import { ExtensionManifestPropertiesService } from "../../common/extensionManifestPropertiesService.js";
import { TestProductService, TestWorkspaceTrustEnablementService } from "../../../../test/common/workbenchTestServices.js";
suite("ExtensionManifestPropertiesService - ExtensionKind", () => {
  let disposables;
  let testObject;
  setup(() => {
    disposables = new DisposableStore();
    testObject = disposables.add(new ExtensionManifestPropertiesService(TestProductService, new TestConfigurationService(), new TestWorkspaceTrustEnablementService(), new NullLogService()));
  });
  teardown(() => {
    disposables.dispose();
  });
  ensureNoDisposablesAreLeakedInTestSuite();
  test("declarative with extension dependencies", () => {
    assert.deepStrictEqual(testObject.getExtensionKind({ extensionDependencies: ["ext1"] }), isWeb ? ["workspace", "web"] : ["workspace"]);
  });
  test("declarative extension pack", () => {
    assert.deepStrictEqual(testObject.getExtensionKind({ extensionPack: ["ext1", "ext2"] }), isWeb ? ["workspace", "web"] : ["workspace"]);
  });
  test("declarative extension pack and extension dependencies", () => {
    assert.deepStrictEqual(testObject.getExtensionKind({ extensionPack: ["ext1", "ext2"], extensionDependencies: ["ext1", "ext2"] }), isWeb ? ["workspace", "web"] : ["workspace"]);
  });
  test("declarative with unknown contribution point => workspace, web in web and => workspace in desktop", () => {
    assert.deepStrictEqual(testObject.getExtensionKind({ contributes: { "unknownPoint": { something: true } } }), isWeb ? ["workspace", "web"] : ["workspace"]);
  });
  test("declarative extension pack with unknown contribution point", () => {
    assert.deepStrictEqual(testObject.getExtensionKind({ extensionPack: ["ext1", "ext2"], contributes: { "unknownPoint": { something: true } } }), isWeb ? ["workspace", "web"] : ["workspace"]);
  });
  test("simple declarative => ui, workspace, web", () => {
    assert.deepStrictEqual(testObject.getExtensionKind({}), ["ui", "workspace", "web"]);
  });
  test("only browser => web", () => {
    assert.deepStrictEqual(testObject.getExtensionKind({ browser: "main.browser.js" }), ["web"]);
  });
  test("only main => workspace", () => {
    assert.deepStrictEqual(testObject.getExtensionKind({ main: "main.js" }), ["workspace"]);
  });
  test("main and browser => workspace, web in web and workspace in desktop", () => {
    assert.deepStrictEqual(testObject.getExtensionKind({ main: "main.js", browser: "main.browser.js" }), isWeb ? ["workspace", "web"] : ["workspace"]);
  });
  test("browser entry point with workspace extensionKind => workspace, web in web and workspace in desktop", () => {
    assert.deepStrictEqual(testObject.getExtensionKind({ main: "main.js", browser: "main.browser.js", extensionKind: ["workspace"] }), isWeb ? ["workspace", "web"] : ["workspace"]);
  });
  test("only browser entry point with out extensionKind => web", () => {
    assert.deepStrictEqual(testObject.getExtensionKind({ browser: "main.browser.js" }), ["web"]);
  });
  test("simple descriptive with workspace, ui extensionKind => workspace, ui, web in web and workspace, ui in desktop", () => {
    assert.deepStrictEqual(testObject.getExtensionKind({ extensionKind: ["workspace", "ui"] }), isWeb ? ["workspace", "ui", "web"] : ["workspace", "ui"]);
  });
  test("opt out from web through settings even if it can run in web", () => {
    testObject = disposables.add(new ExtensionManifestPropertiesService(TestProductService, new TestConfigurationService({ remote: { extensionKind: { "pub.a": ["-web"] } } }), new TestWorkspaceTrustEnablementService(), new NullLogService()));
    assert.deepStrictEqual(testObject.getExtensionKind({ browser: "main.browser.js", publisher: "pub", name: "a" }), ["ui", "workspace"]);
  });
  test("opt out from web and include only workspace through settings even if it can run in web", () => {
    testObject = disposables.add(new ExtensionManifestPropertiesService(TestProductService, new TestConfigurationService({ remote: { extensionKind: { "pub.a": ["-web", "workspace"] } } }), new TestWorkspaceTrustEnablementService(), new NullLogService()));
    assert.deepStrictEqual(testObject.getExtensionKind({ browser: "main.browser.js", publisher: "pub", name: "a" }), ["workspace"]);
  });
  test("extension cannot opt out from web", () => {
    assert.deepStrictEqual(testObject.getExtensionKind({ browser: "main.browser.js", extensionKind: ["-web"] }), ["web"]);
  });
  test("extension cannot opt into web", () => {
    assert.deepStrictEqual(testObject.getExtensionKind({ main: "main.js", extensionKind: ["web", "workspace", "ui"] }), ["workspace", "ui"]);
  });
  test("extension cannot opt into web only", () => {
    assert.deepStrictEqual(testObject.getExtensionKind({ main: "main.js", extensionKind: ["web"] }), ["workspace"]);
  });
});
if (!isWeb) {
  suite("ExtensionManifestPropertiesService - ExtensionUntrustedWorkspaceSupportType", () => {
    let testObject;
    let instantiationService;
    let testConfigurationService;
    setup(async () => {
      instantiationService = new TestInstantiationService();
      testConfigurationService = new TestConfigurationService();
      instantiationService.stub(IConfigurationService, testConfigurationService);
    });
    teardown(() => {
      testObject.dispose();
      instantiationService.dispose();
    });
    function assertUntrustedWorkspaceSupport(extensionManifest, expected) {
      testObject = instantiationService.createInstance(ExtensionManifestPropertiesService);
      const untrustedWorkspaceSupport = testObject.getExtensionUntrustedWorkspaceSupportType(extensionManifest);
      assert.strictEqual(untrustedWorkspaceSupport, expected);
    }
    __name(assertUntrustedWorkspaceSupport, "assertUntrustedWorkspaceSupport");
    function getExtensionManifest(properties = {}) {
      return /* @__PURE__ */ Object.create({ name: "a", publisher: "pub", version: "1.0.0", ...properties });
    }
    __name(getExtensionManifest, "getExtensionManifest");
    test("test extension workspace trust request when main entry point is missing", () => {
      instantiationService.stub(IProductService, {});
      instantiationService.stub(IWorkspaceTrustEnablementService, new TestWorkspaceTrustEnablementService());
      const extensionManifest = getExtensionManifest();
      assertUntrustedWorkspaceSupport(extensionManifest, true);
    });
    test("test extension workspace trust request when workspace trust is disabled", async () => {
      instantiationService.stub(IProductService, {});
      instantiationService.stub(IWorkspaceTrustEnablementService, new TestWorkspaceTrustEnablementService(false));
      const extensionManifest = getExtensionManifest({ main: "./out/extension.js" });
      assertUntrustedWorkspaceSupport(extensionManifest, true);
    });
    test('test extension workspace trust request when "true" override exists in settings.json', async () => {
      instantiationService.stub(IProductService, {});
      instantiationService.stub(IWorkspaceTrustEnablementService, new TestWorkspaceTrustEnablementService());
      await testConfigurationService.setUserConfiguration("extensions", { supportUntrustedWorkspaces: { "pub.a": { supported: true } } });
      const extensionManifest = getExtensionManifest({ main: "./out/extension.js", capabilities: { untrustedWorkspaces: { supported: "limited" } } });
      assertUntrustedWorkspaceSupport(extensionManifest, true);
    });
    test("test extension workspace trust request when override (false) exists in settings.json", async () => {
      instantiationService.stub(IProductService, {});
      instantiationService.stub(IWorkspaceTrustEnablementService, new TestWorkspaceTrustEnablementService());
      await testConfigurationService.setUserConfiguration("extensions", { supportUntrustedWorkspaces: { "pub.a": { supported: false } } });
      const extensionManifest = getExtensionManifest({ main: "./out/extension.js", capabilities: { untrustedWorkspaces: { supported: "limited" } } });
      assertUntrustedWorkspaceSupport(extensionManifest, false);
    });
    test("test extension workspace trust request when override (true) for the version exists in settings.json", async () => {
      instantiationService.stub(IProductService, {});
      instantiationService.stub(IWorkspaceTrustEnablementService, new TestWorkspaceTrustEnablementService());
      await testConfigurationService.setUserConfiguration("extensions", { supportUntrustedWorkspaces: { "pub.a": { supported: true, version: "1.0.0" } } });
      const extensionManifest = getExtensionManifest({ main: "./out/extension.js", capabilities: { untrustedWorkspaces: { supported: "limited" } } });
      assertUntrustedWorkspaceSupport(extensionManifest, true);
    });
    test("test extension workspace trust request when override (false) for the version exists in settings.json", async () => {
      instantiationService.stub(IProductService, {});
      instantiationService.stub(IWorkspaceTrustEnablementService, new TestWorkspaceTrustEnablementService());
      await testConfigurationService.setUserConfiguration("extensions", { supportUntrustedWorkspaces: { "pub.a": { supported: false, version: "1.0.0" } } });
      const extensionManifest = getExtensionManifest({ main: "./out/extension.js", capabilities: { untrustedWorkspaces: { supported: "limited" } } });
      assertUntrustedWorkspaceSupport(extensionManifest, false);
    });
    test("test extension workspace trust request when override for a different version exists in settings.json", async () => {
      instantiationService.stub(IProductService, {});
      instantiationService.stub(IWorkspaceTrustEnablementService, new TestWorkspaceTrustEnablementService());
      await testConfigurationService.setUserConfiguration("extensions", { supportUntrustedWorkspaces: { "pub.a": { supported: true, version: "2.0.0" } } });
      const extensionManifest = getExtensionManifest({ main: "./out/extension.js", capabilities: { untrustedWorkspaces: { supported: "limited" } } });
      assertUntrustedWorkspaceSupport(extensionManifest, "limited");
    });
    test("test extension workspace trust request when default (true) exists in product.json", () => {
      instantiationService.stub(IProductService, { extensionUntrustedWorkspaceSupport: { "pub.a": { default: true } } });
      instantiationService.stub(IWorkspaceTrustEnablementService, new TestWorkspaceTrustEnablementService());
      const extensionManifest = getExtensionManifest({ main: "./out/extension.js" });
      assertUntrustedWorkspaceSupport(extensionManifest, true);
    });
    test("test extension workspace trust request when default (false) exists in product.json", () => {
      instantiationService.stub(IProductService, { extensionUntrustedWorkspaceSupport: { "pub.a": { default: false } } });
      instantiationService.stub(IWorkspaceTrustEnablementService, new TestWorkspaceTrustEnablementService());
      const extensionManifest = getExtensionManifest({ main: "./out/extension.js" });
      assertUntrustedWorkspaceSupport(extensionManifest, false);
    });
    test("test extension workspace trust request when override (limited) exists in product.json", () => {
      instantiationService.stub(IProductService, { extensionUntrustedWorkspaceSupport: { "pub.a": { override: "limited" } } });
      instantiationService.stub(IWorkspaceTrustEnablementService, new TestWorkspaceTrustEnablementService());
      const extensionManifest = getExtensionManifest({ main: "./out/extension.js", capabilities: { untrustedWorkspaces: { supported: true } } });
      assertUntrustedWorkspaceSupport(extensionManifest, "limited");
    });
    test("test extension workspace trust request when override (false) exists in product.json", () => {
      instantiationService.stub(IProductService, { extensionUntrustedWorkspaceSupport: { "pub.a": { override: false } } });
      instantiationService.stub(IWorkspaceTrustEnablementService, new TestWorkspaceTrustEnablementService());
      const extensionManifest = getExtensionManifest({ main: "./out/extension.js", capabilities: { untrustedWorkspaces: { supported: true } } });
      assertUntrustedWorkspaceSupport(extensionManifest, false);
    });
    test("test extension workspace trust request when value exists in package.json", () => {
      instantiationService.stub(IProductService, {});
      instantiationService.stub(IWorkspaceTrustEnablementService, new TestWorkspaceTrustEnablementService());
      const extensionManifest = getExtensionManifest({ main: "./out/extension.js", capabilities: { untrustedWorkspaces: { supported: "limited" } } });
      assertUntrustedWorkspaceSupport(extensionManifest, "limited");
    });
    test("test extension workspace trust request when no value exists in package.json", () => {
      instantiationService.stub(IProductService, {});
      instantiationService.stub(IWorkspaceTrustEnablementService, new TestWorkspaceTrustEnablementService());
      const extensionManifest = getExtensionManifest({ main: "./out/extension.js" });
      assertUntrustedWorkspaceSupport(extensionManifest, false);
    });
  });
}
//# sourceMappingURL=extensionManifestPropertiesService.test.js.map
