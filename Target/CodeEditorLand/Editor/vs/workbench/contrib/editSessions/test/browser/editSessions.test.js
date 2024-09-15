var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import { IFileService } from "../../../../../platform/files/common/files.js";
import { FileService } from "../../../../../platform/files/common/fileService.js";
import { Schemas } from "../../../../../base/common/network.js";
import { InMemoryFileSystemProvider } from "../../../../../platform/files/common/inMemoryFilesystemProvider.js";
import { TestInstantiationService } from "../../../../../platform/instantiation/test/common/instantiationServiceMock.js";
import { NullLogService } from "../../../../../platform/log/common/log.js";
import { EditSessionsContribution } from "../../browser/editSessions.contribution.js";
import { ProgressService } from "../../../../services/progress/browser/progressService.js";
import { IProgressService } from "../../../../../platform/progress/common/progress.js";
import { ISCMService } from "../../../scm/common/scm.js";
import { SCMService } from "../../../scm/common/scmService.js";
import { TestConfigurationService } from "../../../../../platform/configuration/test/common/testConfigurationService.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { IWorkspaceContextService, WorkbenchState } from "../../../../../platform/workspace/common/workspace.js";
import { mock } from "../../../../../base/test/common/mock.js";
import * as sinon from "sinon";
import assert from "assert";
import { ChangeType, FileType, IEditSessionsLogService, IEditSessionsStorageService } from "../../common/editSessions.js";
import { URI } from "../../../../../base/common/uri.js";
import { joinPath } from "../../../../../base/common/resources.js";
import { INotificationService } from "../../../../../platform/notification/common/notification.js";
import { TestNotificationService } from "../../../../../platform/notification/test/common/testNotificationService.js";
import { TestEnvironmentService } from "../../../../test/browser/workbenchTestServices.js";
import { IEnvironmentService } from "../../../../../platform/environment/common/environment.js";
import { MockContextKeyService } from "../../../../../platform/keybinding/test/common/mockKeybindingService.js";
import { IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { IThemeService } from "../../../../../platform/theme/common/themeService.js";
import { Event } from "../../../../../base/common/event.js";
import { IViewDescriptorService } from "../../../../common/views.js";
import { ITextModelService } from "../../../../../editor/common/services/resolverService.js";
import { ILifecycleService } from "../../../../services/lifecycle/common/lifecycle.js";
import { IDialogService, IPrompt } from "../../../../../platform/dialogs/common/dialogs.js";
import { IEditorService, ISaveAllEditorsOptions } from "../../../../services/editor/common/editorService.js";
import { CancellationToken } from "../../../../../base/common/cancellation.js";
import { ITelemetryService } from "../../../../../platform/telemetry/common/telemetry.js";
import { NullTelemetryService } from "../../../../../platform/telemetry/common/telemetryUtils.js";
import { IRemoteAgentService } from "../../../../services/remote/common/remoteAgentService.js";
import { IExtensionService } from "../../../../services/extensions/common/extensions.js";
import { IEditSessionIdentityService } from "../../../../../platform/workspace/common/editSessions.js";
import { IUserDataProfilesService } from "../../../../../platform/userDataProfile/common/userDataProfile.js";
import { IProductService } from "../../../../../platform/product/common/productService.js";
import { IStorageService } from "../../../../../platform/storage/common/storage.js";
import { TestStorageService } from "../../../../test/common/workbenchTestServices.js";
import { IUriIdentityService } from "../../../../../platform/uriIdentity/common/uriIdentity.js";
import { UriIdentityService } from "../../../../../platform/uriIdentity/common/uriIdentityService.js";
import { IWorkspaceIdentityService, WorkspaceIdentityService } from "../../../../services/workspaces/common/workspaceIdentityService.js";
const folderName = "test-folder";
const folderUri = URI.file(`/${folderName}`);
suite("Edit session sync", () => {
  let instantiationService;
  let editSessionsContribution;
  let fileService;
  let sandbox;
  const disposables = new DisposableStore();
  suiteSetup(() => {
    sandbox = sinon.createSandbox();
    instantiationService = new TestInstantiationService();
    const logService = new NullLogService();
    fileService = disposables.add(new FileService(logService));
    const fileSystemProvider = disposables.add(new InMemoryFileSystemProvider());
    fileService.registerProvider(Schemas.file, fileSystemProvider);
    instantiationService.stub(IEditSessionsLogService, logService);
    instantiationService.stub(IFileService, fileService);
    instantiationService.stub(ILifecycleService, new class extends mock() {
      onWillShutdown = Event.None;
    }());
    instantiationService.stub(INotificationService, new TestNotificationService());
    instantiationService.stub(IProductService, { "editSessions.store": { url: "https://test.com", canSwitch: true, authenticationProviders: {} } });
    instantiationService.stub(IStorageService, new TestStorageService());
    instantiationService.stub(IUriIdentityService, new UriIdentityService(fileService));
    instantiationService.stub(IEditSessionsStorageService, new class extends mock() {
      onDidSignIn = Event.None;
      onDidSignOut = Event.None;
    }());
    instantiationService.stub(IExtensionService, new class extends mock() {
      onDidChangeExtensions = Event.None;
    }());
    instantiationService.stub(IProgressService, ProgressService);
    instantiationService.stub(ISCMService, SCMService);
    instantiationService.stub(IEnvironmentService, TestEnvironmentService);
    instantiationService.stub(ITelemetryService, NullTelemetryService);
    instantiationService.stub(IDialogService, new class extends mock() {
      async prompt(prompt) {
        const result = prompt.buttons?.[0].run({ checkboxChecked: false });
        return { result };
      }
      async confirm() {
        return { confirmed: false };
      }
    }());
    instantiationService.stub(IRemoteAgentService, new class extends mock() {
      async getEnvironment() {
        return null;
      }
    }());
    instantiationService.stub(IConfigurationService, new TestConfigurationService({ workbench: { experimental: { editSessions: { enabled: true } } } }));
    instantiationService.stub(IWorkspaceContextService, new class extends mock() {
      getWorkspace() {
        return {
          id: "workspace-id",
          folders: [{
            uri: folderUri,
            name: folderName,
            index: 0,
            toResource: /* @__PURE__ */ __name((relativePath) => joinPath(folderUri, relativePath), "toResource")
          }]
        };
      }
      getWorkbenchState() {
        return WorkbenchState.FOLDER;
      }
    }());
    instantiationService.stub(ISCMService, "_repositories", /* @__PURE__ */ new Map());
    instantiationService.stub(IContextKeyService, new MockContextKeyService());
    instantiationService.stub(IThemeService, new class extends mock() {
      onDidColorThemeChange = Event.None;
      onDidFileIconThemeChange = Event.None;
    }());
    instantiationService.stub(IViewDescriptorService, {
      onDidChangeLocation: Event.None
    });
    instantiationService.stub(ITextModelService, new class extends mock() {
      registerTextModelContentProvider = /* @__PURE__ */ __name(() => ({ dispose: /* @__PURE__ */ __name(() => {
      }, "dispose") }), "registerTextModelContentProvider");
    }());
    instantiationService.stub(IEditorService, new class extends mock() {
      saveAll = /* @__PURE__ */ __name(async (_options) => {
        return { success: true, editors: [] };
      }, "saveAll");
    }());
    instantiationService.stub(IEditSessionIdentityService, new class extends mock() {
      async getEditSessionIdentifier() {
        return "test-identity";
      }
    }());
    instantiationService.set(IWorkspaceIdentityService, instantiationService.createInstance(WorkspaceIdentityService));
    instantiationService.stub(IUserDataProfilesService, new class extends mock() {
      defaultProfile = {
        id: "default",
        name: "Default",
        isDefault: true,
        location: URI.file("location"),
        globalStorageHome: URI.file("globalStorageHome"),
        settingsResource: URI.file("settingsResource"),
        keybindingsResource: URI.file("keybindingsResource"),
        tasksResource: URI.file("tasksResource"),
        snippetsHome: URI.file("snippetsHome"),
        extensionsResource: URI.file("extensionsResource"),
        cacheHome: URI.file("cacheHome")
      };
    }());
    editSessionsContribution = instantiationService.createInstance(EditSessionsContribution);
  });
  teardown(() => {
    sinon.restore();
    disposables.clear();
  });
  test("Can apply edit session", async function() {
    const fileUri = joinPath(folderUri, "dir1", "README.md");
    const fileContents = "# readme";
    const editSession = {
      version: 1,
      folders: [
        {
          name: folderName,
          workingChanges: [
            {
              relativeFilePath: "dir1/README.md",
              fileType: FileType.File,
              contents: fileContents,
              type: ChangeType.Addition
            }
          ]
        }
      ]
    };
    const readStub = sandbox.stub().returns({ content: JSON.stringify(editSession), ref: "0" });
    instantiationService.stub(IEditSessionsStorageService, "read", readStub);
    await fileService.createFolder(folderUri);
    await editSessionsContribution.resumeEditSession();
    assert.equal((await fileService.readFile(fileUri)).value.toString(), fileContents);
  });
  test("Edit session not stored if there are no edits", async function() {
    const writeStub = sandbox.stub();
    instantiationService.stub(IEditSessionsStorageService, "write", writeStub);
    await fileService.createFolder(folderUri);
    await editSessionsContribution.storeEditSession(true, CancellationToken.None);
    assert.equal(writeStub.called, false);
  });
});
//# sourceMappingURL=editSessions.test.js.map
