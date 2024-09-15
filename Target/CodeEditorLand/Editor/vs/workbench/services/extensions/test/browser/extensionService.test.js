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
import { Event } from "../../../../../base/common/event.js";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import { mock } from "../../../../../base/test/common/mock.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { TestConfigurationService } from "../../../../../platform/configuration/test/common/testConfigurationService.js";
import { TestDialogService } from "../../../../../platform/dialogs/test/common/testDialogService.js";
import { ExtensionKind, IEnvironmentService } from "../../../../../platform/environment/common/environment.js";
import { ExtensionIdentifier, IExtension, IExtensionDescription } from "../../../../../platform/extensions/common/extensions.js";
import { IFileService } from "../../../../../platform/files/common/files.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { TestInstantiationService, createServices } from "../../../../../platform/instantiation/test/common/instantiationServiceMock.js";
import { ILogService, NullLogService } from "../../../../../platform/log/common/log.js";
import { INotificationService } from "../../../../../platform/notification/common/notification.js";
import { TestNotificationService } from "../../../../../platform/notification/test/common/testNotificationService.js";
import product from "../../../../../platform/product/common/product.js";
import { IProductService } from "../../../../../platform/product/common/productService.js";
import { RemoteAuthorityResolverService } from "../../../../../platform/remote/browser/remoteAuthorityResolverService.js";
import { IRemoteAuthorityResolverService, ResolverResult } from "../../../../../platform/remote/common/remoteAuthorityResolver.js";
import { IRemoteExtensionsScannerService } from "../../../../../platform/remote/common/remoteExtensionsScanner.js";
import { ITelemetryService } from "../../../../../platform/telemetry/common/telemetry.js";
import { NullTelemetryService } from "../../../../../platform/telemetry/common/telemetryUtils.js";
import { IUriIdentityService } from "../../../../../platform/uriIdentity/common/uriIdentity.js";
import { UriIdentityService } from "../../../../../platform/uriIdentity/common/uriIdentityService.js";
import { IUserDataProfilesService, UserDataProfilesService } from "../../../../../platform/userDataProfile/common/userDataProfile.js";
import { IWorkspaceContextService } from "../../../../../platform/workspace/common/workspace.js";
import { IWorkspaceTrustEnablementService } from "../../../../../platform/workspace/common/workspaceTrust.js";
import { IWorkbenchEnvironmentService } from "../../../environment/common/environmentService.js";
import { IWebExtensionsScannerService, IWorkbenchExtensionEnablementService, IWorkbenchExtensionManagementService } from "../../../extensionManagement/common/extensionManagement.js";
import { BrowserExtensionHostKindPicker } from "../../browser/extensionService.js";
import { AbstractExtensionService, IExtensionHostFactory, ResolvedExtensions } from "../../common/abstractExtensionService.js";
import { ExtensionHostKind, ExtensionRunningPreference } from "../../common/extensionHostKind.js";
import { IExtensionHostManager } from "../../common/extensionHostManagers.js";
import { ExtensionManifestPropertiesService, IExtensionManifestPropertiesService } from "../../common/extensionManifestPropertiesService.js";
import { ExtensionRunningLocation } from "../../common/extensionRunningLocation.js";
import { ExtensionRunningLocationTracker } from "../../common/extensionRunningLocationTracker.js";
import { IExtensionHost, IExtensionService } from "../../common/extensions.js";
import { ExtensionsProposedApi } from "../../common/extensionsProposedApi.js";
import { ILifecycleService } from "../../../lifecycle/common/lifecycle.js";
import { IRemoteAgentService } from "../../../remote/common/remoteAgentService.js";
import { IUserDataProfileService } from "../../../userDataProfile/common/userDataProfile.js";
import { WorkspaceTrustEnablementService } from "../../../workspaces/common/workspaceTrust.js";
import { TestEnvironmentService, TestFileService, TestLifecycleService, TestRemoteAgentService, TestRemoteExtensionsScannerService, TestUserDataProfileService, TestWebExtensionsScannerService, TestWorkbenchExtensionEnablementService, TestWorkbenchExtensionManagementService } from "../../../../test/browser/workbenchTestServices.js";
import { TestContextService } from "../../../../test/common/workbenchTestServices.js";
suite("BrowserExtensionService", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  test("pickRunningLocation", () => {
    assert.deepStrictEqual(BrowserExtensionHostKindPicker.pickRunningLocation([], false, false, ExtensionRunningPreference.None), null);
    assert.deepStrictEqual(BrowserExtensionHostKindPicker.pickRunningLocation([], false, true, ExtensionRunningPreference.None), null);
    assert.deepStrictEqual(BrowserExtensionHostKindPicker.pickRunningLocation([], true, false, ExtensionRunningPreference.None), null);
    assert.deepStrictEqual(BrowserExtensionHostKindPicker.pickRunningLocation([], true, true, ExtensionRunningPreference.None), null);
    assert.deepStrictEqual(BrowserExtensionHostKindPicker.pickRunningLocation(["ui"], false, false, ExtensionRunningPreference.None), null);
    assert.deepStrictEqual(BrowserExtensionHostKindPicker.pickRunningLocation(["ui"], false, true, ExtensionRunningPreference.None), ExtensionHostKind.Remote);
    assert.deepStrictEqual(BrowserExtensionHostKindPicker.pickRunningLocation(["ui"], true, false, ExtensionRunningPreference.None), null);
    assert.deepStrictEqual(BrowserExtensionHostKindPicker.pickRunningLocation(["ui"], true, true, ExtensionRunningPreference.None), ExtensionHostKind.Remote);
    assert.deepStrictEqual(BrowserExtensionHostKindPicker.pickRunningLocation(["workspace"], false, false, ExtensionRunningPreference.None), null);
    assert.deepStrictEqual(BrowserExtensionHostKindPicker.pickRunningLocation(["workspace"], false, true, ExtensionRunningPreference.None), ExtensionHostKind.Remote);
    assert.deepStrictEqual(BrowserExtensionHostKindPicker.pickRunningLocation(["workspace"], true, false, ExtensionRunningPreference.None), null);
    assert.deepStrictEqual(BrowserExtensionHostKindPicker.pickRunningLocation(["workspace"], true, true, ExtensionRunningPreference.None), ExtensionHostKind.Remote);
    assert.deepStrictEqual(BrowserExtensionHostKindPicker.pickRunningLocation(["web"], false, false, ExtensionRunningPreference.None), null);
    assert.deepStrictEqual(BrowserExtensionHostKindPicker.pickRunningLocation(["web"], false, true, ExtensionRunningPreference.None), ExtensionHostKind.LocalWebWorker);
    assert.deepStrictEqual(BrowserExtensionHostKindPicker.pickRunningLocation(["web"], true, false, ExtensionRunningPreference.None), ExtensionHostKind.LocalWebWorker);
    assert.deepStrictEqual(BrowserExtensionHostKindPicker.pickRunningLocation(["web"], true, true, ExtensionRunningPreference.None), ExtensionHostKind.LocalWebWorker);
    assert.deepStrictEqual(BrowserExtensionHostKindPicker.pickRunningLocation(["ui", "workspace"], false, false, ExtensionRunningPreference.None), null);
    assert.deepStrictEqual(BrowserExtensionHostKindPicker.pickRunningLocation(["ui", "workspace"], false, true, ExtensionRunningPreference.None), ExtensionHostKind.Remote);
    assert.deepStrictEqual(BrowserExtensionHostKindPicker.pickRunningLocation(["ui", "workspace"], true, false, ExtensionRunningPreference.None), null);
    assert.deepStrictEqual(BrowserExtensionHostKindPicker.pickRunningLocation(["ui", "workspace"], true, true, ExtensionRunningPreference.None), ExtensionHostKind.Remote);
    assert.deepStrictEqual(BrowserExtensionHostKindPicker.pickRunningLocation(["workspace", "ui"], false, false, ExtensionRunningPreference.None), null);
    assert.deepStrictEqual(BrowserExtensionHostKindPicker.pickRunningLocation(["workspace", "ui"], false, true, ExtensionRunningPreference.None), ExtensionHostKind.Remote);
    assert.deepStrictEqual(BrowserExtensionHostKindPicker.pickRunningLocation(["workspace", "ui"], true, false, ExtensionRunningPreference.None), null);
    assert.deepStrictEqual(BrowserExtensionHostKindPicker.pickRunningLocation(["workspace", "ui"], true, true, ExtensionRunningPreference.None), ExtensionHostKind.Remote);
    assert.deepStrictEqual(BrowserExtensionHostKindPicker.pickRunningLocation(["web", "workspace"], false, false, ExtensionRunningPreference.None), null);
    assert.deepStrictEqual(BrowserExtensionHostKindPicker.pickRunningLocation(["web", "workspace"], false, true, ExtensionRunningPreference.None), ExtensionHostKind.LocalWebWorker);
    assert.deepStrictEqual(BrowserExtensionHostKindPicker.pickRunningLocation(["web", "workspace"], true, false, ExtensionRunningPreference.None), ExtensionHostKind.LocalWebWorker);
    assert.deepStrictEqual(BrowserExtensionHostKindPicker.pickRunningLocation(["web", "workspace"], true, true, ExtensionRunningPreference.None), ExtensionHostKind.LocalWebWorker);
    assert.deepStrictEqual(BrowserExtensionHostKindPicker.pickRunningLocation(["workspace", "web"], false, false, ExtensionRunningPreference.None), null);
    assert.deepStrictEqual(BrowserExtensionHostKindPicker.pickRunningLocation(["workspace", "web"], false, true, ExtensionRunningPreference.None), ExtensionHostKind.Remote);
    assert.deepStrictEqual(BrowserExtensionHostKindPicker.pickRunningLocation(["workspace", "web"], true, false, ExtensionRunningPreference.None), ExtensionHostKind.LocalWebWorker);
    assert.deepStrictEqual(BrowserExtensionHostKindPicker.pickRunningLocation(["workspace", "web"], true, true, ExtensionRunningPreference.None), ExtensionHostKind.Remote);
    assert.deepStrictEqual(BrowserExtensionHostKindPicker.pickRunningLocation(["ui", "web"], false, false, ExtensionRunningPreference.None), null);
    assert.deepStrictEqual(BrowserExtensionHostKindPicker.pickRunningLocation(["ui", "web"], false, true, ExtensionRunningPreference.None), ExtensionHostKind.LocalWebWorker);
    assert.deepStrictEqual(BrowserExtensionHostKindPicker.pickRunningLocation(["ui", "web"], true, false, ExtensionRunningPreference.None), ExtensionHostKind.LocalWebWorker);
    assert.deepStrictEqual(BrowserExtensionHostKindPicker.pickRunningLocation(["ui", "web"], true, true, ExtensionRunningPreference.None), ExtensionHostKind.LocalWebWorker);
    assert.deepStrictEqual(BrowserExtensionHostKindPicker.pickRunningLocation(["web", "ui"], false, false, ExtensionRunningPreference.None), null);
    assert.deepStrictEqual(BrowserExtensionHostKindPicker.pickRunningLocation(["web", "ui"], false, true, ExtensionRunningPreference.None), ExtensionHostKind.LocalWebWorker);
    assert.deepStrictEqual(BrowserExtensionHostKindPicker.pickRunningLocation(["web", "ui"], true, false, ExtensionRunningPreference.None), ExtensionHostKind.LocalWebWorker);
    assert.deepStrictEqual(BrowserExtensionHostKindPicker.pickRunningLocation(["web", "ui"], true, true, ExtensionRunningPreference.None), ExtensionHostKind.LocalWebWorker);
    assert.deepStrictEqual(BrowserExtensionHostKindPicker.pickRunningLocation(["ui", "web", "workspace"], false, false, ExtensionRunningPreference.None), null);
    assert.deepStrictEqual(BrowserExtensionHostKindPicker.pickRunningLocation(["ui", "web", "workspace"], false, true, ExtensionRunningPreference.None), ExtensionHostKind.LocalWebWorker);
    assert.deepStrictEqual(BrowserExtensionHostKindPicker.pickRunningLocation(["ui", "web", "workspace"], true, false, ExtensionRunningPreference.None), ExtensionHostKind.LocalWebWorker);
    assert.deepStrictEqual(BrowserExtensionHostKindPicker.pickRunningLocation(["ui", "web", "workspace"], true, true, ExtensionRunningPreference.None), ExtensionHostKind.LocalWebWorker);
    assert.deepStrictEqual(BrowserExtensionHostKindPicker.pickRunningLocation(["ui", "workspace", "web"], false, false, ExtensionRunningPreference.None), null);
    assert.deepStrictEqual(BrowserExtensionHostKindPicker.pickRunningLocation(["ui", "workspace", "web"], false, true, ExtensionRunningPreference.None), ExtensionHostKind.Remote);
    assert.deepStrictEqual(BrowserExtensionHostKindPicker.pickRunningLocation(["ui", "workspace", "web"], true, false, ExtensionRunningPreference.None), ExtensionHostKind.LocalWebWorker);
    assert.deepStrictEqual(BrowserExtensionHostKindPicker.pickRunningLocation(["ui", "workspace", "web"], true, true, ExtensionRunningPreference.None), ExtensionHostKind.Remote);
    assert.deepStrictEqual(BrowserExtensionHostKindPicker.pickRunningLocation(["web", "ui", "workspace"], false, false, ExtensionRunningPreference.None), null);
    assert.deepStrictEqual(BrowserExtensionHostKindPicker.pickRunningLocation(["web", "ui", "workspace"], false, true, ExtensionRunningPreference.None), ExtensionHostKind.LocalWebWorker);
    assert.deepStrictEqual(BrowserExtensionHostKindPicker.pickRunningLocation(["web", "ui", "workspace"], true, false, ExtensionRunningPreference.None), ExtensionHostKind.LocalWebWorker);
    assert.deepStrictEqual(BrowserExtensionHostKindPicker.pickRunningLocation(["web", "ui", "workspace"], true, true, ExtensionRunningPreference.None), ExtensionHostKind.LocalWebWorker);
    assert.deepStrictEqual(BrowserExtensionHostKindPicker.pickRunningLocation(["web", "workspace", "ui"], false, false, ExtensionRunningPreference.None), null);
    assert.deepStrictEqual(BrowserExtensionHostKindPicker.pickRunningLocation(["web", "workspace", "ui"], false, true, ExtensionRunningPreference.None), ExtensionHostKind.LocalWebWorker);
    assert.deepStrictEqual(BrowserExtensionHostKindPicker.pickRunningLocation(["web", "workspace", "ui"], true, false, ExtensionRunningPreference.None), ExtensionHostKind.LocalWebWorker);
    assert.deepStrictEqual(BrowserExtensionHostKindPicker.pickRunningLocation(["web", "workspace", "ui"], true, true, ExtensionRunningPreference.None), ExtensionHostKind.LocalWebWorker);
    assert.deepStrictEqual(BrowserExtensionHostKindPicker.pickRunningLocation(["workspace", "ui", "web"], false, false, ExtensionRunningPreference.None), null);
    assert.deepStrictEqual(BrowserExtensionHostKindPicker.pickRunningLocation(["workspace", "ui", "web"], false, true, ExtensionRunningPreference.None), ExtensionHostKind.Remote);
    assert.deepStrictEqual(BrowserExtensionHostKindPicker.pickRunningLocation(["workspace", "ui", "web"], true, false, ExtensionRunningPreference.None), ExtensionHostKind.LocalWebWorker);
    assert.deepStrictEqual(BrowserExtensionHostKindPicker.pickRunningLocation(["workspace", "ui", "web"], true, true, ExtensionRunningPreference.None), ExtensionHostKind.Remote);
    assert.deepStrictEqual(BrowserExtensionHostKindPicker.pickRunningLocation(["workspace", "web", "ui"], false, false, ExtensionRunningPreference.None), null);
    assert.deepStrictEqual(BrowserExtensionHostKindPicker.pickRunningLocation(["workspace", "web", "ui"], false, true, ExtensionRunningPreference.None), ExtensionHostKind.Remote);
    assert.deepStrictEqual(BrowserExtensionHostKindPicker.pickRunningLocation(["workspace", "web", "ui"], true, false, ExtensionRunningPreference.None), ExtensionHostKind.LocalWebWorker);
    assert.deepStrictEqual(BrowserExtensionHostKindPicker.pickRunningLocation(["workspace", "web", "ui"], true, true, ExtensionRunningPreference.None), ExtensionHostKind.Remote);
  });
});
suite("ExtensionService", () => {
  let MyTestExtensionService = class extends AbstractExtensionService {
    static {
      __name(this, "MyTestExtensionService");
    }
    constructor(instantiationService2, notificationService, environmentService, telemetryService, extensionEnablementService, fileService, productService, extensionManagementService, contextService, configurationService, extensionManifestPropertiesService, logService, remoteAgentService, remoteExtensionsScannerService, lifecycleService, remoteAuthorityResolverService) {
      const extensionsProposedApi = instantiationService2.createInstance(ExtensionsProposedApi);
      const extensionHostFactory = new class {
        createExtensionHost(runningLocations, runningLocation, isInitialStart) {
          return new class extends mock() {
            runningLocation = runningLocation;
          }();
        }
      }();
      super(
        extensionsProposedApi,
        extensionHostFactory,
        null,
        instantiationService2,
        notificationService,
        environmentService,
        telemetryService,
        extensionEnablementService,
        fileService,
        productService,
        extensionManagementService,
        contextService,
        configurationService,
        extensionManifestPropertiesService,
        logService,
        remoteAgentService,
        remoteExtensionsScannerService,
        lifecycleService,
        remoteAuthorityResolverService,
        new TestDialogService()
      );
    }
    _extHostId = 0;
    order = [];
    _pickExtensionHostKind(extensionId, extensionKinds, isInstalledLocally, isInstalledRemotely, preference) {
      throw new Error("Method not implemented.");
    }
    _doCreateExtensionHostManager(extensionHost, initialActivationEvents) {
      const order = this.order;
      const extensionHostId = ++this._extHostId;
      order.push(`create ${extensionHostId}`);
      return new class extends mock() {
        onDidExit = Event.None;
        onDidChangeResponsiveState = Event.None;
        disconnect() {
          return Promise.resolve();
        }
        dispose() {
          order.push(`dispose ${extensionHostId}`);
        }
        representsRunningLocation(runningLocation) {
          return extensionHost.runningLocation.equals(runningLocation);
        }
      }();
    }
    _resolveExtensions() {
      throw new Error("Method not implemented.");
    }
    _scanSingleExtension(extension) {
      throw new Error("Method not implemented.");
    }
    _onExtensionHostExit(code) {
      throw new Error("Method not implemented.");
    }
    _resolveAuthority(remoteAuthority) {
      throw new Error("Method not implemented.");
    }
  };
  MyTestExtensionService = __decorateClass([
    __decorateParam(0, IInstantiationService),
    __decorateParam(1, INotificationService),
    __decorateParam(2, IWorkbenchEnvironmentService),
    __decorateParam(3, ITelemetryService),
    __decorateParam(4, IWorkbenchExtensionEnablementService),
    __decorateParam(5, IFileService),
    __decorateParam(6, IProductService),
    __decorateParam(7, IWorkbenchExtensionManagementService),
    __decorateParam(8, IWorkspaceContextService),
    __decorateParam(9, IConfigurationService),
    __decorateParam(10, IExtensionManifestPropertiesService),
    __decorateParam(11, ILogService),
    __decorateParam(12, IRemoteAgentService),
    __decorateParam(13, IRemoteExtensionsScannerService),
    __decorateParam(14, ILifecycleService),
    __decorateParam(15, IRemoteAuthorityResolverService)
  ], MyTestExtensionService);
  let disposables;
  let instantiationService;
  let extService;
  setup(() => {
    disposables = new DisposableStore();
    const testProductService = { _serviceBrand: void 0, ...product };
    disposables.add(instantiationService = createServices(disposables, [
      // custom
      [IExtensionService, MyTestExtensionService],
      // default
      [ILifecycleService, TestLifecycleService],
      [IWorkbenchExtensionManagementService, TestWorkbenchExtensionManagementService],
      [INotificationService, TestNotificationService],
      [IRemoteAgentService, TestRemoteAgentService],
      [ILogService, NullLogService],
      [IWebExtensionsScannerService, TestWebExtensionsScannerService],
      [IExtensionManifestPropertiesService, ExtensionManifestPropertiesService],
      [IConfigurationService, TestConfigurationService],
      [IWorkspaceContextService, TestContextService],
      [IProductService, testProductService],
      [IFileService, TestFileService],
      [IWorkbenchExtensionEnablementService, TestWorkbenchExtensionEnablementService],
      [ITelemetryService, NullTelemetryService],
      [IEnvironmentService, TestEnvironmentService],
      [IWorkspaceTrustEnablementService, WorkspaceTrustEnablementService],
      [IUserDataProfilesService, UserDataProfilesService],
      [IUserDataProfileService, TestUserDataProfileService],
      [IUriIdentityService, UriIdentityService],
      [IRemoteExtensionsScannerService, TestRemoteExtensionsScannerService],
      [IRemoteAuthorityResolverService, new RemoteAuthorityResolverService(false, void 0, void 0, void 0, testProductService, new NullLogService())]
    ]));
    extService = instantiationService.get(IExtensionService);
  });
  teardown(async () => {
    disposables.dispose();
  });
  ensureNoDisposablesAreLeakedInTestSuite();
  test("issue #152204: Remote extension host not disposed after closing vscode client", async () => {
    await extService.startExtensionHosts();
    await extService.stopExtensionHosts("foo");
    assert.deepStrictEqual(extService.order, ["create 1", "create 2", "create 3", "dispose 3", "dispose 2", "dispose 1"]);
  });
  test("Extension host disposed when awaited", async () => {
    await extService.startExtensionHosts();
    await extService.stopExtensionHosts("foo");
    assert.deepStrictEqual(extService.order, ["create 1", "create 2", "create 3", "dispose 3", "dispose 2", "dispose 1"]);
  });
  test("Extension host not disposed when vetoed (sync)", async () => {
    await extService.startExtensionHosts();
    disposables.add(extService.onWillStop((e) => e.veto(true, "test 1")));
    disposables.add(extService.onWillStop((e) => e.veto(false, "test 2")));
    await extService.stopExtensionHosts("foo");
    assert.deepStrictEqual(extService.order, ["create 1", "create 2", "create 3"]);
  });
  test("Extension host not disposed when vetoed (async)", async () => {
    await extService.startExtensionHosts();
    disposables.add(extService.onWillStop((e) => e.veto(false, "test 1")));
    disposables.add(extService.onWillStop((e) => e.veto(Promise.resolve(true), "test 2")));
    disposables.add(extService.onWillStop((e) => e.veto(Promise.resolve(false), "test 3")));
    await extService.stopExtensionHosts("foo");
    assert.deepStrictEqual(extService.order, ["create 1", "create 2", "create 3"]);
  });
});
//# sourceMappingURL=extensionService.test.js.map
