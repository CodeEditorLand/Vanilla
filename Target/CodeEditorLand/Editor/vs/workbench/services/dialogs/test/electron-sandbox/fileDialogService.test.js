var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
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
import * as sinon from "sinon";
import { Schemas } from "../../../../../base/common/network.js";
import { URI } from "../../../../../base/common/uri.js";
import { mock } from "../../../../../base/test/common/mock.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { ICodeEditorService } from "../../../../../editor/browser/services/codeEditorService.js";
import { ILanguageService } from "../../../../../editor/common/languages/language.js";
import { ICommandService } from "../../../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { TestConfigurationService } from "../../../../../platform/configuration/test/common/testConfigurationService.js";
import {
  IDialogService,
  IFileDialogService
} from "../../../../../platform/dialogs/common/dialogs.js";
import { IFileService } from "../../../../../platform/files/common/files.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { ILabelService } from "../../../../../platform/label/common/label.js";
import { ILogService } from "../../../../../platform/log/common/log.js";
import { INativeHostService } from "../../../../../platform/native/common/native.js";
import { IOpenerService } from "../../../../../platform/opener/common/opener.js";
import { IWorkspaceContextService } from "../../../../../platform/workspace/common/workspace.js";
import { IWorkspacesService } from "../../../../../platform/workspaces/common/workspaces.js";
import { workbenchInstantiationService } from "../../../../test/browser/workbenchTestServices.js";
import { IEditorService } from "../../../editor/common/editorService.js";
import { IWorkbenchEnvironmentService } from "../../../environment/common/environmentService.js";
import { IHistoryService } from "../../../history/common/history.js";
import { IHostService } from "../../../host/browser/host.js";
import { IPathService } from "../../../path/common/pathService.js";
import { BrowserWorkspaceEditingService } from "../../../workspaces/browser/workspaceEditingService.js";
import { FileDialogService } from "../../electron-sandbox/fileDialogService.js";
let TestFileDialogService = class extends FileDialogService {
  constructor(simple, hostService, contextService, historyService, environmentService, instantiationService, configurationService, fileService, openerService, nativeHostService, dialogService, languageService, workspacesService, labelService, pathService, commandService, editorService, codeEditorService, logService) {
    super(
      hostService,
      contextService,
      historyService,
      environmentService,
      instantiationService,
      configurationService,
      fileService,
      openerService,
      nativeHostService,
      dialogService,
      languageService,
      workspacesService,
      labelService,
      pathService,
      commandService,
      editorService,
      codeEditorService,
      logService
    );
    this.simple = simple;
  }
  getSimpleFileDialog() {
    if (this.simple) {
      return this.simple;
    } else {
      return super.getSimpleFileDialog();
    }
  }
};
TestFileDialogService = __decorateClass([
  __decorateParam(1, IHostService),
  __decorateParam(2, IWorkspaceContextService),
  __decorateParam(3, IHistoryService),
  __decorateParam(4, IWorkbenchEnvironmentService),
  __decorateParam(5, IInstantiationService),
  __decorateParam(6, IConfigurationService),
  __decorateParam(7, IFileService),
  __decorateParam(8, IOpenerService),
  __decorateParam(9, INativeHostService),
  __decorateParam(10, IDialogService),
  __decorateParam(11, ILanguageService),
  __decorateParam(12, IWorkspacesService),
  __decorateParam(13, ILabelService),
  __decorateParam(14, IPathService),
  __decorateParam(15, ICommandService),
  __decorateParam(16, IEditorService),
  __decorateParam(17, ICodeEditorService),
  __decorateParam(18, ILogService)
], TestFileDialogService);
suite("FileDialogService", () => {
  let instantiationService;
  const disposables = ensureNoDisposablesAreLeakedInTestSuite();
  const testFile = URI.file("/test/file");
  setup(async () => {
    disposables.add(
      instantiationService = workbenchInstantiationService(
        void 0,
        disposables
      )
    );
    const configurationService = new TestConfigurationService();
    await configurationService.setUserConfiguration("files", {
      simpleDialog: { enable: true }
    });
    instantiationService.stub(IConfigurationService, configurationService);
  });
  test("Local - open/save workspaces availableFilesystems", async () => {
    class TestSimpleFileDialog {
      async showOpenDialog(options) {
        assert.strictEqual(options.availableFileSystems?.length, 1);
        assert.strictEqual(
          options.availableFileSystems[0],
          Schemas.file
        );
        return testFile;
      }
      async showSaveDialog(options) {
        assert.strictEqual(options.availableFileSystems?.length, 1);
        assert.strictEqual(
          options.availableFileSystems[0],
          Schemas.file
        );
        return testFile;
      }
      dispose() {
      }
    }
    const dialogService = instantiationService.createInstance(
      TestFileDialogService,
      new TestSimpleFileDialog()
    );
    instantiationService.set(IFileDialogService, dialogService);
    const workspaceService = disposables.add(
      instantiationService.createInstance(BrowserWorkspaceEditingService)
    );
    assert.strictEqual(
      (await workspaceService.pickNewWorkspacePath())?.path.startsWith(
        testFile.path
      ),
      true
    );
    assert.strictEqual(
      await dialogService.pickWorkspaceAndOpen({}),
      void 0
    );
  });
  test("Virtual - open/save workspaces availableFilesystems", async () => {
    class TestSimpleFileDialog {
      async showOpenDialog(options) {
        assert.strictEqual(options.availableFileSystems?.length, 1);
        assert.strictEqual(
          options.availableFileSystems[0],
          Schemas.file
        );
        return testFile;
      }
      async showSaveDialog(options) {
        assert.strictEqual(options.availableFileSystems?.length, 1);
        assert.strictEqual(
          options.availableFileSystems[0],
          Schemas.file
        );
        return testFile;
      }
      dispose() {
      }
    }
    instantiationService.stub(
      IPathService,
      new class {
        defaultUriScheme = "vscode-virtual-test";
        userHome = async () => URI.file("/user/home");
      }()
    );
    const dialogService = instantiationService.createInstance(
      TestFileDialogService,
      new TestSimpleFileDialog()
    );
    instantiationService.set(IFileDialogService, dialogService);
    const workspaceService = disposables.add(
      instantiationService.createInstance(BrowserWorkspaceEditingService)
    );
    assert.strictEqual(
      (await workspaceService.pickNewWorkspacePath())?.path.startsWith(
        testFile.path
      ),
      true
    );
    assert.strictEqual(
      await dialogService.pickWorkspaceAndOpen({}),
      void 0
    );
  });
  test("Remote - open/save workspaces availableFilesystems", async () => {
    class TestSimpleFileDialog {
      async showOpenDialog(options) {
        assert.strictEqual(options.availableFileSystems?.length, 2);
        assert.strictEqual(
          options.availableFileSystems[0],
          Schemas.vscodeRemote
        );
        assert.strictEqual(
          options.availableFileSystems[1],
          Schemas.file
        );
        return testFile;
      }
      async showSaveDialog(options) {
        assert.strictEqual(options.availableFileSystems?.length, 2);
        assert.strictEqual(
          options.availableFileSystems[0],
          Schemas.vscodeRemote
        );
        assert.strictEqual(
          options.availableFileSystems[1],
          Schemas.file
        );
        return testFile;
      }
      dispose() {
      }
    }
    instantiationService.set(
      IWorkbenchEnvironmentService,
      new class extends mock() {
        get remoteAuthority() {
          return "testRemote";
        }
      }()
    );
    instantiationService.stub(
      IPathService,
      new class {
        defaultUriScheme = Schemas.vscodeRemote;
        userHome = async () => URI.file("/user/home");
      }()
    );
    const dialogService = instantiationService.createInstance(
      TestFileDialogService,
      new TestSimpleFileDialog()
    );
    instantiationService.set(IFileDialogService, dialogService);
    const workspaceService = disposables.add(
      instantiationService.createInstance(BrowserWorkspaceEditingService)
    );
    assert.strictEqual(
      (await workspaceService.pickNewWorkspacePath())?.path.startsWith(
        testFile.path
      ),
      true
    );
    assert.strictEqual(
      await dialogService.pickWorkspaceAndOpen({}),
      void 0
    );
  });
  test("Remote - filters default files/folders to RA (#195938)", async () => {
    class TestSimpleFileDialog {
      async showOpenDialog() {
        return testFile;
      }
      async showSaveDialog() {
        return testFile;
      }
      dispose() {
      }
    }
    instantiationService.set(
      IWorkbenchEnvironmentService,
      new class extends mock() {
        get remoteAuthority() {
          return "testRemote";
        }
      }()
    );
    instantiationService.stub(
      IPathService,
      new class {
        defaultUriScheme = Schemas.vscodeRemote;
        userHome = async () => URI.file("/user/home");
      }()
    );
    const dialogService = instantiationService.createInstance(
      TestFileDialogService,
      new TestSimpleFileDialog()
    );
    const historyService = instantiationService.get(IHistoryService);
    const getLastActiveWorkspaceRoot = sinon.spy(
      historyService,
      "getLastActiveWorkspaceRoot"
    );
    const getLastActiveFile = sinon.spy(
      historyService,
      "getLastActiveFile"
    );
    await dialogService.defaultFilePath();
    assert.deepStrictEqual(getLastActiveFile.args, [
      [Schemas.vscodeRemote, "testRemote"]
    ]);
    assert.deepStrictEqual(getLastActiveWorkspaceRoot.args, [
      [Schemas.vscodeRemote, "testRemote"]
    ]);
    await dialogService.defaultFolderPath();
    assert.deepStrictEqual(getLastActiveWorkspaceRoot.args[1], [
      Schemas.vscodeRemote,
      "testRemote"
    ]);
  });
});
