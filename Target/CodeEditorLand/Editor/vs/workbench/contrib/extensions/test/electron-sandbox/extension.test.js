import assert from "assert";
import { URI } from "../../../../../base/common/uri.js";
import { generateUuid } from "../../../../../base/common/uuid.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { getGalleryExtensionId } from "../../../../../platform/extensionManagement/common/extensionManagementUtil.js";
import {
  ExtensionType,
  TargetPlatform
} from "../../../../../platform/extensions/common/extensions.js";
import { TestInstantiationService } from "../../../../../platform/instantiation/test/common/instantiationServiceMock.js";
import { IProductService } from "../../../../../platform/product/common/productService.js";
import { Extension } from "../../browser/extensionsWorkbenchService.js";
import { ExtensionState } from "../../common/extensions.js";
suite("Extension Test", () => {
  const disposables = ensureNoDisposablesAreLeakedInTestSuite();
  let instantiationService;
  setup(() => {
    instantiationService = disposables.add(new TestInstantiationService());
    instantiationService.stub(IProductService, { quality: "insiders" });
  });
  test("extension is not outdated when there is no local and gallery", () => {
    const extension = instantiationService.createInstance(
      Extension,
      () => ExtensionState.Installed,
      () => void 0,
      void 0,
      void 0,
      void 0,
      void 0
    );
    assert.strictEqual(extension.outdated, false);
  });
  test("extension is not outdated when there is local and no gallery", () => {
    const extension = instantiationService.createInstance(
      Extension,
      () => ExtensionState.Installed,
      () => void 0,
      void 0,
      aLocalExtension(),
      void 0,
      void 0
    );
    assert.strictEqual(extension.outdated, false);
  });
  test("extension is not outdated when there is no local and has gallery", () => {
    const extension = instantiationService.createInstance(
      Extension,
      () => ExtensionState.Installed,
      () => void 0,
      void 0,
      void 0,
      aGalleryExtension(),
      void 0
    );
    assert.strictEqual(extension.outdated, false);
  });
  test("extension is not outdated when local and gallery are on same version", () => {
    const extension = instantiationService.createInstance(
      Extension,
      () => ExtensionState.Installed,
      () => void 0,
      void 0,
      aLocalExtension(),
      aGalleryExtension(),
      void 0
    );
    assert.strictEqual(extension.outdated, false);
  });
  test("extension is outdated when local is older than gallery", () => {
    const extension = instantiationService.createInstance(
      Extension,
      () => ExtensionState.Installed,
      () => void 0,
      void 0,
      aLocalExtension("somext", { version: "1.0.0" }),
      aGalleryExtension("somext", { version: "1.0.1" }),
      void 0
    );
    assert.strictEqual(extension.outdated, true);
  });
  test("extension is outdated when local is built in and older than gallery", () => {
    const extension = instantiationService.createInstance(
      Extension,
      () => ExtensionState.Installed,
      () => void 0,
      void 0,
      aLocalExtension(
        "somext",
        { version: "1.0.0" },
        { type: ExtensionType.System }
      ),
      aGalleryExtension("somext", { version: "1.0.1" }),
      void 0
    );
    assert.strictEqual(extension.outdated, true);
  });
  test("extension is not outdated when local is built in and older than gallery but product quality is stable", () => {
    instantiationService.stub(IProductService, { quality: "stable" });
    const extension = instantiationService.createInstance(
      Extension,
      () => ExtensionState.Installed,
      () => void 0,
      void 0,
      aLocalExtension(
        "somext",
        { version: "1.0.0" },
        { type: ExtensionType.System }
      ),
      aGalleryExtension("somext", { version: "1.0.1" }),
      void 0
    );
    assert.strictEqual(extension.outdated, false);
  });
  test("extension is outdated when local and gallery are on same version but on different target platforms", () => {
    const extension = instantiationService.createInstance(
      Extension,
      () => ExtensionState.Installed,
      () => void 0,
      void 0,
      aLocalExtension(
        "somext",
        {},
        { targetPlatform: TargetPlatform.WIN32_ARM64 }
      ),
      aGalleryExtension(
        "somext",
        {},
        { targetPlatform: TargetPlatform.WIN32_X64 }
      ),
      void 0
    );
    assert.strictEqual(extension.outdated, true);
  });
  test("extension is not outdated when local and gallery are on same version and local is on web", () => {
    const extension = instantiationService.createInstance(
      Extension,
      () => ExtensionState.Installed,
      () => void 0,
      void 0,
      aLocalExtension(
        "somext",
        {},
        { targetPlatform: TargetPlatform.WEB }
      ),
      aGalleryExtension("somext"),
      void 0
    );
    assert.strictEqual(extension.outdated, false);
  });
  test("extension is not outdated when local and gallery are on same version and gallery is on web", () => {
    const extension = instantiationService.createInstance(
      Extension,
      () => ExtensionState.Installed,
      () => void 0,
      void 0,
      aLocalExtension("somext"),
      aGalleryExtension(
        "somext",
        {},
        { targetPlatform: TargetPlatform.WEB }
      ),
      void 0
    );
    assert.strictEqual(extension.outdated, false);
  });
  test("extension is not outdated when local is not pre-release but gallery is pre-release", () => {
    const extension = instantiationService.createInstance(
      Extension,
      () => ExtensionState.Installed,
      () => void 0,
      void 0,
      aLocalExtension("somext", { version: "1.0.0" }),
      aGalleryExtension(
        "somext",
        { version: "1.0.1" },
        { isPreReleaseVersion: true }
      ),
      void 0
    );
    assert.strictEqual(extension.outdated, false);
  });
  test("extension is outdated when local and gallery are pre-releases", () => {
    const extension = instantiationService.createInstance(
      Extension,
      () => ExtensionState.Installed,
      () => void 0,
      void 0,
      aLocalExtension(
        "somext",
        { version: "1.0.0" },
        { preRelease: true, isPreReleaseVersion: true }
      ),
      aGalleryExtension(
        "somext",
        { version: "1.0.1" },
        { isPreReleaseVersion: true }
      ),
      void 0
    );
    assert.strictEqual(extension.outdated, true);
  });
  test("extension is outdated when local was opted to pre-release but current version is not pre-release", () => {
    const extension = instantiationService.createInstance(
      Extension,
      () => ExtensionState.Installed,
      () => void 0,
      void 0,
      aLocalExtension(
        "somext",
        { version: "1.0.0" },
        { preRelease: true, isPreReleaseVersion: false }
      ),
      aGalleryExtension(
        "somext",
        { version: "1.0.1" },
        { isPreReleaseVersion: true }
      ),
      void 0
    );
    assert.strictEqual(extension.outdated, true);
  });
  test("extension is outdated when local is pre-release but gallery is not", () => {
    const extension = instantiationService.createInstance(
      Extension,
      () => ExtensionState.Installed,
      () => void 0,
      void 0,
      aLocalExtension(
        "somext",
        { version: "1.0.0" },
        { preRelease: true, isPreReleaseVersion: true }
      ),
      aGalleryExtension("somext", { version: "1.0.1" }),
      void 0
    );
    assert.strictEqual(extension.outdated, true);
  });
  test("extension is outdated when local was opted pre-release but current version is not and gallery is not", () => {
    const extension = instantiationService.createInstance(
      Extension,
      () => ExtensionState.Installed,
      () => void 0,
      void 0,
      aLocalExtension(
        "somext",
        { version: "1.0.0" },
        { preRelease: true, isPreReleaseVersion: false }
      ),
      aGalleryExtension("somext", { version: "1.0.1" }),
      void 0
    );
    assert.strictEqual(extension.outdated, true);
  });
  function aLocalExtension(name = "someext", manifest = {}, properties = {}) {
    manifest = { name, publisher: "pub", version: "1.0.0", ...manifest };
    properties = {
      type: ExtensionType.User,
      location: URI.file(`pub.${name}`),
      identifier: {
        id: getGalleryExtensionId(manifest.publisher, manifest.name)
      },
      targetPlatform: TargetPlatform.UNDEFINED,
      ...properties
    };
    return /* @__PURE__ */ Object.create({ manifest, ...properties });
  }
  function aGalleryExtension(name = "somext", properties = {}, galleryExtensionProperties = {}) {
    const targetPlatform = galleryExtensionProperties.targetPlatform ?? TargetPlatform.UNDEFINED;
    const galleryExtension = /* @__PURE__ */ Object.create({
      name,
      publisher: "pub",
      version: "1.0.0",
      allTargetPlatforms: [targetPlatform],
      properties: {},
      assets: {},
      ...properties
    });
    galleryExtension.properties = {
      ...galleryExtension.properties,
      dependencies: [],
      targetPlatform,
      ...galleryExtensionProperties
    };
    galleryExtension.identifier = {
      id: getGalleryExtensionId(
        galleryExtension.publisher,
        galleryExtension.name
      ),
      uuid: generateUuid()
    };
    return galleryExtension;
  }
});
