import assert from "assert";
import * as sinon from "sinon";
import { timeout } from "../../../../../base/common/async.js";
import { VSBuffer } from "../../../../../base/common/buffer.js";
import { Emitter, Event } from "../../../../../base/common/event.js";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import { platform } from "../../../../../base/common/platform.js";
import { arch } from "../../../../../base/common/process.js";
import { joinPath } from "../../../../../base/common/resources.js";
import { URI } from "../../../../../base/common/uri.js";
import * as uuid from "../../../../../base/common/uuid.js";
import { runWithFakedTimers } from "../../../../../base/test/common/timeTravelScheduler.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { IModelService } from "../../../../../editor/common/services/model.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { TestConfigurationService } from "../../../../../platform/configuration/test/common/testConfigurationService.js";
import { IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { IEnvironmentService } from "../../../../../platform/environment/common/environment.js";
import { ExtensionGalleryService } from "../../../../../platform/extensionManagement/common/extensionGalleryService.js";
import {
  IExtensionGalleryService,
  IExtensionManagementService,
  IExtensionTipsService,
  getTargetPlatform
} from "../../../../../platform/extensionManagement/common/extensionManagement.js";
import { getGalleryExtensionId } from "../../../../../platform/extensionManagement/common/extensionManagementUtil.js";
import { IExtensionRecommendationNotificationService } from "../../../../../platform/extensionRecommendations/common/extensionRecommendations.js";
import { ExtensionType } from "../../../../../platform/extensions/common/extensions.js";
import { FileService } from "../../../../../platform/files/common/fileService.js";
import { IFileService } from "../../../../../platform/files/common/files.js";
import { InMemoryFileSystemProvider } from "../../../../../platform/files/common/inMemoryFilesystemProvider.js";
import { TestInstantiationService } from "../../../../../platform/instantiation/test/common/instantiationServiceMock.js";
import { ISharedProcessService } from "../../../../../platform/ipc/electron-sandbox/services.js";
import { MockContextKeyService } from "../../../../../platform/keybinding/test/common/mockKeybindingService.js";
import {
  ILogService,
  NullLogService
} from "../../../../../platform/log/common/log.js";
import {
  INotificationService
} from "../../../../../platform/notification/common/notification.js";
import { TestNotificationService } from "../../../../../platform/notification/test/common/testNotificationService.js";
import { IProductService } from "../../../../../platform/product/common/productService.js";
import {
  IStorageService,
  StorageScope,
  StorageTarget
} from "../../../../../platform/storage/common/storage.js";
import { ITelemetryService } from "../../../../../platform/telemetry/common/telemetry.js";
import { NullTelemetryService } from "../../../../../platform/telemetry/common/telemetryUtils.js";
import {
  IUpdateService,
  State
} from "../../../../../platform/update/common/update.js";
import { IUriIdentityService } from "../../../../../platform/uriIdentity/common/uriIdentity.js";
import { UriIdentityService } from "../../../../../platform/uriIdentity/common/uriIdentityService.js";
import { IURLService } from "../../../../../platform/url/common/url.js";
import { NativeURLService } from "../../../../../platform/url/common/urlService.js";
import { IWorkspaceContextService } from "../../../../../platform/workspace/common/workspace.js";
import { testWorkspace } from "../../../../../platform/workspace/test/common/testWorkspace.js";
import {
  IWorkbenchExtensionEnablementService,
  IWorkbenchExtensionManagementService
} from "../../../../services/extensionManagement/common/extensionManagement.js";
import { TestExtensionEnablementService } from "../../../../services/extensionManagement/test/browser/extensionEnablementService.test.js";
import { ExtensionIgnoredRecommendationsService } from "../../../../services/extensionRecommendations/common/extensionIgnoredRecommendationsService.js";
import { IExtensionIgnoredRecommendationsService } from "../../../../services/extensionRecommendations/common/extensionRecommendations.js";
import {
  IWorkspaceExtensionsConfigService,
  WorkspaceExtensionsConfigService
} from "../../../../services/extensionRecommendations/common/workspaceExtensionsConfig.js";
import { IExtensionService } from "../../../../services/extensions/common/extensions.js";
import { ILifecycleService } from "../../../../services/lifecycle/common/lifecycle.js";
import { TestLifecycleService } from "../../../../test/browser/workbenchTestServices.js";
import {
  TestContextService,
  TestProductService,
  TestStorageService
} from "../../../../test/common/workbenchTestServices.js";
import {
  TestExtensionTipsService,
  TestSharedProcessService
} from "../../../../test/electron-sandbox/workbenchTestServices.js";
import { NoOpWorkspaceTagsService } from "../../../tags/browser/workspaceTagsService.js";
import { IWorkspaceTagsService } from "../../../tags/common/workspaceTags.js";
import { ExtensionRecommendationNotificationService } from "../../browser/extensionRecommendationNotificationService.js";
import { ExtensionRecommendationsService } from "../../browser/extensionRecommendationsService.js";
import { ExtensionsWorkbenchService } from "../../browser/extensionsWorkbenchService.js";
import {
  ConfigurationKey,
  IExtensionsWorkbenchService
} from "../../common/extensions.js";
const ROOT = URI.file("tests").with({ scheme: "vscode-tests" });
const mockExtensionGallery = [
  aGalleryExtension(
    "MockExtension1",
    {
      displayName: "Mock Extension 1",
      version: "1.5",
      publisherId: "mockPublisher1Id",
      publisher: "mockPublisher1",
      publisherDisplayName: "Mock Publisher 1",
      description: "Mock Description",
      installCount: 1e3,
      rating: 4,
      ratingCount: 100
    },
    {
      dependencies: ["pub.1"]
    },
    {
      manifest: { uri: "uri:manifest", fallbackUri: "fallback:manifest" },
      readme: { uri: "uri:readme", fallbackUri: "fallback:readme" },
      changelog: {
        uri: "uri:changelog",
        fallbackUri: "fallback:changlog"
      },
      download: { uri: "uri:download", fallbackUri: "fallback:download" },
      icon: { uri: "uri:icon", fallbackUri: "fallback:icon" },
      license: { uri: "uri:license", fallbackUri: "fallback:license" },
      repository: {
        uri: "uri:repository",
        fallbackUri: "fallback:repository"
      },
      signature: {
        uri: "uri:signature",
        fallbackUri: "fallback:signature"
      },
      coreTranslations: []
    }
  ),
  aGalleryExtension(
    "MockExtension2",
    {
      displayName: "Mock Extension 2",
      version: "1.5",
      publisherId: "mockPublisher2Id",
      publisher: "mockPublisher2",
      publisherDisplayName: "Mock Publisher 2",
      description: "Mock Description",
      installCount: 1e3,
      rating: 4,
      ratingCount: 100
    },
    {
      dependencies: ["pub.1", "pub.2"]
    },
    {
      manifest: { uri: "uri:manifest", fallbackUri: "fallback:manifest" },
      readme: { uri: "uri:readme", fallbackUri: "fallback:readme" },
      changelog: {
        uri: "uri:changelog",
        fallbackUri: "fallback:changlog"
      },
      download: { uri: "uri:download", fallbackUri: "fallback:download" },
      icon: { uri: "uri:icon", fallbackUri: "fallback:icon" },
      license: { uri: "uri:license", fallbackUri: "fallback:license" },
      repository: {
        uri: "uri:repository",
        fallbackUri: "fallback:repository"
      },
      signature: {
        uri: "uri:signature",
        fallbackUri: "fallback:signature"
      },
      coreTranslations: []
    }
  )
];
const mockExtensionLocal = [
  {
    type: ExtensionType.User,
    identifier: mockExtensionGallery[0].identifier,
    manifest: {
      name: mockExtensionGallery[0].name,
      publisher: mockExtensionGallery[0].publisher,
      version: mockExtensionGallery[0].version
    },
    metadata: null,
    path: "somepath",
    readmeUrl: "some readmeUrl",
    changelogUrl: "some changelogUrl"
  },
  {
    type: ExtensionType.User,
    identifier: mockExtensionGallery[1].identifier,
    manifest: {
      name: mockExtensionGallery[1].name,
      publisher: mockExtensionGallery[1].publisher,
      version: mockExtensionGallery[1].version
    },
    metadata: null,
    path: "somepath",
    readmeUrl: "some readmeUrl",
    changelogUrl: "some changelogUrl"
  }
];
const mockTestData = {
  recommendedExtensions: [
    "mockPublisher1.mockExtension1",
    "MOCKPUBLISHER2.mockextension2",
    "badlyformattedextension",
    "MOCKPUBLISHER2.mockextension2",
    "unknown.extension"
  ],
  validRecommendedExtensions: [
    "mockPublisher1.mockExtension1",
    "MOCKPUBLISHER2.mockextension2"
  ]
};
function aPage(...objects) {
  return {
    firstPage: objects,
    total: objects.length,
    pageSize: objects.length,
    getPage: () => null
  };
}
const noAssets = {
  changelog: null,
  download: null,
  icon: null,
  license: null,
  manifest: null,
  readme: null,
  repository: null,
  signature: null,
  coreTranslations: []
};
function aGalleryExtension(name, properties = {}, galleryExtensionProperties = {}, assets = noAssets) {
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
    uuid: uuid.generateUuid()
  };
  return galleryExtension;
}
suite("ExtensionRecommendationsService Test", () => {
  let disposableStore;
  let workspaceService;
  let instantiationService;
  let testConfigurationService;
  let testObject;
  let prompted;
  let promptedEmitter;
  let onModelAddedEvent;
  teardown(async () => {
    disposableStore.dispose();
    await timeout(0);
  });
  ensureNoDisposablesAreLeakedInTestSuite();
  setup(() => {
    disposableStore = new DisposableStore();
    instantiationService = disposableStore.add(
      new TestInstantiationService()
    );
    promptedEmitter = disposableStore.add(new Emitter());
    instantiationService.stub(
      IExtensionGalleryService,
      ExtensionGalleryService
    );
    instantiationService.stub(
      ISharedProcessService,
      TestSharedProcessService
    );
    instantiationService.stub(
      ILifecycleService,
      disposableStore.add(new TestLifecycleService())
    );
    testConfigurationService = new TestConfigurationService();
    instantiationService.stub(
      IConfigurationService,
      testConfigurationService
    );
    instantiationService.stub(IProductService, TestProductService);
    instantiationService.stub(ILogService, NullLogService);
    const fileService = new FileService(
      instantiationService.get(ILogService)
    );
    instantiationService.stub(
      IFileService,
      disposableStore.add(fileService)
    );
    const fileSystemProvider = disposableStore.add(
      new InMemoryFileSystemProvider()
    );
    disposableStore.add(
      fileService.registerProvider(ROOT.scheme, fileSystemProvider)
    );
    instantiationService.stub(
      IUriIdentityService,
      disposableStore.add(
        new UriIdentityService(instantiationService.get(IFileService))
      )
    );
    instantiationService.stub(
      INotificationService,
      new TestNotificationService()
    );
    instantiationService.stub(
      IContextKeyService,
      new MockContextKeyService()
    );
    instantiationService.stub(IWorkbenchExtensionManagementService, {
      onInstallExtension: Event.None,
      onDidInstallExtensions: Event.None,
      onUninstallExtension: Event.None,
      onDidUninstallExtension: Event.None,
      onDidUpdateExtensionMetadata: Event.None,
      onDidChangeProfile: Event.None,
      async getInstalled() {
        return [];
      },
      async canInstall() {
        return true;
      },
      async getExtensionsControlManifest() {
        return { malicious: [], deprecated: {}, search: [] };
      },
      async getTargetPlatform() {
        return getTargetPlatform(platform, arch);
      }
    });
    instantiationService.stub(IExtensionService, {
      onDidChangeExtensions: Event.None,
      extensions: [],
      async whenInstalledExtensionsRegistered() {
        return true;
      }
    });
    instantiationService.stub(
      IWorkbenchExtensionEnablementService,
      disposableStore.add(
        new TestExtensionEnablementService(instantiationService)
      )
    );
    instantiationService.stub(ITelemetryService, NullTelemetryService);
    instantiationService.stub(IURLService, NativeURLService);
    instantiationService.stub(
      IWorkspaceTagsService,
      new NoOpWorkspaceTagsService()
    );
    instantiationService.stub(
      IStorageService,
      disposableStore.add(new TestStorageService())
    );
    instantiationService.stub(ILogService, new NullLogService());
    instantiationService.stub(IProductService, {
      extensionRecommendations: {
        "ms-python.python": {
          onFileOpen: [
            {
              pathGlob: "{**/*.py}",
              important: true
            }
          ]
        },
        "ms-vscode.PowerShell": {
          onFileOpen: [
            {
              pathGlob: "{**/*.ps,**/*.ps1}",
              important: true
            }
          ]
        },
        "ms-dotnettools.csharp": {
          onFileOpen: [
            {
              pathGlob: "{**/*.cs,**/project.json,**/global.json,**/*.csproj,**/*.sln,**/appsettings.json}"
            }
          ]
        },
        "msjsdiag.debugger-for-chrome": {
          onFileOpen: [
            {
              pathGlob: "{**/*.ts,**/*.tsx,**/*.js,**/*.jsx,**/*.es6,**/*.mjs,**/*.cjs,**/.babelrc}"
            }
          ]
        },
        "lukehoban.Go": {
          onFileOpen: [
            {
              pathGlob: "**/*.go"
            }
          ]
        }
      }
    });
    instantiationService.stub(IUpdateService, {
      onStateChange: Event.None,
      state: State.Uninitialized
    });
    instantiationService.set(
      IExtensionsWorkbenchService,
      disposableStore.add(
        instantiationService.createInstance(ExtensionsWorkbenchService)
      )
    );
    instantiationService.stub(
      IExtensionTipsService,
      disposableStore.add(
        instantiationService.createInstance(TestExtensionTipsService)
      )
    );
    onModelAddedEvent = new Emitter();
    instantiationService.stub(IEnvironmentService, {});
    instantiationService.stubPromise(
      IExtensionManagementService,
      "getInstalled",
      []
    );
    instantiationService.stub(IExtensionGalleryService, "isEnabled", true);
    instantiationService.stubPromise(
      IExtensionGalleryService,
      "query",
      aPage(...mockExtensionGallery)
    );
    instantiationService.stubPromise(
      IExtensionGalleryService,
      "getExtensions",
      mockExtensionGallery
    );
    prompted = false;
    class TestNotificationService2 extends TestNotificationService {
      prompt(severity, message, choices, options) {
        prompted = true;
        promptedEmitter.fire();
        return super.prompt(severity, message, choices, options);
      }
    }
    instantiationService.stub(
      INotificationService,
      new TestNotificationService2()
    );
    testConfigurationService.setUserConfiguration(ConfigurationKey, {
      ignoreRecommendations: false
    });
    instantiationService.stub(IModelService, {
      getModels() {
        return [];
      },
      onModelAdded: onModelAddedEvent.event
    });
  });
  function setUpFolderWorkspace(folderName, recommendedExtensions, ignoredRecommendations = []) {
    return setUpFolder(
      folderName,
      recommendedExtensions,
      ignoredRecommendations
    );
  }
  async function setUpFolder(folderName, recommendedExtensions, ignoredRecommendations = []) {
    const fileService = instantiationService.get(IFileService);
    const folderDir = joinPath(ROOT, folderName);
    const workspaceSettingsDir = joinPath(folderDir, ".vscode");
    await fileService.createFolder(workspaceSettingsDir);
    const configPath = joinPath(workspaceSettingsDir, "extensions.json");
    await fileService.writeFile(
      configPath,
      VSBuffer.fromString(
        JSON.stringify(
          {
            recommendations: recommendedExtensions,
            unwantedRecommendations: ignoredRecommendations
          },
          null,
          "	"
        )
      )
    );
    const myWorkspace = testWorkspace(folderDir);
    instantiationService.stub(IFileService, fileService);
    workspaceService = new TestContextService(myWorkspace);
    instantiationService.stub(IWorkspaceContextService, workspaceService);
    instantiationService.stub(
      IWorkspaceExtensionsConfigService,
      disposableStore.add(
        instantiationService.createInstance(
          WorkspaceExtensionsConfigService
        )
      )
    );
    instantiationService.stub(
      IExtensionIgnoredRecommendationsService,
      disposableStore.add(
        instantiationService.createInstance(
          ExtensionIgnoredRecommendationsService
        )
      )
    );
    instantiationService.stub(
      IExtensionRecommendationNotificationService,
      disposableStore.add(
        instantiationService.createInstance(
          ExtensionRecommendationNotificationService
        )
      )
    );
  }
  function testNoPromptForValidRecommendations(recommendations) {
    return setUpFolderWorkspace("myFolder", recommendations).then(() => {
      testObject = disposableStore.add(
        instantiationService.createInstance(
          ExtensionRecommendationsService
        )
      );
      return testObject.activationPromise.then(() => {
        assert.strictEqual(
          Object.keys(testObject.getAllRecommendationsWithReason()).length,
          recommendations.length
        );
        assert.ok(!prompted);
      });
    });
  }
  function testNoPromptOrRecommendationsForValidRecommendations(recommendations) {
    return setUpFolderWorkspace(
      "myFolder",
      mockTestData.validRecommendedExtensions
    ).then(() => {
      testObject = disposableStore.add(
        instantiationService.createInstance(
          ExtensionRecommendationsService
        )
      );
      assert.ok(!prompted);
      return testObject.getWorkspaceRecommendations().then(() => {
        assert.strictEqual(
          Object.keys(testObject.getAllRecommendationsWithReason()).length,
          0
        );
        assert.ok(!prompted);
      });
    });
  }
  test("ExtensionRecommendationsService: No Prompt for valid workspace recommendations when galleryService is absent", () => runWithFakedTimers({ useFakeTimers: true }, async () => {
    const galleryQuerySpy = sinon.spy();
    instantiationService.stub(IExtensionGalleryService, {
      query: galleryQuerySpy,
      isEnabled: () => false
    });
    return testNoPromptOrRecommendationsForValidRecommendations(
      mockTestData.validRecommendedExtensions
    ).then(() => assert.ok(galleryQuerySpy.notCalled));
  }));
  test("ExtensionRecommendationsService: No Prompt for valid workspace recommendations during extension development", () => runWithFakedTimers({ useFakeTimers: true }, async () => {
    instantiationService.stub(IEnvironmentService, {
      extensionDevelopmentLocationURI: [URI.file("/folder/file")],
      isExtensionDevelopment: true
    });
    return testNoPromptOrRecommendationsForValidRecommendations(
      mockTestData.validRecommendedExtensions
    );
  }));
  test("ExtensionRecommendationsService: No workspace recommendations or prompts when extensions.json has empty array", () => runWithFakedTimers({ useFakeTimers: true }, async () => {
    return testNoPromptForValidRecommendations([]);
  }));
  test("ExtensionRecommendationsService: Prompt for valid workspace recommendations", () => runWithFakedTimers({ useFakeTimers: true }, async () => {
    await setUpFolderWorkspace(
      "myFolder",
      mockTestData.recommendedExtensions
    );
    testObject = disposableStore.add(
      instantiationService.createInstance(
        ExtensionRecommendationsService
      )
    );
    await Event.toPromise(promptedEmitter.event);
    const recommendations = Object.keys(
      testObject.getAllRecommendationsWithReason()
    );
    const expected = [
      ...mockTestData.validRecommendedExtensions,
      "unknown.extension"
    ];
    assert.strictEqual(recommendations.length, expected.length);
    expected.forEach((x) => {
      assert.strictEqual(
        recommendations.indexOf(x.toLowerCase()) > -1,
        true
      );
    });
  }));
  test("ExtensionRecommendationsService: No Prompt for valid workspace recommendations if they are already installed", () => runWithFakedTimers({ useFakeTimers: true }, async () => {
    instantiationService.stubPromise(
      IExtensionManagementService,
      "getInstalled",
      mockExtensionLocal
    );
    return testNoPromptForValidRecommendations(
      mockTestData.validRecommendedExtensions
    );
  }));
  test("ExtensionRecommendationsService: No Prompt for valid workspace recommendations with casing mismatch if they are already installed", () => runWithFakedTimers({ useFakeTimers: true }, async () => {
    instantiationService.stubPromise(
      IExtensionManagementService,
      "getInstalled",
      mockExtensionLocal
    );
    return testNoPromptForValidRecommendations(
      mockTestData.validRecommendedExtensions.map(
        (x) => x.toUpperCase()
      )
    );
  }));
  test("ExtensionRecommendationsService: No Prompt for valid workspace recommendations if ignoreRecommendations is set", () => runWithFakedTimers({ useFakeTimers: true }, async () => {
    testConfigurationService.setUserConfiguration(ConfigurationKey, {
      ignoreRecommendations: true
    });
    return testNoPromptForValidRecommendations(
      mockTestData.validRecommendedExtensions
    );
  }));
  test("ExtensionRecommendationsService: No Prompt for valid workspace recommendations if showRecommendationsOnlyOnDemand is set", () => runWithFakedTimers({ useFakeTimers: true }, async () => {
    testConfigurationService.setUserConfiguration(ConfigurationKey, {
      showRecommendationsOnlyOnDemand: true
    });
    return setUpFolderWorkspace(
      "myFolder",
      mockTestData.validRecommendedExtensions
    ).then(() => {
      testObject = disposableStore.add(
        instantiationService.createInstance(
          ExtensionRecommendationsService
        )
      );
      return testObject.activationPromise.then(() => {
        assert.ok(!prompted);
      });
    });
  }));
  test("ExtensionRecommendationsService: No Prompt for valid workspace recommendations if ignoreRecommendations is set for current workspace", () => runWithFakedTimers({ useFakeTimers: true }, async () => {
    instantiationService.get(IStorageService).store(
      "extensionsAssistant/workspaceRecommendationsIgnore",
      true,
      StorageScope.WORKSPACE,
      StorageTarget.MACHINE
    );
    return testNoPromptForValidRecommendations(
      mockTestData.validRecommendedExtensions
    );
  }));
  test("ExtensionRecommendationsService: No Recommendations of globally ignored recommendations", () => runWithFakedTimers({ useFakeTimers: true }, async () => {
    instantiationService.get(IStorageService).store(
      "extensionsAssistant/workspaceRecommendationsIgnore",
      true,
      StorageScope.WORKSPACE,
      StorageTarget.MACHINE
    );
    instantiationService.get(IStorageService).store(
      "extensionsAssistant/recommendations",
      '["ms-dotnettools.csharp", "ms-python.python", "ms-vscode.vscode-typescript-tslint-plugin"]',
      StorageScope.PROFILE,
      StorageTarget.MACHINE
    );
    instantiationService.get(IStorageService).store(
      "extensionsAssistant/ignored_recommendations",
      '["ms-dotnettools.csharp", "mockpublisher2.mockextension2"]',
      StorageScope.PROFILE,
      StorageTarget.MACHINE
    );
    return setUpFolderWorkspace(
      "myFolder",
      mockTestData.validRecommendedExtensions
    ).then(() => {
      testObject = disposableStore.add(
        instantiationService.createInstance(
          ExtensionRecommendationsService
        )
      );
      return testObject.activationPromise.then(() => {
        const recommendations = testObject.getAllRecommendationsWithReason();
        assert.ok(!recommendations["ms-dotnettools.csharp"]);
        assert.ok(recommendations["ms-python.python"]);
        assert.ok(recommendations["mockpublisher1.mockextension1"]);
        assert.ok(
          !recommendations["mockpublisher2.mockextension2"]
        );
      });
    });
  }));
  test("ExtensionRecommendationsService: No Recommendations of workspace ignored recommendations", () => runWithFakedTimers({ useFakeTimers: true }, async () => {
    const ignoredRecommendations = [
      "ms-dotnettools.csharp",
      "mockpublisher2.mockextension2"
    ];
    const storedRecommendations = '["ms-dotnettools.csharp", "ms-python.python"]';
    instantiationService.get(IStorageService).store(
      "extensionsAssistant/workspaceRecommendationsIgnore",
      true,
      StorageScope.WORKSPACE,
      StorageTarget.MACHINE
    );
    instantiationService.get(IStorageService).store(
      "extensionsAssistant/recommendations",
      storedRecommendations,
      StorageScope.PROFILE,
      StorageTarget.MACHINE
    );
    return setUpFolderWorkspace(
      "myFolder",
      mockTestData.validRecommendedExtensions,
      ignoredRecommendations
    ).then(() => {
      testObject = disposableStore.add(
        instantiationService.createInstance(
          ExtensionRecommendationsService
        )
      );
      return testObject.activationPromise.then(() => {
        const recommendations = testObject.getAllRecommendationsWithReason();
        assert.ok(!recommendations["ms-dotnettools.csharp"]);
        assert.ok(recommendations["ms-python.python"]);
        assert.ok(recommendations["mockpublisher1.mockextension1"]);
        assert.ok(
          !recommendations["mockpublisher2.mockextension2"]
        );
      });
    });
  }));
  test("ExtensionRecommendationsService: Able to retrieve collection of all ignored recommendations", async () => runWithFakedTimers({ useFakeTimers: true }, async () => {
    const storageService = instantiationService.get(IStorageService);
    const workspaceIgnoredRecommendations = ["ms-dotnettools.csharp"];
    const storedRecommendations = '["ms-dotnettools.csharp", "ms-python.python"]';
    const globallyIgnoredRecommendations = '["mockpublisher2.mockextension2"]';
    storageService.store(
      "extensionsAssistant/workspaceRecommendationsIgnore",
      true,
      StorageScope.WORKSPACE,
      StorageTarget.MACHINE
    );
    storageService.store(
      "extensionsAssistant/recommendations",
      storedRecommendations,
      StorageScope.PROFILE,
      StorageTarget.MACHINE
    );
    storageService.store(
      "extensionsAssistant/ignored_recommendations",
      globallyIgnoredRecommendations,
      StorageScope.PROFILE,
      StorageTarget.MACHINE
    );
    await setUpFolderWorkspace(
      "myFolder",
      mockTestData.validRecommendedExtensions,
      workspaceIgnoredRecommendations
    );
    testObject = disposableStore.add(
      instantiationService.createInstance(
        ExtensionRecommendationsService
      )
    );
    await testObject.activationPromise;
    const recommendations = testObject.getAllRecommendationsWithReason();
    assert.deepStrictEqual(Object.keys(recommendations), [
      "ms-python.python",
      "mockpublisher1.mockextension1"
    ]);
  }));
  test("ExtensionRecommendationsService: Able to dynamically ignore/unignore global recommendations", async () => runWithFakedTimers({ useFakeTimers: true }, async () => {
    const storageService = instantiationService.get(IStorageService);
    const storedRecommendations = '["ms-dotnettools.csharp", "ms-python.python"]';
    const globallyIgnoredRecommendations = '["mockpublisher2.mockextension2"]';
    storageService.store(
      "extensionsAssistant/workspaceRecommendationsIgnore",
      true,
      StorageScope.WORKSPACE,
      StorageTarget.MACHINE
    );
    storageService.store(
      "extensionsAssistant/recommendations",
      storedRecommendations,
      StorageScope.PROFILE,
      StorageTarget.MACHINE
    );
    storageService.store(
      "extensionsAssistant/ignored_recommendations",
      globallyIgnoredRecommendations,
      StorageScope.PROFILE,
      StorageTarget.MACHINE
    );
    await setUpFolderWorkspace(
      "myFolder",
      mockTestData.validRecommendedExtensions
    );
    const extensionIgnoredRecommendationsService = instantiationService.get(
      IExtensionIgnoredRecommendationsService
    );
    testObject = disposableStore.add(
      instantiationService.createInstance(
        ExtensionRecommendationsService
      )
    );
    await testObject.activationPromise;
    let recommendations = testObject.getAllRecommendationsWithReason();
    assert.ok(recommendations["ms-python.python"]);
    assert.ok(recommendations["mockpublisher1.mockextension1"]);
    assert.ok(!recommendations["mockpublisher2.mockextension2"]);
    extensionIgnoredRecommendationsService.toggleGlobalIgnoredRecommendation(
      "mockpublisher1.mockextension1",
      true
    );
    recommendations = testObject.getAllRecommendationsWithReason();
    assert.ok(recommendations["ms-python.python"]);
    assert.ok(!recommendations["mockpublisher1.mockextension1"]);
    assert.ok(!recommendations["mockpublisher2.mockextension2"]);
    extensionIgnoredRecommendationsService.toggleGlobalIgnoredRecommendation(
      "mockpublisher1.mockextension1",
      false
    );
    recommendations = testObject.getAllRecommendationsWithReason();
    assert.ok(recommendations["ms-python.python"]);
    assert.ok(recommendations["mockpublisher1.mockextension1"]);
    assert.ok(!recommendations["mockpublisher2.mockextension2"]);
  }));
  test("test global extensions are modified and recommendation change event is fired when an extension is ignored", async () => runWithFakedTimers({ useFakeTimers: true }, async () => {
    const storageService = instantiationService.get(IStorageService);
    const changeHandlerTarget = sinon.spy();
    const ignoredExtensionId = "Some.Extension";
    storageService.store(
      "extensionsAssistant/workspaceRecommendationsIgnore",
      true,
      StorageScope.WORKSPACE,
      StorageTarget.MACHINE
    );
    storageService.store(
      "extensionsAssistant/ignored_recommendations",
      '["ms-vscode.vscode"]',
      StorageScope.PROFILE,
      StorageTarget.MACHINE
    );
    await setUpFolderWorkspace("myFolder", []);
    testObject = disposableStore.add(
      instantiationService.createInstance(
        ExtensionRecommendationsService
      )
    );
    const extensionIgnoredRecommendationsService = instantiationService.get(
      IExtensionIgnoredRecommendationsService
    );
    disposableStore.add(
      extensionIgnoredRecommendationsService.onDidChangeGlobalIgnoredRecommendation(
        changeHandlerTarget
      )
    );
    extensionIgnoredRecommendationsService.toggleGlobalIgnoredRecommendation(
      ignoredExtensionId,
      true
    );
    await testObject.activationPromise;
    assert.ok(changeHandlerTarget.calledOnce);
    assert.ok(
      changeHandlerTarget.getCall(0).calledWithMatch({
        extensionId: ignoredExtensionId.toLowerCase(),
        isRecommended: false
      })
    );
  }));
  test("ExtensionRecommendationsService: Get file based recommendations from storage (old format)", () => runWithFakedTimers({ useFakeTimers: true }, async () => {
    const storedRecommendations = '["ms-dotnettools.csharp", "ms-python.python", "ms-vscode.vscode-typescript-tslint-plugin"]';
    instantiationService.get(IStorageService).store(
      "extensionsAssistant/recommendations",
      storedRecommendations,
      StorageScope.PROFILE,
      StorageTarget.MACHINE
    );
    return setUpFolderWorkspace("myFolder", []).then(() => {
      testObject = disposableStore.add(
        instantiationService.createInstance(
          ExtensionRecommendationsService
        )
      );
      return testObject.activationPromise.then(() => {
        const recommendations = testObject.getFileBasedRecommendations();
        assert.strictEqual(recommendations.length, 2);
        assert.ok(
          recommendations.some(
            (extensionId) => extensionId === "ms-dotnettools.csharp"
          )
        );
        assert.ok(
          recommendations.some(
            (extensionId) => extensionId === "ms-python.python"
          )
        );
        assert.ok(
          recommendations.every(
            (extensionId) => extensionId !== "ms-vscode.vscode-typescript-tslint-plugin"
          )
        );
      });
    });
  }));
  test("ExtensionRecommendationsService: Get file based recommendations from storage (new format)", async () => {
    const milliSecondsInADay = 1e3 * 60 * 60 * 24;
    const now = Date.now();
    const tenDaysOld = 10 * milliSecondsInADay;
    const storedRecommendations = `{"ms-dotnettools.csharp": ${now}, "ms-python.python": ${now}, "ms-vscode.vscode-typescript-tslint-plugin": ${now}, "lukehoban.Go": ${tenDaysOld}}`;
    instantiationService.get(IStorageService).store(
      "extensionsAssistant/recommendations",
      storedRecommendations,
      StorageScope.PROFILE,
      StorageTarget.MACHINE
    );
    await setUpFolderWorkspace("myFolder", []);
    testObject = disposableStore.add(
      instantiationService.createInstance(
        ExtensionRecommendationsService
      )
    );
    await testObject.activationPromise;
    const recommendations = testObject.getFileBasedRecommendations();
    assert.strictEqual(recommendations.length, 2);
    assert.ok(
      recommendations.some(
        (extensionId) => extensionId === "ms-dotnettools.csharp"
      )
    );
    assert.ok(
      recommendations.some(
        (extensionId) => extensionId === "ms-python.python"
      )
    );
    assert.ok(
      recommendations.every(
        (extensionId) => extensionId !== "ms-vscode.vscode-typescript-tslint-plugin"
      )
    );
    assert.ok(
      recommendations.every(
        (extensionId) => extensionId !== "lukehoban.Go"
      )
    );
  });
});
