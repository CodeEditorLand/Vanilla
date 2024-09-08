import assert from "assert";
import { VSBuffer } from "../../../../base/common/buffer.js";
import { platform } from "../../../../base/common/platform.js";
import { arch } from "../../../../base/common/process.js";
import { joinPath } from "../../../../base/common/resources.js";
import { isBoolean } from "../../../../base/common/types.js";
import { URI } from "../../../../base/common/uri.js";
import { generateUuid } from "../../../../base/common/uuid.js";
import { mock } from "../../../../base/test/common/mock.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../base/test/common/utils.js";
import { IConfigurationService } from "../../../configuration/common/configuration.js";
import { TestConfigurationService } from "../../../configuration/test/common/testConfigurationService.js";
import { INativeEnvironmentService } from "../../../environment/common/environment.js";
import { FileService } from "../../../files/common/fileService.js";
import { IFileService } from "../../../files/common/files.js";
import { InMemoryFileSystemProvider } from "../../../files/common/inMemoryFilesystemProvider.js";
import { TestInstantiationService } from "../../../instantiation/test/common/instantiationServiceMock.js";
import { ILogService, NullLogService } from "../../../log/common/log.js";
import {
  IExtensionGalleryService,
  InstallOperation,
  getTargetPlatform
} from "../../common/extensionManagement.js";
import { getGalleryExtensionId } from "../../common/extensionManagementUtil.js";
import { ExtensionsDownloader } from "../../node/extensionDownloader.js";
import { IExtensionSignatureVerificationService } from "../../node/extensionSignatureVerificationService.js";
const ROOT = URI.file("tests").with({ scheme: "vscode-tests" });
class TestExtensionSignatureVerificationService extends mock() {
  constructor(verificationResult) {
    super();
    this.verificationResult = verificationResult;
  }
  async verify() {
    if (isBoolean(this.verificationResult)) {
      return this.verificationResult;
    }
    const error = Error(this.verificationResult);
    error.code = this.verificationResult;
    throw error;
  }
}
class TestExtensionDownloader extends ExtensionsDownloader {
  async validate() {
  }
}
suite("ExtensionDownloader Tests", () => {
  const disposables = ensureNoDisposablesAreLeakedInTestSuite();
  let instantiationService;
  setup(() => {
    instantiationService = disposables.add(new TestInstantiationService());
    const logService = new NullLogService();
    const fileService = disposables.add(new FileService(logService));
    const fileSystemProvider = disposables.add(
      new InMemoryFileSystemProvider()
    );
    disposables.add(
      fileService.registerProvider(ROOT.scheme, fileSystemProvider)
    );
    instantiationService.stub(ILogService, logService);
    instantiationService.stub(IFileService, fileService);
    instantiationService.stub(ILogService, logService);
    instantiationService.stub(INativeEnvironmentService, {
      extensionsDownloadLocation: joinPath(ROOT, "CachedExtensionVSIXs")
    });
    instantiationService.stub(IExtensionGalleryService, {
      async download(extension, location, operation) {
        await fileService.writeFile(
          location,
          VSBuffer.fromString("extension vsix")
        );
      },
      async downloadSignatureArchive(extension, location) {
        await fileService.writeFile(
          location,
          VSBuffer.fromString("extension signature")
        );
      }
    });
  });
  test("download completes successfully if verification is disabled by setting set to false", async () => {
    const testObject = aTestObject({
      isSignatureVerificationEnabled: false,
      verificationResult: "error"
    });
    const actual = await testObject.download(
      aGalleryExtension("a", { isSigned: true }),
      InstallOperation.Install,
      true
    );
    assert.strictEqual(actual.verificationStatus, false);
  });
  test("download completes successfully if verification is disabled by options", async () => {
    const testObject = aTestObject({
      isSignatureVerificationEnabled: true,
      verificationResult: "error"
    });
    const actual = await testObject.download(
      aGalleryExtension("a", { isSigned: true }),
      InstallOperation.Install,
      false
    );
    assert.strictEqual(actual.verificationStatus, false);
  });
  test("download completes successfully if verification is disabled because the module is not loaded", async () => {
    const testObject = aTestObject({
      isSignatureVerificationEnabled: true,
      verificationResult: false
    });
    const actual = await testObject.download(
      aGalleryExtension("a", { isSigned: true }),
      InstallOperation.Install,
      true
    );
    assert.strictEqual(actual.verificationStatus, false);
  });
  test("download completes successfully if verification fails to execute", async () => {
    const errorCode = "ENOENT";
    const testObject = aTestObject({
      isSignatureVerificationEnabled: true,
      verificationResult: errorCode
    });
    const actual = await testObject.download(
      aGalleryExtension("a", { isSigned: true }),
      InstallOperation.Install,
      true
    );
    assert.strictEqual(actual.verificationStatus, errorCode);
  });
  test("download completes successfully if verification fails ", async () => {
    const errorCode = "IntegrityCheckFailed";
    const testObject = aTestObject({
      isSignatureVerificationEnabled: true,
      verificationResult: errorCode
    });
    const actual = await testObject.download(
      aGalleryExtension("a", { isSigned: true }),
      InstallOperation.Install,
      true
    );
    assert.strictEqual(actual.verificationStatus, errorCode);
  });
  test("download completes successfully if verification succeeds", async () => {
    const testObject = aTestObject({
      isSignatureVerificationEnabled: true,
      verificationResult: true
    });
    const actual = await testObject.download(
      aGalleryExtension("a", { isSigned: true }),
      InstallOperation.Install,
      true
    );
    assert.strictEqual(actual.verificationStatus, true);
  });
  test("download completes successfully for unsigned extension", async () => {
    const testObject = aTestObject({
      isSignatureVerificationEnabled: true,
      verificationResult: true
    });
    const actual = await testObject.download(
      aGalleryExtension("a", { isSigned: false }),
      InstallOperation.Install,
      true
    );
    assert.strictEqual(actual.verificationStatus, false);
  });
  test("download completes successfully for an unsigned extension even when signature verification throws error", async () => {
    const testObject = aTestObject({
      isSignatureVerificationEnabled: true,
      verificationResult: "error"
    });
    const actual = await testObject.download(
      aGalleryExtension("a", { isSigned: false }),
      InstallOperation.Install,
      true
    );
    assert.strictEqual(actual.verificationStatus, false);
  });
  function aTestObject(options) {
    instantiationService.stub(
      IConfigurationService,
      new TestConfigurationService(
        isBoolean(options.isSignatureVerificationEnabled) ? {
          extensions: {
            verifySignature: options.isSignatureVerificationEnabled
          }
        } : void 0
      )
    );
    instantiationService.stub(
      IExtensionSignatureVerificationService,
      new TestExtensionSignatureVerificationService(
        options.verificationResult
      )
    );
    return disposables.add(
      instantiationService.createInstance(TestExtensionDownloader)
    );
  }
  function aGalleryExtension(name, properties = {}, galleryExtensionProperties = {}, assets = {}) {
    const targetPlatform = getTargetPlatform(platform, arch);
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
    galleryExtension.assets = { ...galleryExtension.assets, ...assets };
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
