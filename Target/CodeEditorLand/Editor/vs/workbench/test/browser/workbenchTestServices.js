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
import { mainWindow } from "../../../base/browser/window.js";
import { DeferredPromise, timeout } from "../../../base/common/async.js";
import {
  VSBuffer,
  bufferToStream
} from "../../../base/common/buffer.js";
import { CancellationToken } from "../../../base/common/cancellation.js";
import { Codicon } from "../../../base/common/codicons.js";
import { Emitter, Event } from "../../../base/common/event.js";
import { isValidBasename } from "../../../base/common/extpath.js";
import { Iterable } from "../../../base/common/iterator.js";
import {
  Disposable,
  DisposableStore,
  toDisposable
} from "../../../base/common/lifecycle.js";
import { ResourceMap } from "../../../base/common/map.js";
import { Schemas } from "../../../base/common/network.js";
import { posix, win32 } from "../../../base/common/path.js";
import {
  isLinux,
  isWindows
} from "../../../base/common/platform.js";
import { env } from "../../../base/common/process.js";
import { basename, isEqual } from "../../../base/common/resources.js";
import {
  newWriteableStream
} from "../../../base/common/stream.js";
import { assertIsDefined, upcast } from "../../../base/common/types.js";
import { URI } from "../../../base/common/uri.js";
import { ICodeEditorService } from "../../../editor/browser/services/codeEditorService.js";
import {
  Position as EditorPosition
} from "../../../editor/common/core/position.js";
import { Range } from "../../../editor/common/core/range.js";
import { Selection } from "../../../editor/common/core/selection.js";
import { ILanguageService } from "../../../editor/common/languages/language.js";
import { ILanguageConfigurationService } from "../../../editor/common/languages/languageConfigurationRegistry.js";
import {
  DefaultEndOfLine,
  EndOfLinePreference
} from "../../../editor/common/model.js";
import { createTextBufferFactoryFromStream } from "../../../editor/common/model/textModel.js";
import { IEditorWorkerService } from "../../../editor/common/services/editorWorker.js";
import {
  ILanguageFeatureDebounceService,
  LanguageFeatureDebounceService
} from "../../../editor/common/services/languageFeatureDebounce.js";
import { ILanguageFeaturesService } from "../../../editor/common/services/languageFeatures.js";
import { LanguageFeaturesService } from "../../../editor/common/services/languageFeaturesService.js";
import { LanguageService } from "../../../editor/common/services/languageService.js";
import { IModelService } from "../../../editor/common/services/model.js";
import { ModelService } from "../../../editor/common/services/modelService.js";
import { ITextModelService } from "../../../editor/common/services/resolverService.js";
import {
  ITextResourceConfigurationService,
  ITextResourcePropertiesService
} from "../../../editor/common/services/textResourceConfiguration.js";
import { TestCodeEditor } from "../../../editor/test/browser/testCodeEditor.js";
import { TestLanguageConfigurationService } from "../../../editor/test/common/modes/testLanguageConfigurationService.js";
import { TestEditorWorkerService } from "../../../editor/test/common/services/testEditorWorkerService.js";
import { IAccessibilityService } from "../../../platform/accessibility/common/accessibility.js";
import { TestAccessibilityService } from "../../../platform/accessibility/test/common/testAccessibilityService.js";
import { IAccessibilitySignalService } from "../../../platform/accessibilitySignal/browser/accessibilitySignalService.js";
import {
  IMenuService
} from "../../../platform/actions/common/actions.js";
import {
  IConfigurationService
} from "../../../platform/configuration/common/configuration.js";
import { TestConfigurationService } from "../../../platform/configuration/test/common/testConfigurationService.js";
import {
  IContextKeyService
} from "../../../platform/contextkey/common/contextkey.js";
import { ContextMenuService } from "../../../platform/contextview/browser/contextMenuService.js";
import {
  IContextMenuService,
  IContextViewService
} from "../../../platform/contextview/browser/contextView.js";
import { ContextViewService } from "../../../platform/contextview/browser/contextViewService.js";
import {
  IDialogService,
  IFileDialogService
} from "../../../platform/dialogs/common/dialogs.js";
import { TestDialogService } from "../../../platform/dialogs/test/common/testDialogService.js";
import { IEnvironmentService } from "../../../platform/environment/common/environment.js";
import {
  TargetPlatform
} from "../../../platform/extensions/common/extensions.js";
import { FileService } from "../../../platform/files/common/fileService.js";
import {
  FileSystemProviderCapabilities,
  IFileService
} from "../../../platform/files/common/files.js";
import { InMemoryFileSystemProvider } from "../../../platform/files/common/inMemoryFilesystemProvider.js";
import { IHoverService } from "../../../platform/hover/browser/hover.js";
import { NullHoverService } from "../../../platform/hover/test/browser/nullHoverService.js";
import { SyncDescriptor } from "../../../platform/instantiation/common/descriptors.js";
import {
  IInstantiationService
} from "../../../platform/instantiation/common/instantiation.js";
import { ServiceCollection } from "../../../platform/instantiation/common/serviceCollection.js";
import { TestInstantiationService } from "../../../platform/instantiation/test/common/instantiationServiceMock.js";
import { IKeybindingService } from "../../../platform/keybinding/common/keybinding.js";
import {
  MockContextKeyService,
  MockKeybindingService
} from "../../../platform/keybinding/test/common/mockKeybindingService.js";
import { ILabelService } from "../../../platform/label/common/label.js";
import { IListService } from "../../../platform/list/browser/listService.js";
import {
  ILogService,
  ILoggerService,
  NullLogService
} from "../../../platform/log/common/log.js";
import { IMarkerService } from "../../../platform/markers/common/markers.js";
import { INotificationService } from "../../../platform/notification/common/notification.js";
import { TestNotificationService } from "../../../platform/notification/test/common/testNotificationService.js";
import product from "../../../platform/product/common/product.js";
import { IProductService } from "../../../platform/product/common/productService.js";
import {
  IProgressService,
  Progress
} from "../../../platform/progress/common/progress.js";
import {
  IQuickInputService
} from "../../../platform/quickinput/common/quickInput.js";
import { Registry } from "../../../platform/registry/common/platform.js";
import {
  IRemoteSocketFactoryService,
  RemoteSocketFactoryService
} from "../../../platform/remote/common/remoteSocketFactoryService.js";
import {
  IStorageService,
  StorageScope,
  StorageTarget
} from "../../../platform/storage/common/storage.js";
import {
  ITelemetryService
} from "../../../platform/telemetry/common/telemetry.js";
import { NullTelemetryService } from "../../../platform/telemetry/common/telemetryUtils.js";
import {
  ITerminalLogService
} from "../../../platform/terminal/common/terminal.js";
import { TerminalLogService } from "../../../platform/terminal/common/terminalLogService.js";
import { ColorScheme } from "../../../platform/theme/common/theme.js";
import { IThemeService } from "../../../platform/theme/common/themeService.js";
import { TestThemeService } from "../../../platform/theme/test/common/testThemeService.js";
import { IUndoRedoService } from "../../../platform/undoRedo/common/undoRedo.js";
import { UndoRedoService } from "../../../platform/undoRedo/common/undoRedoService.js";
import { IUriIdentityService } from "../../../platform/uriIdentity/common/uriIdentity.js";
import { UriIdentityService } from "../../../platform/uriIdentity/common/uriIdentityService.js";
import {
  IUserDataProfilesService,
  UserDataProfilesService,
  toUserDataProfile
} from "../../../platform/userDataProfile/common/userDataProfile.js";
import {
  IWorkspaceContextService
} from "../../../platform/workspace/common/workspace.js";
import {
  IWorkspaceTrustManagementService,
  IWorkspaceTrustRequestService
} from "../../../platform/workspace/common/workspaceTrust.js";
import { TestWorkspace } from "../../../platform/workspace/test/common/testWorkspace.js";
import {
  IWorkspacesService
} from "../../../platform/workspaces/common/workspaces.js";
import {
  EditorPaneDescriptor
} from "../../browser/editor.js";
import {
  DEFAULT_EDITOR_PART_OPTIONS
} from "../../browser/parts/editor/editor.js";
import { EditorPane } from "../../browser/parts/editor/editorPane.js";
import { MainEditorPart } from "../../browser/parts/editor/editorPart.js";
import { EditorParts } from "../../browser/parts/editor/editorParts.js";
import { SideBySideEditor } from "../../browser/parts/editor/sideBySideEditor.js";
import { TextEditorPaneSelection } from "../../browser/parts/editor/textEditor.js";
import { TextResourceEditor } from "../../browser/parts/editor/textResourceEditor.js";
import {
  EditorExtensions,
  EditorInputCapabilities,
  EditorExtensions as Extensions
} from "../../common/editor.js";
import { EditorInput } from "../../common/editor/editorInput.js";
import { SideBySideEditorInput } from "../../common/editor/sideBySideEditorInput.js";
import { TextResourceEditorInput } from "../../common/editor/textResourceEditorInput.js";
import {
  ViewContainerLocation
} from "../../common/views.js";
import { FileEditorInput } from "../../contrib/files/browser/editors/fileEditorInput.js";
import { TextFileEditor } from "../../contrib/files/browser/editors/textFileEditor.js";
import { FILE_EDITOR_INPUT_ID } from "../../contrib/files/common/files.js";
import {
  ITerminalConfigurationService,
  ITerminalEditorService,
  ITerminalGroupService,
  ITerminalInstanceService
} from "../../contrib/terminal/browser/terminal.js";
import { TerminalConfigurationService } from "../../contrib/terminal/browser/terminalConfigurationService.js";
import { IEnvironmentVariableService } from "../../contrib/terminal/common/environmentVariable.js";
import { EnvironmentVariableService } from "../../contrib/terminal/common/environmentVariableService.js";
import {
  ITerminalProfileResolverService,
  ITerminalProfileService
} from "../../contrib/terminal/common/terminal.js";
import {
  IDecorationsService
} from "../../services/decorations/common/decorations.js";
import { CodeEditorService } from "../../services/editor/browser/codeEditorService.js";
import { EditorPaneService } from "../../services/editor/browser/editorPaneService.js";
import { EditorResolverService } from "../../services/editor/browser/editorResolverService.js";
import {
  CustomEditorLabelService,
  ICustomEditorLabelService
} from "../../services/editor/common/customEditorLabelService.js";
import {
  GroupOrientation,
  IEditorGroupsService
} from "../../services/editor/common/editorGroupsService.js";
import { IEditorPaneService } from "../../services/editor/common/editorPaneService.js";
import { IEditorResolverService } from "../../services/editor/common/editorResolverService.js";
import {
  IEditorService
} from "../../services/editor/common/editorService.js";
import { BrowserWorkbenchEnvironmentService } from "../../services/environment/browser/environmentService.js";
import { IWorkbenchEnvironmentService } from "../../services/environment/common/environmentService.js";
import {
  EnablementState
} from "../../services/extensionManagement/common/extensionManagement.js";
import { IExtensionService } from "../../services/extensions/common/extensions.js";
import { BrowserElevatedFileService } from "../../services/files/browser/elevatedFileService.js";
import { IElevatedFileService } from "../../services/files/common/elevatedFileService.js";
import {
  FilesConfigurationService,
  IFilesConfigurationService
} from "../../services/filesConfiguration/common/filesConfigurationService.js";
import { IHistoryService } from "../../services/history/common/history.js";
import { IHostService } from "../../services/host/browser/host.js";
import { LabelService } from "../../services/label/common/labelService.js";
import { ILanguageDetectionService } from "../../services/languageDetection/common/languageDetectionWorkerService.js";
import {
  IWorkbenchLayoutService,
  Parts
} from "../../services/layout/browser/layoutService.js";
import {
  ILifecycleService,
  LifecyclePhase,
  ShutdownReason
} from "../../services/lifecycle/common/lifecycle.js";
import { IPaneCompositePartService } from "../../services/panecomposite/browser/panecomposite.js";
import { IPathService } from "../../services/path/common/pathService.js";
import { QuickInputService } from "../../services/quickinput/browser/quickInputService.js";
import {
  IRemoteAgentService
} from "../../services/remote/common/remoteAgentService.js";
import { BrowserTextFileService } from "../../services/textfile/browser/browserTextFileService.js";
import {
  EncodingOracle
} from "../../services/textfile/browser/textFileService.js";
import {
  UTF8_with_bom,
  UTF16be,
  UTF16le
} from "../../services/textfile/common/encoding.js";
import {
  ITextEditorService,
  TextEditorService
} from "../../services/textfile/common/textEditorService.js";
import { TextFileEditorModel } from "../../services/textfile/common/textFileEditorModel.js";
import {
  ITextFileService
} from "../../services/textfile/common/textfiles.js";
import { TextModelResolverService } from "../../services/textmodelResolver/common/textModelResolverService.js";
import { UntitledTextEditorInput } from "../../services/untitled/common/untitledTextEditorInput.js";
import {
  IUntitledTextEditorService,
  UntitledTextEditorService
} from "../../services/untitled/common/untitledTextEditorService.js";
import { IUserDataProfileService } from "../../services/userDataProfile/common/userDataProfile.js";
import { UserDataProfileService } from "../../services/userDataProfile/common/userDataProfileService.js";
import { BrowserWorkingCopyBackupService } from "../../services/workingCopy/browser/workingCopyBackupService.js";
import {
  IWorkingCopyBackupService
} from "../../services/workingCopy/common/workingCopyBackup.js";
import { InMemoryWorkingCopyBackupService } from "../../services/workingCopy/common/workingCopyBackupService.js";
import {
  IWorkingCopyEditorService,
  WorkingCopyEditorService
} from "../../services/workingCopy/common/workingCopyEditorService.js";
import {
  IWorkingCopyFileService,
  WorkingCopyFileService
} from "../../services/workingCopy/common/workingCopyFileService.js";
import {
  IWorkingCopyService,
  WorkingCopyService
} from "../../services/workingCopy/common/workingCopyService.js";
import {
  TestContextService,
  TestExtensionService,
  TestHistoryService,
  TestLoggerService,
  TestMarkerService,
  TestProductService,
  TestStorageService,
  TestTextResourcePropertiesService,
  TestWorkspaceTrustManagementService,
  TestWorkspaceTrustRequestService,
  createFileStat
} from "../common/workbenchTestServices.js";
function createFileEditorInput(instantiationService, resource) {
  return instantiationService.createInstance(
    FileEditorInput,
    resource,
    void 0,
    void 0,
    void 0,
    void 0,
    void 0,
    void 0
  );
}
Registry.as(
  EditorExtensions.EditorFactory
).registerFileEditorFactory({
  typeId: FILE_EDITOR_INPUT_ID,
  createFileEditor: (resource, preferredResource, preferredName, preferredDescription, preferredEncoding, preferredLanguageId, preferredContents, instantiationService) => {
    return instantiationService.createInstance(
      FileEditorInput,
      resource,
      preferredResource,
      preferredName,
      preferredDescription,
      preferredEncoding,
      preferredLanguageId,
      preferredContents
    );
  },
  isFileEditor: (obj) => {
    return obj instanceof FileEditorInput;
  }
});
class TestTextResourceEditor extends TextResourceEditor {
  createEditorControl(parent, configuration) {
    this.editorControl = this._register(
      this.instantiationService.createInstance(
        TestCodeEditor,
        parent,
        configuration,
        {}
      )
    );
  }
}
class TestTextFileEditor extends TextFileEditor {
  createEditorControl(parent, configuration) {
    this.editorControl = this._register(
      this.instantiationService.createInstance(
        TestCodeEditor,
        parent,
        configuration,
        { contributions: [] }
      )
    );
  }
  setSelection(selection, reason) {
    this._options = selection ? upcast({ selection }) : void 0;
    this._onDidChangeSelection.fire({ reason });
  }
  getSelection() {
    const options = this.options;
    if (!options) {
      return void 0;
    }
    const textSelection = options.selection;
    if (!textSelection) {
      return void 0;
    }
    return new TextEditorPaneSelection(
      new Selection(
        textSelection.startLineNumber,
        textSelection.startColumn,
        textSelection.endLineNumber ?? textSelection.startLineNumber,
        textSelection.endColumn ?? textSelection.startColumn
      )
    );
  }
}
class TestWorkingCopyService extends WorkingCopyService {
  testUnregisterWorkingCopy(workingCopy) {
    return super.unregisterWorkingCopy(workingCopy);
  }
}
function workbenchInstantiationService(overrides, disposables = new DisposableStore()) {
  const instantiationService = disposables.add(
    new TestInstantiationService(
      new ServiceCollection([
        ILifecycleService,
        disposables.add(new TestLifecycleService())
      ])
    )
  );
  instantiationService.stub(IProductService, TestProductService);
  instantiationService.stub(
    IEditorWorkerService,
    new TestEditorWorkerService()
  );
  instantiationService.stub(
    IWorkingCopyService,
    disposables.add(new TestWorkingCopyService())
  );
  const environmentService = overrides?.environmentService ? overrides.environmentService(instantiationService) : TestEnvironmentService;
  instantiationService.stub(IEnvironmentService, environmentService);
  instantiationService.stub(IWorkbenchEnvironmentService, environmentService);
  instantiationService.stub(ILogService, new NullLogService());
  const contextKeyService = overrides?.contextKeyService ? overrides.contextKeyService(instantiationService) : instantiationService.createInstance(MockContextKeyService);
  instantiationService.stub(IContextKeyService, contextKeyService);
  instantiationService.stub(IProgressService, new TestProgressService());
  const workspaceContextService = new TestContextService(TestWorkspace);
  instantiationService.stub(
    IWorkspaceContextService,
    workspaceContextService
  );
  const configService = overrides?.configurationService ? overrides.configurationService(instantiationService) : new TestConfigurationService({
    files: {
      participants: {
        timeout: 6e4
      }
    }
  });
  instantiationService.stub(IConfigurationService, configService);
  const textResourceConfigurationService = new TestTextResourceConfigurationService(configService);
  instantiationService.stub(
    ITextResourceConfigurationService,
    textResourceConfigurationService
  );
  instantiationService.stub(
    IUntitledTextEditorService,
    disposables.add(
      instantiationService.createInstance(UntitledTextEditorService)
    )
  );
  instantiationService.stub(
    IStorageService,
    disposables.add(new TestStorageService())
  );
  instantiationService.stub(
    IRemoteAgentService,
    new TestRemoteAgentService()
  );
  instantiationService.stub(
    ILanguageDetectionService,
    new TestLanguageDetectionService()
  );
  instantiationService.stub(
    IPathService,
    overrides?.pathService ? overrides.pathService(instantiationService) : new TestPathService()
  );
  const layoutService = new TestLayoutService();
  instantiationService.stub(IWorkbenchLayoutService, layoutService);
  instantiationService.stub(IDialogService, new TestDialogService());
  const accessibilityService = new TestAccessibilityService();
  instantiationService.stub(IAccessibilityService, accessibilityService);
  instantiationService.stub(IAccessibilitySignalService, {
    playSignal: async () => {
    },
    isSoundEnabled(signal) {
      return false;
    }
  });
  instantiationService.stub(
    IFileDialogService,
    instantiationService.createInstance(TestFileDialogService)
  );
  instantiationService.stub(
    ILanguageService,
    disposables.add(instantiationService.createInstance(LanguageService))
  );
  instantiationService.stub(
    ILanguageFeaturesService,
    new LanguageFeaturesService()
  );
  instantiationService.stub(
    ILanguageFeatureDebounceService,
    instantiationService.createInstance(LanguageFeatureDebounceService)
  );
  instantiationService.stub(IHistoryService, new TestHistoryService());
  instantiationService.stub(
    ITextResourcePropertiesService,
    new TestTextResourcePropertiesService(configService)
  );
  instantiationService.stub(
    IUndoRedoService,
    instantiationService.createInstance(UndoRedoService)
  );
  const themeService = new TestThemeService();
  instantiationService.stub(IThemeService, themeService);
  instantiationService.stub(
    ILanguageConfigurationService,
    disposables.add(new TestLanguageConfigurationService())
  );
  instantiationService.stub(
    IModelService,
    disposables.add(instantiationService.createInstance(ModelService))
  );
  const fileService = overrides?.fileService ? overrides.fileService(instantiationService) : disposables.add(new TestFileService());
  instantiationService.stub(IFileService, fileService);
  instantiationService.stub(
    IUriIdentityService,
    disposables.add(new UriIdentityService(fileService))
  );
  const markerService = new TestMarkerService();
  instantiationService.stub(IMarkerService, markerService);
  instantiationService.stub(
    IFilesConfigurationService,
    disposables.add(
      instantiationService.createInstance(TestFilesConfigurationService)
    )
  );
  const userDataProfilesService = instantiationService.stub(
    IUserDataProfilesService,
    disposables.add(
      instantiationService.createInstance(UserDataProfilesService)
    )
  );
  instantiationService.stub(
    IUserDataProfileService,
    disposables.add(
      new UserDataProfileService(userDataProfilesService.defaultProfile)
    )
  );
  instantiationService.stub(
    IWorkingCopyBackupService,
    overrides?.workingCopyBackupService ? overrides?.workingCopyBackupService(instantiationService) : disposables.add(new TestWorkingCopyBackupService())
  );
  instantiationService.stub(ITelemetryService, NullTelemetryService);
  instantiationService.stub(
    INotificationService,
    new TestNotificationService()
  );
  instantiationService.stub(
    IUntitledTextEditorService,
    disposables.add(
      instantiationService.createInstance(UntitledTextEditorService)
    )
  );
  instantiationService.stub(IMenuService, new TestMenuService());
  const keybindingService = new MockKeybindingService();
  instantiationService.stub(IKeybindingService, keybindingService);
  instantiationService.stub(
    IDecorationsService,
    new TestDecorationsService()
  );
  instantiationService.stub(IExtensionService, new TestExtensionService());
  instantiationService.stub(
    IWorkingCopyFileService,
    disposables.add(
      instantiationService.createInstance(WorkingCopyFileService)
    )
  );
  instantiationService.stub(
    ITextFileService,
    overrides?.textFileService ? overrides.textFileService(instantiationService) : disposables.add(
      instantiationService.createInstance(TestTextFileService)
    )
  );
  instantiationService.stub(
    IHostService,
    instantiationService.createInstance(TestHostService)
  );
  instantiationService.stub(
    ITextModelService,
    disposables.add(
      instantiationService.createInstance(TextModelResolverService)
    )
  );
  instantiationService.stub(
    ILoggerService,
    disposables.add(new TestLoggerService(TestEnvironmentService.logsHome))
  );
  const editorGroupService = new TestEditorGroupsService([
    new TestEditorGroupView(0)
  ]);
  instantiationService.stub(IEditorGroupsService, editorGroupService);
  instantiationService.stub(
    ILabelService,
    disposables.add(instantiationService.createInstance(LabelService))
  );
  const editorService = overrides?.editorService ? overrides.editorService(instantiationService) : disposables.add(new TestEditorService(editorGroupService));
  instantiationService.stub(IEditorService, editorService);
  instantiationService.stub(IEditorPaneService, new EditorPaneService());
  instantiationService.stub(
    IWorkingCopyEditorService,
    disposables.add(
      instantiationService.createInstance(WorkingCopyEditorService)
    )
  );
  instantiationService.stub(
    IEditorResolverService,
    disposables.add(
      instantiationService.createInstance(EditorResolverService)
    )
  );
  const textEditorService = overrides?.textEditorService ? overrides.textEditorService(instantiationService) : disposables.add(
    instantiationService.createInstance(TextEditorService)
  );
  instantiationService.stub(ITextEditorService, textEditorService);
  instantiationService.stub(
    ICodeEditorService,
    disposables.add(
      new CodeEditorService(editorService, themeService, configService)
    )
  );
  instantiationService.stub(
    IPaneCompositePartService,
    disposables.add(new TestPaneCompositeService())
  );
  instantiationService.stub(IListService, new TestListService());
  instantiationService.stub(
    IContextViewService,
    disposables.add(
      instantiationService.createInstance(ContextViewService)
    )
  );
  instantiationService.stub(
    IContextMenuService,
    disposables.add(
      instantiationService.createInstance(ContextMenuService)
    )
  );
  instantiationService.stub(
    IQuickInputService,
    disposables.add(
      new QuickInputService(
        configService,
        instantiationService,
        keybindingService,
        contextKeyService,
        themeService,
        layoutService
      )
    )
  );
  instantiationService.stub(IWorkspacesService, new TestWorkspacesService());
  instantiationService.stub(
    IWorkspaceTrustManagementService,
    disposables.add(new TestWorkspaceTrustManagementService())
  );
  instantiationService.stub(
    IWorkspaceTrustRequestService,
    disposables.add(new TestWorkspaceTrustRequestService(false))
  );
  instantiationService.stub(
    ITerminalInstanceService,
    new TestTerminalInstanceService()
  );
  instantiationService.stub(
    ITerminalEditorService,
    new TestTerminalEditorService()
  );
  instantiationService.stub(
    ITerminalGroupService,
    new TestTerminalGroupService()
  );
  instantiationService.stub(
    ITerminalProfileService,
    new TestTerminalProfileService()
  );
  instantiationService.stub(
    ITerminalProfileResolverService,
    new TestTerminalProfileResolverService()
  );
  instantiationService.stub(
    ITerminalConfigurationService,
    disposables.add(
      instantiationService.createInstance(
        TestTerminalConfigurationService
      )
    )
  );
  instantiationService.stub(
    ITerminalLogService,
    disposables.add(
      instantiationService.createInstance(TerminalLogService)
    )
  );
  instantiationService.stub(
    IEnvironmentVariableService,
    disposables.add(
      instantiationService.createInstance(EnvironmentVariableService)
    )
  );
  instantiationService.stub(
    IElevatedFileService,
    new BrowserElevatedFileService()
  );
  instantiationService.stub(
    IRemoteSocketFactoryService,
    new RemoteSocketFactoryService()
  );
  instantiationService.stub(
    ICustomEditorLabelService,
    disposables.add(
      new CustomEditorLabelService(
        configService,
        workspaceContextService
      )
    )
  );
  instantiationService.stub(IHoverService, NullHoverService);
  return instantiationService;
}
let TestServiceAccessor = class {
  constructor(lifecycleService, textFileService, textEditorService, workingCopyFileService, filesConfigurationService, contextService, modelService, fileService, fileDialogService, dialogService, workingCopyService, editorService, editorPaneService, environmentService, pathService, editorGroupService, editorResolverService, languageService, textModelResolverService, untitledTextEditorService, testConfigurationService, workingCopyBackupService, hostService, quickInputService, labelService, logService, uriIdentityService, instantitionService, notificationService, workingCopyEditorService, instantiationService, elevatedFileService, workspaceTrustRequestService, decorationsService, progressService) {
    this.lifecycleService = lifecycleService;
    this.textFileService = textFileService;
    this.textEditorService = textEditorService;
    this.workingCopyFileService = workingCopyFileService;
    this.filesConfigurationService = filesConfigurationService;
    this.contextService = contextService;
    this.modelService = modelService;
    this.fileService = fileService;
    this.fileDialogService = fileDialogService;
    this.dialogService = dialogService;
    this.workingCopyService = workingCopyService;
    this.editorService = editorService;
    this.editorPaneService = editorPaneService;
    this.environmentService = environmentService;
    this.pathService = pathService;
    this.editorGroupService = editorGroupService;
    this.editorResolverService = editorResolverService;
    this.languageService = languageService;
    this.textModelResolverService = textModelResolverService;
    this.untitledTextEditorService = untitledTextEditorService;
    this.testConfigurationService = testConfigurationService;
    this.workingCopyBackupService = workingCopyBackupService;
    this.hostService = hostService;
    this.quickInputService = quickInputService;
    this.labelService = labelService;
    this.logService = logService;
    this.uriIdentityService = uriIdentityService;
    this.instantitionService = instantitionService;
    this.notificationService = notificationService;
    this.workingCopyEditorService = workingCopyEditorService;
    this.instantiationService = instantiationService;
    this.elevatedFileService = elevatedFileService;
    this.workspaceTrustRequestService = workspaceTrustRequestService;
    this.decorationsService = decorationsService;
    this.progressService = progressService;
  }
};
TestServiceAccessor = __decorateClass([
  __decorateParam(0, ILifecycleService),
  __decorateParam(1, ITextFileService),
  __decorateParam(2, ITextEditorService),
  __decorateParam(3, IWorkingCopyFileService),
  __decorateParam(4, IFilesConfigurationService),
  __decorateParam(5, IWorkspaceContextService),
  __decorateParam(6, IModelService),
  __decorateParam(7, IFileService),
  __decorateParam(8, IFileDialogService),
  __decorateParam(9, IDialogService),
  __decorateParam(10, IWorkingCopyService),
  __decorateParam(11, IEditorService),
  __decorateParam(12, IEditorPaneService),
  __decorateParam(13, IWorkbenchEnvironmentService),
  __decorateParam(14, IPathService),
  __decorateParam(15, IEditorGroupsService),
  __decorateParam(16, IEditorResolverService),
  __decorateParam(17, ILanguageService),
  __decorateParam(18, ITextModelService),
  __decorateParam(19, IUntitledTextEditorService),
  __decorateParam(20, IConfigurationService),
  __decorateParam(21, IWorkingCopyBackupService),
  __decorateParam(22, IHostService),
  __decorateParam(23, IQuickInputService),
  __decorateParam(24, ILabelService),
  __decorateParam(25, ILogService),
  __decorateParam(26, IUriIdentityService),
  __decorateParam(27, IInstantiationService),
  __decorateParam(28, INotificationService),
  __decorateParam(29, IWorkingCopyEditorService),
  __decorateParam(30, IInstantiationService),
  __decorateParam(31, IElevatedFileService),
  __decorateParam(32, IWorkspaceTrustRequestService),
  __decorateParam(33, IDecorationsService),
  __decorateParam(34, IProgressService)
], TestServiceAccessor);
let TestTextFileService = class extends BrowserTextFileService {
  readStreamError = void 0;
  writeError = void 0;
  constructor(fileService, untitledTextEditorService, lifecycleService, instantiationService, modelService, environmentService, dialogService, fileDialogService, textResourceConfigurationService, filesConfigurationService, codeEditorService, pathService, workingCopyFileService, uriIdentityService, languageService, logService, elevatedFileService, decorationsService) {
    super(
      fileService,
      untitledTextEditorService,
      lifecycleService,
      instantiationService,
      modelService,
      environmentService,
      dialogService,
      fileDialogService,
      textResourceConfigurationService,
      filesConfigurationService,
      codeEditorService,
      pathService,
      workingCopyFileService,
      uriIdentityService,
      languageService,
      elevatedFileService,
      logService,
      decorationsService
    );
  }
  setReadStreamErrorOnce(error) {
    this.readStreamError = error;
  }
  async readStream(resource, options) {
    if (this.readStreamError) {
      const error = this.readStreamError;
      this.readStreamError = void 0;
      throw error;
    }
    const content = await this.fileService.readFileStream(
      resource,
      options
    );
    return {
      resource: content.resource,
      name: content.name,
      mtime: content.mtime,
      ctime: content.ctime,
      etag: content.etag,
      encoding: "utf8",
      value: await createTextBufferFactoryFromStream(content.value),
      size: 10,
      readonly: false,
      locked: false
    };
  }
  setWriteErrorOnce(error) {
    this.writeError = error;
  }
  async write(resource, value, options) {
    if (this.writeError) {
      const error = this.writeError;
      this.writeError = void 0;
      throw error;
    }
    return super.write(resource, value, options);
  }
};
TestTextFileService = __decorateClass([
  __decorateParam(0, IFileService),
  __decorateParam(1, IUntitledTextEditorService),
  __decorateParam(2, ILifecycleService),
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IModelService),
  __decorateParam(5, IWorkbenchEnvironmentService),
  __decorateParam(6, IDialogService),
  __decorateParam(7, IFileDialogService),
  __decorateParam(8, ITextResourceConfigurationService),
  __decorateParam(9, IFilesConfigurationService),
  __decorateParam(10, ICodeEditorService),
  __decorateParam(11, IPathService),
  __decorateParam(12, IWorkingCopyFileService),
  __decorateParam(13, IUriIdentityService),
  __decorateParam(14, ILanguageService),
  __decorateParam(15, ILogService),
  __decorateParam(16, IElevatedFileService),
  __decorateParam(17, IDecorationsService)
], TestTextFileService);
class TestBrowserTextFileServiceWithEncodingOverrides extends BrowserTextFileService {
  _testEncoding;
  get encoding() {
    if (!this._testEncoding) {
      this._testEncoding = this._register(
        this.instantiationService.createInstance(TestEncodingOracle)
      );
    }
    return this._testEncoding;
  }
}
class TestEncodingOracle extends EncodingOracle {
  get encodingOverrides() {
    return [
      { extension: "utf16le", encoding: UTF16le },
      { extension: "utf16be", encoding: UTF16be },
      { extension: "utf8bom", encoding: UTF8_with_bom }
    ];
  }
  set encodingOverrides(overrides) {
  }
}
class TestEnvironmentServiceWithArgs extends BrowserWorkbenchEnvironmentService {
  args = [];
}
const TestEnvironmentService = new TestEnvironmentServiceWithArgs(
  "",
  URI.file("tests").with({ scheme: "vscode-tests" }),
  /* @__PURE__ */ Object.create(null),
  TestProductService
);
class TestProgressService {
  withProgress(options, task, onDidCancel) {
    return task(Progress.None);
  }
}
class TestDecorationsService {
  onDidChangeDecorations = Event.None;
  registerDecorationsProvider(_provider) {
    return Disposable.None;
  }
  getDecoration(_uri, _includeChildren, _overwrite) {
    return void 0;
  }
}
class TestMenuService {
  createMenu(_id, _scopedKeybindingService) {
    return {
      onDidChange: Event.None,
      dispose: () => void 0,
      getActions: () => []
    };
  }
  getMenuActions(id, contextKeyService, options) {
    throw new Error("Method not implemented.");
  }
  getMenuContexts(id) {
    throw new Error("Method not implemented.");
  }
  resetHiddenStates() {
  }
}
let TestFileDialogService = class {
  constructor(pathService) {
    this.pathService = pathService;
  }
  confirmResult;
  async defaultFilePath(_schemeFilter) {
    return this.pathService.userHome();
  }
  async defaultFolderPath(_schemeFilter) {
    return this.pathService.userHome();
  }
  async defaultWorkspacePath(_schemeFilter) {
    return this.pathService.userHome();
  }
  async preferredHome(_schemeFilter) {
    return this.pathService.userHome();
  }
  pickFileFolderAndOpen(_options) {
    return Promise.resolve(0);
  }
  pickFileAndOpen(_options) {
    return Promise.resolve(0);
  }
  pickFolderAndOpen(_options) {
    return Promise.resolve(0);
  }
  pickWorkspaceAndOpen(_options) {
    return Promise.resolve(0);
  }
  fileToSave;
  setPickFileToSave(path) {
    this.fileToSave = path;
  }
  pickFileToSave(defaultUri, availableFileSystems) {
    return Promise.resolve(this.fileToSave);
  }
  showSaveDialog(_options) {
    return Promise.resolve(void 0);
  }
  showOpenDialog(_options) {
    return Promise.resolve(void 0);
  }
  setConfirmResult(result) {
    this.confirmResult = result;
  }
  showSaveConfirm(fileNamesOrResources) {
    return Promise.resolve(this.confirmResult);
  }
};
TestFileDialogService = __decorateClass([
  __decorateParam(0, IPathService)
], TestFileDialogService);
class TestLayoutService {
  openedDefaultEditors = false;
  mainContainerDimension = { width: 800, height: 600 };
  activeContainerDimension = { width: 800, height: 600 };
  mainContainerOffset = { top: 0, quickPickTop: 0 };
  activeContainerOffset = { top: 0, quickPickTop: 0 };
  mainContainer = mainWindow.document.body;
  containers = [mainWindow.document.body];
  activeContainer = mainWindow.document.body;
  onDidChangeZenMode = Event.None;
  onDidChangeMainEditorCenteredLayout = Event.None;
  onDidChangeWindowMaximized = Event.None;
  onDidChangePanelPosition = Event.None;
  onDidChangePanelAlignment = Event.None;
  onDidChangePartVisibility = Event.None;
  onDidLayoutMainContainer = Event.None;
  onDidLayoutActiveContainer = Event.None;
  onDidLayoutContainer = Event.None;
  onDidChangeNotificationsVisibility = Event.None;
  onDidAddContainer = Event.None;
  onDidChangeActiveContainer = Event.None;
  layout() {
  }
  isRestored() {
    return true;
  }
  whenReady = Promise.resolve(void 0);
  whenRestored = Promise.resolve(void 0);
  hasFocus(_part) {
    return false;
  }
  focusPart(_part) {
  }
  hasMainWindowBorder() {
    return false;
  }
  getMainWindowBorderRadius() {
    return void 0;
  }
  isVisible(_part) {
    return true;
  }
  getContainer() {
    return null;
  }
  whenContainerStylesLoaded() {
    return void 0;
  }
  isTitleBarHidden() {
    return false;
  }
  isStatusBarHidden() {
    return false;
  }
  isActivityBarHidden() {
    return false;
  }
  setActivityBarHidden(_hidden) {
  }
  setBannerHidden(_hidden) {
  }
  isSideBarHidden() {
    return false;
  }
  async setEditorHidden(_hidden) {
  }
  async setSideBarHidden(_hidden) {
  }
  async setAuxiliaryBarHidden(_hidden) {
  }
  async setPartHidden(_hidden, part) {
  }
  isPanelHidden() {
    return false;
  }
  async setPanelHidden(_hidden) {
  }
  toggleMaximizedPanel() {
  }
  isPanelMaximized() {
    return false;
  }
  getMenubarVisibility() {
    throw new Error("not implemented");
  }
  toggleMenuBar() {
  }
  getSideBarPosition() {
    return 0;
  }
  getPanelPosition() {
    return 0;
  }
  getPanelAlignment() {
    return "center";
  }
  async setPanelPosition(_position) {
  }
  async setPanelAlignment(_alignment) {
  }
  addClass(_clazz) {
  }
  removeClass(_clazz) {
  }
  getMaximumEditorDimensions() {
    throw new Error("not implemented");
  }
  toggleZenMode() {
  }
  isMainEditorLayoutCentered() {
    return false;
  }
  centerMainEditorLayout(_active) {
  }
  resizePart(_part, _sizeChangeWidth, _sizeChangeHeight) {
  }
  registerPart(part) {
    return Disposable.None;
  }
  isWindowMaximized(targetWindow) {
    return false;
  }
  updateWindowMaximizedState(targetWindow, maximized) {
  }
  getVisibleNeighborPart(part, direction) {
    return void 0;
  }
  focus() {
  }
}
const activeViewlet = {};
class TestPaneCompositeService extends Disposable {
  onDidPaneCompositeOpen;
  onDidPaneCompositeClose;
  parts = /* @__PURE__ */ new Map();
  constructor() {
    super();
    this.parts.set(ViewContainerLocation.Panel, new TestPanelPart());
    this.parts.set(ViewContainerLocation.Sidebar, new TestSideBarPart());
    this.onDidPaneCompositeOpen = Event.any(
      ...[ViewContainerLocation.Panel, ViewContainerLocation.Sidebar].map(
        (loc) => Event.map(
          this.parts.get(loc).onDidPaneCompositeOpen,
          (composite) => {
            return { composite, viewContainerLocation: loc };
          }
        )
      )
    );
    this.onDidPaneCompositeClose = Event.any(
      ...[ViewContainerLocation.Panel, ViewContainerLocation.Sidebar].map(
        (loc) => Event.map(
          this.parts.get(loc).onDidPaneCompositeClose,
          (composite) => {
            return { composite, viewContainerLocation: loc };
          }
        )
      )
    );
  }
  openPaneComposite(id, viewContainerLocation, focus) {
    return this.getPartByLocation(viewContainerLocation).openPaneComposite(
      id,
      focus
    );
  }
  getActivePaneComposite(viewContainerLocation) {
    return this.getPartByLocation(
      viewContainerLocation
    ).getActivePaneComposite();
  }
  getPaneComposite(id, viewContainerLocation) {
    return this.getPartByLocation(viewContainerLocation).getPaneComposite(
      id
    );
  }
  getPaneComposites(viewContainerLocation) {
    return this.getPartByLocation(
      viewContainerLocation
    ).getPaneComposites();
  }
  getProgressIndicator(id, viewContainerLocation) {
    return this.getPartByLocation(
      viewContainerLocation
    ).getProgressIndicator(id);
  }
  hideActivePaneComposite(viewContainerLocation) {
    this.getPartByLocation(viewContainerLocation).hideActivePaneComposite();
  }
  getLastActivePaneCompositeId(viewContainerLocation) {
    return this.getPartByLocation(
      viewContainerLocation
    ).getLastActivePaneCompositeId();
  }
  getPinnedPaneCompositeIds(viewContainerLocation) {
    throw new Error("Method not implemented.");
  }
  getVisiblePaneCompositeIds(viewContainerLocation) {
    throw new Error("Method not implemented.");
  }
  getPartByLocation(viewContainerLocation) {
    return assertIsDefined(this.parts.get(viewContainerLocation));
  }
}
class TestSideBarPart {
  onDidViewletRegisterEmitter = new Emitter();
  onDidViewletDeregisterEmitter = new Emitter();
  onDidViewletOpenEmitter = new Emitter();
  onDidViewletCloseEmitter = new Emitter();
  partId = Parts.SIDEBAR_PART;
  element = void 0;
  minimumWidth = 0;
  maximumWidth = 0;
  minimumHeight = 0;
  maximumHeight = 0;
  onDidChange = Event.None;
  onDidPaneCompositeOpen = this.onDidViewletOpenEmitter.event;
  onDidPaneCompositeClose = this.onDidViewletCloseEmitter.event;
  openPaneComposite(id, focus) {
    return Promise.resolve(void 0);
  }
  getPaneComposites() {
    return [];
  }
  getAllViewlets() {
    return [];
  }
  getActivePaneComposite() {
    return activeViewlet;
  }
  getDefaultViewletId() {
    return "workbench.view.explorer";
  }
  getPaneComposite(id) {
    return void 0;
  }
  getProgressIndicator(id) {
    return void 0;
  }
  hideActivePaneComposite() {
  }
  getLastActivePaneCompositeId() {
    return void 0;
  }
  dispose() {
  }
  getPinnedPaneCompositeIds() {
    return [];
  }
  getVisiblePaneCompositeIds() {
    return [];
  }
  layout(width, height, top, left) {
  }
}
class TestPanelPart {
  element = void 0;
  minimumWidth = 0;
  maximumWidth = 0;
  minimumHeight = 0;
  maximumHeight = 0;
  onDidChange = Event.None;
  onDidPaneCompositeOpen = new Emitter().event;
  onDidPaneCompositeClose = new Emitter().event;
  partId = Parts.AUXILIARYBAR_PART;
  async openPaneComposite(id, focus) {
    return void 0;
  }
  getPaneComposite(id) {
    return activeViewlet;
  }
  getPaneComposites() {
    return [];
  }
  getPinnedPaneCompositeIds() {
    return [];
  }
  getVisiblePaneCompositeIds() {
    return [];
  }
  getActivePaneComposite() {
    return activeViewlet;
  }
  setPanelEnablement(id, enabled) {
  }
  dispose() {
  }
  getProgressIndicator(id) {
    return null;
  }
  hideActivePaneComposite() {
  }
  getLastActivePaneCompositeId() {
    return void 0;
  }
  layout(width, height, top, left) {
  }
}
class TestViewsService {
  onDidChangeViewContainerVisibility = new Emitter().event;
  isViewContainerVisible(id) {
    return true;
  }
  isViewContainerActive(id) {
    return true;
  }
  getVisibleViewContainer() {
    return null;
  }
  openViewContainer(id, focus) {
    return Promise.resolve(null);
  }
  closeViewContainer(id) {
  }
  onDidChangeViewVisibilityEmitter = new Emitter();
  onDidChangeViewVisibility = this.onDidChangeViewVisibilityEmitter.event;
  onDidChangeFocusedViewEmitter = new Emitter();
  onDidChangeFocusedView = this.onDidChangeFocusedViewEmitter.event;
  isViewVisible(id) {
    return true;
  }
  getActiveViewWithId(id) {
    return null;
  }
  getViewWithId(id) {
    return null;
  }
  openView(id, focus) {
    return Promise.resolve(null);
  }
  closeView(id) {
  }
  getViewProgressIndicator(id) {
    return null;
  }
  getActiveViewPaneContainerWithId(id) {
    return null;
  }
  getFocusedViewName() {
    return "";
  }
}
class TestEditorGroupsService {
  constructor(groups = []) {
    this.groups = groups;
  }
  parts = [this];
  windowId = mainWindow.vscodeWindowId;
  onDidCreateAuxiliaryEditorPart = Event.None;
  onDidChangeActiveGroup = Event.None;
  onDidActivateGroup = Event.None;
  onDidAddGroup = Event.None;
  onDidRemoveGroup = Event.None;
  onDidMoveGroup = Event.None;
  onDidChangeGroupIndex = Event.None;
  onDidChangeGroupLabel = Event.None;
  onDidChangeGroupLocked = Event.None;
  onDidChangeGroupMaximized = Event.None;
  onDidLayout = Event.None;
  onDidChangeEditorPartOptions = Event.None;
  onDidScroll = Event.None;
  onWillDispose = Event.None;
  orientation = GroupOrientation.HORIZONTAL;
  isReady = true;
  whenReady = Promise.resolve(void 0);
  whenRestored = Promise.resolve(void 0);
  hasRestorableState = false;
  contentDimension = { width: 800, height: 600 };
  get activeGroup() {
    return this.groups[0];
  }
  get sideGroup() {
    return this.groups[0];
  }
  get count() {
    return this.groups.length;
  }
  getPart(group) {
    return this;
  }
  saveWorkingSet(name) {
    throw new Error("Method not implemented.");
  }
  getWorkingSets() {
    throw new Error("Method not implemented.");
  }
  applyWorkingSet(workingSet, options) {
    throw new Error("Method not implemented.");
  }
  deleteWorkingSet(workingSet) {
    throw new Error("Method not implemented.");
  }
  getGroups(_order) {
    return this.groups;
  }
  getGroup(identifier) {
    return this.groups.find((group) => group.id === identifier);
  }
  getLabel(_identifier) {
    return "Group 1";
  }
  findGroup(_scope, _source, _wrap) {
    throw new Error("not implemented");
  }
  activateGroup(_group) {
    throw new Error("not implemented");
  }
  restoreGroup(_group) {
    throw new Error("not implemented");
  }
  getSize(_group) {
    return { width: 100, height: 100 };
  }
  setSize(_group, _size) {
  }
  arrangeGroups(_arrangement) {
  }
  toggleMaximizeGroup() {
  }
  hasMaximizedGroup() {
    throw new Error("not implemented");
  }
  toggleExpandGroup() {
  }
  applyLayout(_layout) {
  }
  getLayout() {
    throw new Error("not implemented");
  }
  setGroupOrientation(_orientation) {
  }
  addGroup(_location, _direction) {
    throw new Error("not implemented");
  }
  removeGroup(_group) {
  }
  moveGroup(_group, _location, _direction) {
    throw new Error("not implemented");
  }
  mergeGroup(_group, _target, _options) {
    throw new Error("not implemented");
  }
  mergeAllGroups(_group) {
    throw new Error("not implemented");
  }
  copyGroup(_group, _location, _direction) {
    throw new Error("not implemented");
  }
  centerLayout(active) {
  }
  isLayoutCentered() {
    return false;
  }
  createEditorDropTarget(container, delegate) {
    return Disposable.None;
  }
  registerContextKeyProvider(_provider) {
    throw new Error("not implemented");
  }
  getScopedInstantiationService(part) {
    throw new Error("Method not implemented.");
  }
  partOptions;
  enforcePartOptions(options) {
    return Disposable.None;
  }
  mainPart = this;
  registerEditorPart(part) {
    return Disposable.None;
  }
  createAuxiliaryEditorPart() {
    throw new Error("Method not implemented.");
  }
}
class TestEditorGroupView {
  constructor(id) {
    this.id = id;
  }
  windowId = mainWindow.vscodeWindowId;
  groupsView = void 0;
  activeEditorPane;
  activeEditor;
  selectedEditors = [];
  previewEditor;
  count;
  stickyCount;
  disposed;
  editors = [];
  label;
  isLocked;
  ariaLabel;
  index;
  whenRestored = Promise.resolve(void 0);
  element;
  minimumWidth;
  maximumWidth;
  minimumHeight;
  maximumHeight;
  titleHeight;
  isEmpty = true;
  onWillDispose = Event.None;
  onDidModelChange = Event.None;
  onWillCloseEditor = Event.None;
  onDidCloseEditor = Event.None;
  onDidOpenEditorFail = Event.None;
  onDidFocus = Event.None;
  onDidChange = Event.None;
  onWillMoveEditor = Event.None;
  onWillOpenEditor = Event.None;
  onDidActiveEditorChange = Event.None;
  getEditors(_order) {
    return [];
  }
  findEditors(_resource) {
    return [];
  }
  getEditorByIndex(_index) {
    throw new Error("not implemented");
  }
  getIndexOfEditor(_editor) {
    return -1;
  }
  isFirst(editor) {
    return false;
  }
  isLast(editor) {
    return false;
  }
  openEditor(_editor, _options) {
    throw new Error("not implemented");
  }
  openEditors(_editors) {
    throw new Error("not implemented");
  }
  isPinned(_editor) {
    return false;
  }
  isSticky(_editor) {
    return false;
  }
  isTransient(_editor) {
    return false;
  }
  isActive(_editor) {
    return false;
  }
  setSelection(_activeSelectedEditor, _inactiveSelectedEditors) {
    throw new Error("not implemented");
  }
  isSelected(_editor) {
    return false;
  }
  contains(candidate) {
    return false;
  }
  moveEditor(_editor, _target, _options) {
    return true;
  }
  moveEditors(_editors, _target) {
    return true;
  }
  copyEditor(_editor, _target, _options) {
  }
  copyEditors(_editors, _target) {
  }
  async closeEditor(_editor, options) {
    return true;
  }
  async closeEditors(_editors, options) {
    return true;
  }
  async closeAllEditors(options) {
    return true;
  }
  async replaceEditors(_editors) {
  }
  pinEditor(_editor) {
  }
  stickEditor(editor) {
  }
  unstickEditor(editor) {
  }
  lock(locked) {
  }
  focus() {
  }
  get scopedContextKeyService() {
    throw new Error("not implemented");
  }
  setActive(_isActive) {
  }
  notifyIndexChanged(_index) {
  }
  notifyLabelChanged(_label) {
  }
  dispose() {
  }
  toJSON() {
    return /* @__PURE__ */ Object.create(null);
  }
  layout(_width, _height) {
  }
  relayout() {
  }
  createEditorActions(_menuDisposable) {
    throw new Error("not implemented");
  }
}
class TestEditorGroupAccessor {
  label = "";
  windowId = mainWindow.vscodeWindowId;
  groups = [];
  activeGroup;
  partOptions = { ...DEFAULT_EDITOR_PART_OPTIONS };
  onDidChangeEditorPartOptions = Event.None;
  onDidVisibilityChange = Event.None;
  getGroup(identifier) {
    throw new Error("Method not implemented.");
  }
  getGroups(order) {
    throw new Error("Method not implemented.");
  }
  activateGroup(identifier) {
    throw new Error("Method not implemented.");
  }
  restoreGroup(identifier) {
    throw new Error("Method not implemented.");
  }
  addGroup(location, direction) {
    throw new Error("Method not implemented.");
  }
  mergeGroup(group, target, options) {
    throw new Error("Method not implemented.");
  }
  moveGroup(group, location, direction) {
    throw new Error("Method not implemented.");
  }
  copyGroup(group, location, direction) {
    throw new Error("Method not implemented.");
  }
  removeGroup(group) {
    throw new Error("Method not implemented.");
  }
  arrangeGroups(arrangement, target) {
    throw new Error("Method not implemented.");
  }
  toggleMaximizeGroup(group) {
    throw new Error("Method not implemented.");
  }
  toggleExpandGroup(group) {
    throw new Error("Method not implemented.");
  }
}
class TestEditorService extends Disposable {
  constructor(editorGroupService) {
    super();
    this.editorGroupService = editorGroupService;
  }
  onDidActiveEditorChange = Event.None;
  onDidVisibleEditorsChange = Event.None;
  onDidEditorsChange = Event.None;
  onWillOpenEditor = Event.None;
  onDidCloseEditor = Event.None;
  onDidOpenEditorFail = Event.None;
  onDidMostRecentlyActiveEditorsChange = Event.None;
  _activeTextEditorControl;
  get activeTextEditorControl() {
    return this._activeTextEditorControl;
  }
  set activeTextEditorControl(value) {
    this._activeTextEditorControl = value;
  }
  activeEditorPane;
  activeTextEditorLanguageId;
  _activeEditor;
  get activeEditor() {
    return this._activeEditor;
  }
  set activeEditor(value) {
    this._activeEditor = value;
  }
  editors = [];
  mostRecentlyActiveEditors = [];
  visibleEditorPanes = [];
  visibleTextEditorControls = [];
  visibleEditors = [];
  count = this.editors.length;
  createScoped(editorGroupsContainer) {
    return this;
  }
  getEditors() {
    return [];
  }
  findEditors() {
    return [];
  }
  async openEditor(editor, optionsOrGroup, group) {
    if ("dispose" in editor) {
      this._register(editor);
    }
    return void 0;
  }
  async closeEditor(editor, options) {
  }
  async closeEditors(editors, options) {
  }
  doResolveEditorOpenRequest(editor) {
    if (!this.editorGroupService) {
      return void 0;
    }
    return [
      this.editorGroupService.activeGroup,
      editor,
      void 0
    ];
  }
  openEditors(_editors, _group) {
    throw new Error("not implemented");
  }
  isOpened(_editor) {
    return false;
  }
  isVisible(_editor) {
    return false;
  }
  replaceEditors(_editors, _group) {
    return Promise.resolve(void 0);
  }
  save(editors, options) {
    throw new Error("Method not implemented.");
  }
  saveAll(options) {
    throw new Error("Method not implemented.");
  }
  revert(editors, options) {
    throw new Error("Method not implemented.");
  }
  revertAll(options) {
    throw new Error("Method not implemented.");
  }
}
class TestFileService {
  _onDidFilesChange = new Emitter();
  get onDidFilesChange() {
    return this._onDidFilesChange.event;
  }
  fireFileChanges(event) {
    this._onDidFilesChange.fire(event);
  }
  _onDidRunOperation = new Emitter();
  get onDidRunOperation() {
    return this._onDidRunOperation.event;
  }
  fireAfterOperation(event) {
    this._onDidRunOperation.fire(event);
  }
  _onDidChangeFileSystemProviderCapabilities = new Emitter();
  get onDidChangeFileSystemProviderCapabilities() {
    return this._onDidChangeFileSystemProviderCapabilities.event;
  }
  fireFileSystemProviderCapabilitiesChangeEvent(event) {
    this._onDidChangeFileSystemProviderCapabilities.fire(event);
  }
  _onWillActivateFileSystemProvider = new Emitter();
  onWillActivateFileSystemProvider = this._onWillActivateFileSystemProvider.event;
  onDidWatchError = Event.None;
  content = "Hello Html";
  lastReadFileUri;
  readonly = false;
  setContent(content) {
    this.content = content;
  }
  getContent() {
    return this.content;
  }
  getLastReadFileUri() {
    return this.lastReadFileUri;
  }
  async resolve(resource, _options) {
    return createFileStat(resource, this.readonly);
  }
  stat(resource) {
    return this.resolve(resource, { resolveMetadata: true });
  }
  async resolveAll(toResolve) {
    const stats = await Promise.all(
      toResolve.map(
        (resourceAndOption) => this.resolve(
          resourceAndOption.resource,
          resourceAndOption.options
        )
      )
    );
    return stats.map((stat) => ({ stat, success: true }));
  }
  notExistsSet = new ResourceMap();
  async exists(_resource) {
    return !this.notExistsSet.has(_resource);
  }
  readShouldThrowError = void 0;
  async readFile(resource, options) {
    if (this.readShouldThrowError) {
      throw this.readShouldThrowError;
    }
    this.lastReadFileUri = resource;
    return {
      ...createFileStat(resource, this.readonly),
      value: VSBuffer.fromString(this.content)
    };
  }
  async readFileStream(resource, options) {
    if (this.readShouldThrowError) {
      throw this.readShouldThrowError;
    }
    this.lastReadFileUri = resource;
    return {
      ...createFileStat(resource, this.readonly),
      value: bufferToStream(VSBuffer.fromString(this.content))
    };
  }
  writeShouldThrowError = void 0;
  async writeFile(resource, bufferOrReadable, options) {
    await timeout(0);
    if (this.writeShouldThrowError) {
      throw this.writeShouldThrowError;
    }
    return createFileStat(resource, this.readonly);
  }
  move(_source, _target, _overwrite) {
    return Promise.resolve(null);
  }
  copy(_source, _target, _overwrite) {
    return Promise.resolve(null);
  }
  async cloneFile(_source, _target) {
  }
  createFile(_resource, _content, _options) {
    return Promise.resolve(null);
  }
  createFolder(_resource) {
    return Promise.resolve(null);
  }
  onDidChangeFileSystemProviderRegistrations = Event.None;
  providers = /* @__PURE__ */ new Map();
  registerProvider(scheme, provider) {
    this.providers.set(scheme, provider);
    return toDisposable(() => this.providers.delete(scheme));
  }
  getProvider(scheme) {
    return this.providers.get(scheme);
  }
  async activateProvider(_scheme) {
    this._onWillActivateFileSystemProvider.fire({
      scheme: _scheme,
      join: () => {
      }
    });
  }
  async canHandleResource(resource) {
    return this.hasProvider(resource);
  }
  hasProvider(resource) {
    return resource.scheme === Schemas.file || this.providers.has(resource.scheme);
  }
  listCapabilities() {
    return [
      {
        scheme: Schemas.file,
        capabilities: FileSystemProviderCapabilities.FileOpenReadWriteClose
      },
      ...Iterable.map(this.providers, ([scheme, p]) => {
        return { scheme, capabilities: p.capabilities };
      })
    ];
  }
  hasCapability(resource, capability) {
    if (capability === FileSystemProviderCapabilities.PathCaseSensitive && isLinux) {
      return true;
    }
    const provider = this.getProvider(resource.scheme);
    return !!(provider && provider.capabilities & capability);
  }
  async del(_resource, _options) {
  }
  createWatcher(resource, options) {
    return {
      onDidChange: Event.None,
      dispose: () => {
      }
    };
  }
  watches = [];
  watch(_resource) {
    this.watches.push(_resource);
    return toDisposable(
      () => this.watches.splice(this.watches.indexOf(_resource), 1)
    );
  }
  getWriteEncoding(_resource) {
    return { encoding: "utf8", hasBOM: false };
  }
  dispose() {
  }
  async canCreateFile(source, options) {
    return true;
  }
  async canMove(source, target, overwrite) {
    return true;
  }
  async canCopy(source, target, overwrite) {
    return true;
  }
  async canDelete(resource, options) {
    return true;
  }
}
class TestWorkingCopyBackupService extends InMemoryWorkingCopyBackupService {
  resolved = /* @__PURE__ */ new Set();
  constructor() {
    super();
  }
  parseBackupContent(textBufferFactory) {
    const textBuffer = textBufferFactory.create(
      DefaultEndOfLine.LF
    ).textBuffer;
    const lineCount = textBuffer.getLineCount();
    const range = new Range(
      1,
      1,
      lineCount,
      textBuffer.getLineLength(lineCount) + 1
    );
    return textBuffer.getValueInRange(
      range,
      EndOfLinePreference.TextDefined
    );
  }
  async resolve(identifier) {
    this.resolved.add(identifier);
    return super.resolve(identifier);
  }
}
function toUntypedWorkingCopyId(resource) {
  return toTypedWorkingCopyId(resource, "");
}
function toTypedWorkingCopyId(resource, typeId = "testBackupTypeId") {
  return { typeId, resource };
}
class InMemoryTestWorkingCopyBackupService extends BrowserWorkingCopyBackupService {
  backupResourceJoiners;
  discardBackupJoiners;
  discardedBackups;
  constructor() {
    const disposables = new DisposableStore();
    const environmentService = TestEnvironmentService;
    const logService = new NullLogService();
    const fileService = disposables.add(new FileService(logService));
    disposables.add(
      fileService.registerProvider(
        Schemas.file,
        disposables.add(new InMemoryFileSystemProvider())
      )
    );
    disposables.add(
      fileService.registerProvider(
        Schemas.vscodeUserData,
        disposables.add(new InMemoryFileSystemProvider())
      )
    );
    super(
      new TestContextService(TestWorkspace),
      environmentService,
      fileService,
      logService
    );
    this.backupResourceJoiners = [];
    this.discardBackupJoiners = [];
    this.discardedBackups = [];
    this._register(disposables);
  }
  testGetFileService() {
    return this.fileService;
  }
  joinBackupResource() {
    return new Promise(
      (resolve) => this.backupResourceJoiners.push(resolve)
    );
  }
  joinDiscardBackup() {
    return new Promise(
      (resolve) => this.discardBackupJoiners.push(resolve)
    );
  }
  async backup(identifier, content, versionId, meta, token) {
    await super.backup(identifier, content, versionId, meta, token);
    while (this.backupResourceJoiners.length) {
      this.backupResourceJoiners.pop()();
    }
  }
  async discardBackup(identifier) {
    await super.discardBackup(identifier);
    this.discardedBackups.push(identifier);
    while (this.discardBackupJoiners.length) {
      this.discardBackupJoiners.pop()();
    }
  }
  async getBackupContents(identifier) {
    const backupResource = this.toBackupResource(identifier);
    const fileContents = await this.fileService.readFile(backupResource);
    return fileContents.value.toString();
  }
}
class TestLifecycleService extends Disposable {
  usePhases = false;
  _phase;
  get phase() {
    return this._phase;
  }
  set phase(value) {
    this._phase = value;
    if (value === LifecyclePhase.Starting) {
      this.whenStarted.complete();
    } else if (value === LifecyclePhase.Ready) {
      this.whenReady.complete();
    } else if (value === LifecyclePhase.Restored) {
      this.whenRestored.complete();
    } else if (value === LifecyclePhase.Eventually) {
      this.whenEventually.complete();
    }
  }
  whenStarted = new DeferredPromise();
  whenReady = new DeferredPromise();
  whenRestored = new DeferredPromise();
  whenEventually = new DeferredPromise();
  async when(phase) {
    if (!this.usePhases) {
      return;
    }
    if (phase === LifecyclePhase.Starting) {
      await this.whenStarted.p;
    } else if (phase === LifecyclePhase.Ready) {
      await this.whenReady.p;
    } else if (phase === LifecyclePhase.Restored) {
      await this.whenRestored.p;
    } else if (phase === LifecyclePhase.Eventually) {
      await this.whenEventually.p;
    }
  }
  startupKind;
  _onBeforeShutdown = this._register(
    new Emitter()
  );
  get onBeforeShutdown() {
    return this._onBeforeShutdown.event;
  }
  _onBeforeShutdownError = this._register(
    new Emitter()
  );
  get onBeforeShutdownError() {
    return this._onBeforeShutdownError.event;
  }
  _onShutdownVeto = this._register(new Emitter());
  get onShutdownVeto() {
    return this._onShutdownVeto.event;
  }
  _onWillShutdown = this._register(
    new Emitter()
  );
  get onWillShutdown() {
    return this._onWillShutdown.event;
  }
  _onDidShutdown = this._register(new Emitter());
  get onDidShutdown() {
    return this._onDidShutdown.event;
  }
  shutdownJoiners = [];
  fireShutdown(reason = ShutdownReason.QUIT) {
    this.shutdownJoiners = [];
    this._onWillShutdown.fire({
      join: (p) => {
        this.shutdownJoiners.push(typeof p === "function" ? p() : p);
      },
      joiners: () => [],
      force: () => {
      },
      token: CancellationToken.None,
      reason
    });
  }
  fireBeforeShutdown(event) {
    this._onBeforeShutdown.fire(event);
  }
  fireWillShutdown(event) {
    this._onWillShutdown.fire(event);
  }
  async shutdown() {
    this.fireShutdown();
  }
}
class TestBeforeShutdownEvent {
  value;
  finalValue;
  reason = ShutdownReason.CLOSE;
  veto(value) {
    this.value = value;
  }
  finalVeto(vetoFn) {
    this.value = vetoFn();
    this.finalValue = vetoFn;
  }
}
class TestWillShutdownEvent {
  value = [];
  joiners = () => [];
  reason = ShutdownReason.CLOSE;
  token = CancellationToken.None;
  join(promise, joiner) {
    this.value.push(typeof promise === "function" ? promise() : promise);
  }
  force() {
  }
}
class TestTextResourceConfigurationService {
  constructor(configurationService = new TestConfigurationService()) {
    this.configurationService = configurationService;
  }
  onDidChangeConfiguration() {
    return { dispose() {
    } };
  }
  getValue(resource, arg2, arg3) {
    const position = EditorPosition.isIPosition(arg2) ? arg2 : null;
    const section = position ? typeof arg3 === "string" ? arg3 : void 0 : typeof arg2 === "string" ? arg2 : void 0;
    return this.configurationService.getValue(section, { resource });
  }
  inspect(resource, position, section) {
    return this.configurationService.inspect(section, { resource });
  }
  updateValue(resource, key, value, configurationTarget) {
    return this.configurationService.updateValue(key, value);
  }
}
class RemoteFileSystemProvider {
  constructor(wrappedFsp, remoteAuthority) {
    this.wrappedFsp = wrappedFsp;
    this.remoteAuthority = remoteAuthority;
  }
  capabilities = this.wrappedFsp.capabilities;
  onDidChangeCapabilities = this.wrappedFsp.onDidChangeCapabilities;
  onDidChangeFile = Event.map(
    this.wrappedFsp.onDidChangeFile,
    (changes) => changes.map((c) => {
      return {
        type: c.type,
        resource: c.resource.with({
          scheme: Schemas.vscodeRemote,
          authority: this.remoteAuthority
        })
      };
    })
  );
  watch(resource, opts) {
    return this.wrappedFsp.watch(this.toFileResource(resource), opts);
  }
  stat(resource) {
    return this.wrappedFsp.stat(this.toFileResource(resource));
  }
  mkdir(resource) {
    return this.wrappedFsp.mkdir(this.toFileResource(resource));
  }
  readdir(resource) {
    return this.wrappedFsp.readdir(this.toFileResource(resource));
  }
  delete(resource, opts) {
    return this.wrappedFsp.delete(this.toFileResource(resource), opts);
  }
  rename(from, to, opts) {
    return this.wrappedFsp.rename(
      this.toFileResource(from),
      this.toFileResource(to),
      opts
    );
  }
  copy(from, to, opts) {
    return this.wrappedFsp.copy(
      this.toFileResource(from),
      this.toFileResource(to),
      opts
    );
  }
  readFile(resource) {
    return this.wrappedFsp.readFile(this.toFileResource(resource));
  }
  writeFile(resource, content, opts) {
    return this.wrappedFsp.writeFile(
      this.toFileResource(resource),
      content,
      opts
    );
  }
  open(resource, opts) {
    return this.wrappedFsp.open(this.toFileResource(resource), opts);
  }
  close(fd) {
    return this.wrappedFsp.close(fd);
  }
  read(fd, pos, data, offset, length) {
    return this.wrappedFsp.read(fd, pos, data, offset, length);
  }
  write(fd, pos, data, offset, length) {
    return this.wrappedFsp.write(fd, pos, data, offset, length);
  }
  readFileStream(resource, opts, token) {
    return this.wrappedFsp.readFileStream(
      this.toFileResource(resource),
      opts,
      token
    );
  }
  toFileResource(resource) {
    return resource.with({ scheme: Schemas.file, authority: "" });
  }
}
class TestInMemoryFileSystemProvider extends InMemoryFileSystemProvider {
  get capabilities() {
    return FileSystemProviderCapabilities.FileReadWrite | FileSystemProviderCapabilities.PathCaseSensitive | FileSystemProviderCapabilities.FileReadStream;
  }
  readFileStream(resource) {
    const BUFFER_SIZE = 64 * 1024;
    const stream = newWriteableStream(
      (data) => VSBuffer.concat(data.map((data2) => VSBuffer.wrap(data2))).buffer
    );
    (async () => {
      try {
        const data = await this.readFile(resource);
        let offset = 0;
        while (offset < data.length) {
          await timeout(0);
          await stream.write(
            data.subarray(offset, offset + BUFFER_SIZE)
          );
          offset += BUFFER_SIZE;
        }
        await timeout(0);
        stream.end();
      } catch (error) {
        stream.end(error);
      }
    })();
    return stream;
  }
}
const productService = {
  _serviceBrand: void 0,
  ...product
};
class TestHostService {
  _hasFocus = true;
  get hasFocus() {
    return this._hasFocus;
  }
  async hadLastFocus() {
    return this._hasFocus;
  }
  _onDidChangeFocus = new Emitter();
  onDidChangeFocus = this._onDidChangeFocus.event;
  _onDidChangeWindow = new Emitter();
  onDidChangeActiveWindow = this._onDidChangeWindow.event;
  onDidChangeFullScreen = Event.None;
  setFocus(focus) {
    this._hasFocus = focus;
    this._onDidChangeFocus.fire(this._hasFocus);
  }
  async restart() {
  }
  async reload() {
  }
  async close() {
  }
  async withExpectedShutdown(expectedShutdownTask) {
    return await expectedShutdownTask();
  }
  async focus() {
  }
  async moveTop() {
  }
  async getCursorScreenPoint() {
    return void 0;
  }
  async openWindow(arg1, arg2) {
  }
  async toggleFullScreen() {
  }
  colorScheme = ColorScheme.DARK;
  onDidChangeColorScheme = Event.None;
  getPathForFile(file) {
    return void 0;
  }
}
class TestFilesConfigurationService extends FilesConfigurationService {
  testOnFilesConfigurationChange(configuration) {
    super.onFilesConfigurationChange(configuration, true);
  }
}
class TestReadonlyTextFileEditorModel extends TextFileEditorModel {
  isReadonly() {
    return true;
  }
}
class TestEditorInput extends EditorInput {
  constructor(resource, _typeId) {
    super();
    this.resource = resource;
    this._typeId = _typeId;
  }
  get typeId() {
    return this._typeId;
  }
  get editorId() {
    return this._typeId;
  }
  resolve() {
    return Promise.resolve(null);
  }
}
function registerTestEditor(id, inputs, serializerInputId) {
  const disposables = new DisposableStore();
  class TestEditor extends EditorPane {
    _scopedContextKeyService;
    constructor(group) {
      super(
        id,
        group,
        NullTelemetryService,
        new TestThemeService(),
        disposables.add(new TestStorageService())
      );
      this._scopedContextKeyService = new MockContextKeyService();
    }
    async setInput(input, options, context, token) {
      super.setInput(input, options, context, token);
      await input.resolve();
    }
    getId() {
      return id;
    }
    layout() {
    }
    createEditor() {
    }
    get scopedContextKeyService() {
      return this._scopedContextKeyService;
    }
  }
  disposables.add(
    Registry.as(
      Extensions.EditorPane
    ).registerEditorPane(
      EditorPaneDescriptor.create(TestEditor, id, "Test Editor Control"),
      inputs
    )
  );
  if (serializerInputId) {
    class EditorsObserverTestEditorInputSerializer {
      canSerialize(editorInput) {
        return true;
      }
      serialize(editorInput) {
        const testEditorInput = editorInput;
        const testInput = {
          resource: testEditorInput.resource.toString()
        };
        return JSON.stringify(testInput);
      }
      deserialize(instantiationService, serializedEditorInput) {
        const testInput = JSON.parse(
          serializedEditorInput
        );
        return new TestFileEditorInput(
          URI.parse(testInput.resource),
          serializerInputId
        );
      }
    }
    disposables.add(
      Registry.as(
        EditorExtensions.EditorFactory
      ).registerEditorSerializer(
        serializerInputId,
        EditorsObserverTestEditorInputSerializer
      )
    );
  }
  return disposables;
}
function registerTestFileEditor() {
  const disposables = new DisposableStore();
  disposables.add(
    Registry.as(
      Extensions.EditorPane
    ).registerEditorPane(
      EditorPaneDescriptor.create(
        TestTextFileEditor,
        TestTextFileEditor.ID,
        "Text File Editor"
      ),
      [new SyncDescriptor(FileEditorInput)]
    )
  );
  return disposables;
}
function registerTestResourceEditor() {
  const disposables = new DisposableStore();
  disposables.add(
    Registry.as(
      Extensions.EditorPane
    ).registerEditorPane(
      EditorPaneDescriptor.create(
        TestTextResourceEditor,
        TestTextResourceEditor.ID,
        "Text Editor"
      ),
      [
        new SyncDescriptor(UntitledTextEditorInput),
        new SyncDescriptor(TextResourceEditorInput)
      ]
    )
  );
  return disposables;
}
function registerTestSideBySideEditor() {
  const disposables = new DisposableStore();
  disposables.add(
    Registry.as(
      Extensions.EditorPane
    ).registerEditorPane(
      EditorPaneDescriptor.create(
        SideBySideEditor,
        SideBySideEditor.ID,
        "Text Editor"
      ),
      [new SyncDescriptor(SideBySideEditorInput)]
    )
  );
  return disposables;
}
class TestFileEditorInput extends EditorInput {
  constructor(resource, _typeId) {
    super();
    this.resource = resource;
    this._typeId = _typeId;
  }
  preferredResource = this.resource;
  gotDisposed = false;
  gotSaved = false;
  gotSavedAs = false;
  gotReverted = false;
  dirty = false;
  modified;
  fails = false;
  disableToUntyped = false;
  get typeId() {
    return this._typeId;
  }
  get editorId() {
    return this._typeId;
  }
  _capabilities = EditorInputCapabilities.None;
  get capabilities() {
    return this._capabilities;
  }
  set capabilities(capabilities) {
    if (this._capabilities !== capabilities) {
      this._capabilities = capabilities;
      this._onDidChangeCapabilities.fire();
    }
  }
  resolve() {
    return this.fails ? Promise.reject(new Error("fails")) : Promise.resolve(null);
  }
  matches(other) {
    if (super.matches(other)) {
      return true;
    }
    if (other instanceof EditorInput) {
      return !!(other?.resource && this.resource.toString() === other.resource.toString() && other instanceof TestFileEditorInput && other.typeId === this.typeId);
    }
    return isEqual(this.resource, other.resource) && (this.editorId === other.options?.override || other.options?.override === void 0);
  }
  setPreferredResource(resource) {
  }
  async setEncoding(encoding) {
  }
  getEncoding() {
    return void 0;
  }
  setPreferredName(name) {
  }
  setPreferredDescription(description) {
  }
  setPreferredEncoding(encoding) {
  }
  setPreferredContents(contents) {
  }
  setLanguageId(languageId, source) {
  }
  setPreferredLanguageId(languageId) {
  }
  setForceOpenAsBinary() {
  }
  setFailToOpen() {
    this.fails = true;
  }
  async save(groupId, options) {
    this.gotSaved = true;
    this.dirty = false;
    return this;
  }
  async saveAs(groupId, options) {
    this.gotSavedAs = true;
    return this;
  }
  async revert(group, options) {
    this.gotReverted = true;
    this.gotSaved = false;
    this.gotSavedAs = false;
    this.dirty = false;
  }
  toUntyped() {
    if (this.disableToUntyped) {
      return void 0;
    }
    return { resource: this.resource };
  }
  setModified() {
    this.modified = true;
  }
  isModified() {
    return this.modified === void 0 ? this.dirty : this.modified;
  }
  setDirty() {
    this.dirty = true;
  }
  isDirty() {
    return this.dirty;
  }
  isResolved() {
    return false;
  }
  dispose() {
    super.dispose();
    this.gotDisposed = true;
  }
  movedEditor = void 0;
  async rename() {
    return this.movedEditor;
  }
  moveDisabledReason = void 0;
  setMoveDisabled(reason) {
    this.moveDisabledReason = reason;
  }
  canMove(sourceGroup, targetGroup) {
    if (typeof this.moveDisabledReason === "string") {
      return this.moveDisabledReason;
    }
    return super.canMove(sourceGroup, targetGroup);
  }
}
class TestSingletonFileEditorInput extends TestFileEditorInput {
  get capabilities() {
    return EditorInputCapabilities.Singleton;
  }
}
class TestEditorPart extends MainEditorPart {
  mainPart = this;
  parts = [this];
  onDidCreateAuxiliaryEditorPart = Event.None;
  testSaveState() {
    return super.saveState();
  }
  clearState() {
    const workspaceMemento = this.getMemento(
      StorageScope.WORKSPACE,
      StorageTarget.MACHINE
    );
    for (const key of Object.keys(workspaceMemento)) {
      delete workspaceMemento[key];
    }
    const profileMemento = this.getMemento(
      StorageScope.PROFILE,
      StorageTarget.MACHINE
    );
    for (const key of Object.keys(profileMemento)) {
      delete profileMemento[key];
    }
  }
  registerEditorPart(part) {
    return Disposable.None;
  }
  createAuxiliaryEditorPart() {
    throw new Error("Method not implemented.");
  }
  getScopedInstantiationService(part) {
    throw new Error("Method not implemented.");
  }
  getPart(group) {
    return this;
  }
  saveWorkingSet(name) {
    throw new Error("Method not implemented.");
  }
  getWorkingSets() {
    throw new Error("Method not implemented.");
  }
  applyWorkingSet(workingSet, options) {
    throw new Error("Method not implemented.");
  }
  deleteWorkingSet(workingSet) {
    throw new Error("Method not implemented.");
  }
  registerContextKeyProvider(provider) {
    throw new Error("Method not implemented.");
  }
}
class TestEditorParts extends EditorParts {
  testMainPart;
  createMainEditorPart() {
    this.testMainPart = this.instantiationService.createInstance(
      TestEditorPart,
      this
    );
    return this.testMainPart;
  }
}
async function createEditorParts(instantiationService, disposables) {
  const parts = instantiationService.createInstance(TestEditorParts);
  const part = disposables.add(parts).testMainPart;
  part.create(document.createElement("div"));
  part.layout(1080, 800, 0, 0);
  await parts.whenReady;
  return parts;
}
async function createEditorPart(instantiationService, disposables) {
  return (await createEditorParts(instantiationService, disposables)).testMainPart;
}
class TestListService {
  lastFocusedList = void 0;
  register() {
    return Disposable.None;
  }
}
class TestPathService {
  constructor(fallbackUserHome = URI.from({
    scheme: Schemas.file,
    path: "/"
  }), defaultUriScheme = Schemas.file) {
    this.fallbackUserHome = fallbackUserHome;
    this.defaultUriScheme = defaultUriScheme;
  }
  hasValidBasename(resource, arg2, name) {
    if (typeof arg2 === "string" || typeof arg2 === "undefined") {
      return isValidBasename(arg2 ?? basename(resource));
    }
    return isValidBasename(name ?? basename(resource));
  }
  get path() {
    return Promise.resolve(isWindows ? win32 : posix);
  }
  userHome(options) {
    return options?.preferLocal ? this.fallbackUserHome : Promise.resolve(this.fallbackUserHome);
  }
  get resolvedUserHome() {
    return this.fallbackUserHome;
  }
  async fileURI(path) {
    return URI.file(path);
  }
}
function getLastResolvedFileStat(model) {
  const candidate = model;
  return candidate?.lastResolvedFileStat;
}
class TestWorkspacesService {
  _serviceBrand;
  onDidChangeRecentlyOpened = Event.None;
  async createUntitledWorkspace(folders, remoteAuthority) {
    throw new Error("Method not implemented.");
  }
  async deleteUntitledWorkspace(workspace) {
  }
  async addRecentlyOpened(recents) {
  }
  async removeRecentlyOpened(workspaces) {
  }
  async clearRecentlyOpened() {
  }
  async getRecentlyOpened() {
    return { files: [], workspaces: [] };
  }
  async getDirtyWorkspaces() {
    return [];
  }
  async enterWorkspace(path) {
    throw new Error("Method not implemented.");
  }
  async getWorkspaceIdentifier(workspacePath) {
    throw new Error("Method not implemented.");
  }
}
class TestTerminalInstanceService {
  onDidCreateInstance = Event.None;
  convertProfileToShellLaunchConfig(shellLaunchConfigOrProfile, cwd) {
    throw new Error("Method not implemented.");
  }
  preparePathForTerminalAsync(path, executable, title, shellType, remoteAuthority) {
    throw new Error("Method not implemented.");
  }
  createInstance(options, target) {
    throw new Error("Method not implemented.");
  }
  async getBackend(remoteAuthority) {
    throw new Error("Method not implemented.");
  }
  didRegisterBackend(remoteAuthority) {
    throw new Error("Method not implemented.");
  }
  getRegisteredBackends() {
    throw new Error("Method not implemented.");
  }
}
class TestTerminalEditorService {
  _serviceBrand;
  activeInstance;
  instances = [];
  onDidDisposeInstance = Event.None;
  onDidFocusInstance = Event.None;
  onDidChangeInstanceCapability = Event.None;
  onDidChangeActiveInstance = Event.None;
  onDidChangeInstances = Event.None;
  openEditor(instance, editorOptions) {
    throw new Error("Method not implemented.");
  }
  detachInstance(instance) {
    throw new Error("Method not implemented.");
  }
  splitInstance(instanceToSplit, shellLaunchConfig) {
    throw new Error("Method not implemented.");
  }
  revealActiveEditor(preserveFocus) {
    throw new Error("Method not implemented.");
  }
  resolveResource(instance) {
    throw new Error("Method not implemented.");
  }
  reviveInput(deserializedInput) {
    throw new Error("Method not implemented.");
  }
  getInputFromResource(resource) {
    throw new Error("Method not implemented.");
  }
  setActiveInstance(instance) {
    throw new Error("Method not implemented.");
  }
  focusActiveInstance() {
    throw new Error("Method not implemented.");
  }
  focusInstance(instance) {
    throw new Error("Method not implemented.");
  }
  getInstanceFromResource(resource) {
    throw new Error("Method not implemented.");
  }
  focusFindWidget() {
    throw new Error("Method not implemented.");
  }
  hideFindWidget() {
    throw new Error("Method not implemented.");
  }
  findNext() {
    throw new Error("Method not implemented.");
  }
  findPrevious() {
    throw new Error("Method not implemented.");
  }
}
class TestTerminalGroupService {
  _serviceBrand;
  activeInstance;
  instances = [];
  groups = [];
  activeGroup;
  activeGroupIndex = 0;
  lastAccessedMenu = "inline-tab";
  onDidChangeActiveGroup = Event.None;
  onDidDisposeGroup = Event.None;
  onDidShow = Event.None;
  onDidChangeGroups = Event.None;
  onDidChangePanelOrientation = Event.None;
  onDidDisposeInstance = Event.None;
  onDidFocusInstance = Event.None;
  onDidChangeInstanceCapability = Event.None;
  onDidChangeActiveInstance = Event.None;
  onDidChangeInstances = Event.None;
  createGroup(instance) {
    throw new Error("Method not implemented.");
  }
  getGroupForInstance(instance) {
    throw new Error("Method not implemented.");
  }
  moveGroup(source, target) {
    throw new Error("Method not implemented.");
  }
  moveGroupToEnd(source) {
    throw new Error("Method not implemented.");
  }
  moveInstance(source, target, side) {
    throw new Error("Method not implemented.");
  }
  unsplitInstance(instance) {
    throw new Error("Method not implemented.");
  }
  joinInstances(instances) {
    throw new Error("Method not implemented.");
  }
  instanceIsSplit(instance) {
    throw new Error("Method not implemented.");
  }
  getGroupLabels() {
    throw new Error("Method not implemented.");
  }
  setActiveGroupByIndex(index) {
    throw new Error("Method not implemented.");
  }
  setActiveGroupToNext() {
    throw new Error("Method not implemented.");
  }
  setActiveGroupToPrevious() {
    throw new Error("Method not implemented.");
  }
  setActiveInstanceByIndex(terminalIndex) {
    throw new Error("Method not implemented.");
  }
  setContainer(container) {
    throw new Error("Method not implemented.");
  }
  showPanel(focus) {
    throw new Error("Method not implemented.");
  }
  hidePanel() {
    throw new Error("Method not implemented.");
  }
  focusTabs() {
    throw new Error("Method not implemented.");
  }
  focusHover() {
    throw new Error("Method not implemented.");
  }
  setActiveInstance(instance) {
    throw new Error("Method not implemented.");
  }
  focusActiveInstance() {
    throw new Error("Method not implemented.");
  }
  focusInstance(instance) {
    throw new Error("Method not implemented.");
  }
  getInstanceFromResource(resource) {
    throw new Error("Method not implemented.");
  }
  focusFindWidget() {
    throw new Error("Method not implemented.");
  }
  hideFindWidget() {
    throw new Error("Method not implemented.");
  }
  findNext() {
    throw new Error("Method not implemented.");
  }
  findPrevious() {
    throw new Error("Method not implemented.");
  }
  updateVisibility() {
    throw new Error("Method not implemented.");
  }
}
class TestTerminalProfileService {
  _serviceBrand;
  availableProfiles = [];
  contributedProfiles = [];
  profilesReady = Promise.resolve();
  onDidChangeAvailableProfiles = Event.None;
  getPlatformKey() {
    throw new Error("Method not implemented.");
  }
  refreshAvailableProfiles() {
    throw new Error("Method not implemented.");
  }
  getDefaultProfileName() {
    throw new Error("Method not implemented.");
  }
  getDefaultProfile() {
    throw new Error("Method not implemented.");
  }
  getContributedDefaultProfile(shellLaunchConfig) {
    throw new Error("Method not implemented.");
  }
  registerContributedProfile(args) {
    throw new Error("Method not implemented.");
  }
  getContributedProfileProvider(extensionIdentifier, id) {
    throw new Error("Method not implemented.");
  }
  registerTerminalProfileProvider(extensionIdentifier, id, profileProvider) {
    throw new Error("Method not implemented.");
  }
}
class TestTerminalProfileResolverService {
  _serviceBrand;
  defaultProfileName = "";
  resolveIcon(shellLaunchConfig) {
  }
  async resolveShellLaunchConfig(shellLaunchConfig, options) {
  }
  async getDefaultProfile(options) {
    return { path: "/default", profileName: "Default", isDefault: true };
  }
  async getDefaultShell(options) {
    return "/default";
  }
  async getDefaultShellArgs(options) {
    return [];
  }
  getDefaultIcon() {
    return Codicon.terminal;
  }
  async getEnvironment() {
    return env;
  }
  getSafeConfigValue(key, os) {
    return void 0;
  }
  getSafeConfigValueFullKey(key) {
    return void 0;
  }
  createProfileFromShellAndShellArgs(shell, shellArgs) {
    throw new Error("Method not implemented.");
  }
}
class TestTerminalConfigurationService extends TerminalConfigurationService {
  get fontMetrics() {
    return this._fontMetrics;
  }
  setConfig(config) {
    this._config = config;
  }
}
class TestQuickInputService {
  onShow = Event.None;
  onHide = Event.None;
  currentQuickInput = void 0;
  quickAccess = void 0;
  backButton;
  async pick(picks, options, token) {
    if (Array.isArray(picks)) {
      return {
        label: "selectedPick",
        description: "pick description",
        value: "selectedPick"
      };
    } else {
      return void 0;
    }
  }
  async input(options, token) {
    return options ? "resolved" + options.prompt : "resolved";
  }
  createQuickPick() {
    throw new Error("not implemented.");
  }
  createInputBox() {
    throw new Error("not implemented.");
  }
  createQuickWidget() {
    throw new Error("Method not implemented.");
  }
  focus() {
    throw new Error("not implemented.");
  }
  toggle() {
    throw new Error("not implemented.");
  }
  navigate(next, quickNavigate) {
    throw new Error("not implemented.");
  }
  accept() {
    throw new Error("not implemented.");
  }
  back() {
    throw new Error("not implemented.");
  }
  cancel() {
    throw new Error("not implemented.");
  }
}
class TestLanguageDetectionService {
  isEnabledForLanguage(languageId) {
    return false;
  }
  async detectLanguage(resource, supportedLangs) {
    return void 0;
  }
}
class TestRemoteAgentService {
  getConnection() {
    return null;
  }
  async getEnvironment() {
    return null;
  }
  async getRawEnvironment() {
    return null;
  }
  async getExtensionHostExitInfo(reconnectionToken) {
    return null;
  }
  async getDiagnosticInfo(options) {
    return void 0;
  }
  async updateTelemetryLevel(telemetryLevel) {
  }
  async logTelemetry(eventName, data) {
  }
  async flushTelemetry() {
  }
  async getRoundTripTime() {
    return void 0;
  }
  async endConnection() {
  }
}
class TestRemoteExtensionsScannerService {
  async whenExtensionsReady() {
  }
  scanExtensions() {
    throw new Error("Method not implemented.");
  }
}
class TestWorkbenchExtensionEnablementService {
  _serviceBrand;
  onEnablementChanged = Event.None;
  getEnablementState(extension) {
    return EnablementState.EnabledGlobally;
  }
  getEnablementStates(extensions, workspaceTypeOverrides) {
    return [];
  }
  getDependenciesEnablementStates(extension) {
    return [];
  }
  canChangeEnablement(extension) {
    return true;
  }
  canChangeWorkspaceEnablement(extension) {
    return true;
  }
  isEnabled(extension) {
    return true;
  }
  isEnabledEnablementState(enablementState) {
    return true;
  }
  isDisabledGlobally(extension) {
    return false;
  }
  async setEnablement(extensions, state) {
    return [];
  }
  async updateExtensionsEnablementsWhenWorkspaceTrustChanges() {
  }
}
class TestWorkbenchExtensionManagementService {
  _serviceBrand;
  onInstallExtension = Event.None;
  onDidInstallExtensions = Event.None;
  onUninstallExtension = Event.None;
  onDidUninstallExtension = Event.None;
  onDidUpdateExtensionMetadata = Event.None;
  onProfileAwareInstallExtension = Event.None;
  onProfileAwareDidInstallExtensions = Event.None;
  onProfileAwareUninstallExtension = Event.None;
  onProfileAwareDidUninstallExtension = Event.None;
  onDidChangeProfile = Event.None;
  onDidEnableExtensions = Event.None;
  installVSIX(location, manifest, installOptions) {
    throw new Error("Method not implemented.");
  }
  installFromLocation(location) {
    throw new Error("Method not implemented.");
  }
  installGalleryExtensions(extensions) {
    throw new Error("Method not implemented.");
  }
  async updateFromGallery(gallery, extension, installOptions) {
    return extension;
  }
  zip(extension) {
    throw new Error("Method not implemented.");
  }
  getManifest(vsix) {
    throw new Error("Method not implemented.");
  }
  install(vsix, options) {
    throw new Error("Method not implemented.");
  }
  async canInstall(extension) {
    return false;
  }
  installFromGallery(extension, options) {
    throw new Error("Method not implemented.");
  }
  uninstall(extension, options) {
    throw new Error("Method not implemented.");
  }
  uninstallExtensions(extensions) {
    throw new Error("Method not implemented.");
  }
  async reinstallFromGallery(extension) {
    throw new Error("Method not implemented.");
  }
  async getInstalled(type) {
    return [];
  }
  getExtensionsControlManifest() {
    throw new Error("Method not implemented.");
  }
  async updateMetadata(local, metadata) {
    return local;
  }
  registerParticipant(pariticipant) {
  }
  async getTargetPlatform() {
    return TargetPlatform.UNDEFINED;
  }
  async cleanUp() {
  }
  download() {
    throw new Error("Method not implemented.");
  }
  copyExtensions() {
    throw new Error("Not Supported");
  }
  toggleAppliationScope() {
    throw new Error("Not Supported");
  }
  installExtensionsFromProfile() {
    throw new Error("Not Supported");
  }
  whenProfileChanged(from, to) {
    throw new Error("Not Supported");
  }
  getInstalledWorkspaceExtensionLocations() {
    throw new Error("Method not implemented.");
  }
  getInstalledWorkspaceExtensions() {
    throw new Error("Method not implemented.");
  }
  installResourceExtension() {
    throw new Error("Method not implemented.");
  }
  getExtensions() {
    throw new Error("Method not implemented.");
  }
  resetPinnedStateForAllUserExtensions(pinned) {
    throw new Error("Method not implemented.");
  }
}
class TestUserDataProfileService {
  _serviceBrand;
  onDidChangeCurrentProfile = Event.None;
  currentProfile = toUserDataProfile(
    "test",
    "test",
    URI.file("tests").with({ scheme: "vscode-tests" }),
    URI.file("tests").with({ scheme: "vscode-tests" })
  );
  async updateCurrentProfile() {
  }
  getShortName(profile) {
    return profile.shortName ?? profile.name;
  }
}
class TestWebExtensionsScannerService {
  _serviceBrand;
  onDidChangeProfile = Event.None;
  async scanSystemExtensions() {
    return [];
  }
  async scanUserExtensions() {
    return [];
  }
  async scanExtensionsUnderDevelopment() {
    return [];
  }
  async copyExtensions() {
    throw new Error("Method not implemented.");
  }
  scanExistingExtension(extensionLocation, extensionType) {
    throw new Error("Method not implemented.");
  }
  addExtension(location, metadata) {
    throw new Error("Method not implemented.");
  }
  addExtensionFromGallery(galleryExtension, metadata) {
    throw new Error("Method not implemented.");
  }
  removeExtension() {
    throw new Error("Method not implemented.");
  }
  updateMetadata(extension, metaData, profileLocation) {
    throw new Error("Method not implemented.");
  }
  scanExtensionManifest(extensionLocation) {
    throw new Error("Method not implemented.");
  }
}
async function workbenchTeardown(instantiationService) {
  return instantiationService.invokeFunction(async (accessor) => {
    const workingCopyService = accessor.get(IWorkingCopyService);
    const editorGroupService = accessor.get(IEditorGroupsService);
    for (const workingCopy of workingCopyService.workingCopies) {
      await workingCopy.revert();
    }
    for (const group of editorGroupService.groups) {
      await group.closeAllEditors();
    }
    for (const group of editorGroupService.groups) {
      editorGroupService.removeGroup(group);
    }
  });
}
export {
  InMemoryTestWorkingCopyBackupService,
  RemoteFileSystemProvider,
  TestBeforeShutdownEvent,
  TestBrowserTextFileServiceWithEncodingOverrides,
  TestDecorationsService,
  TestEditorGroupAccessor,
  TestEditorGroupView,
  TestEditorGroupsService,
  TestEditorInput,
  TestEditorPart,
  TestEditorParts,
  TestEditorService,
  TestEncodingOracle,
  TestEnvironmentService,
  TestFileDialogService,
  TestFileEditorInput,
  TestFileService,
  TestFilesConfigurationService,
  TestHostService,
  TestInMemoryFileSystemProvider,
  TestLayoutService,
  TestLifecycleService,
  TestListService,
  TestMenuService,
  TestPaneCompositeService,
  TestPanelPart,
  TestPathService,
  TestProgressService,
  TestQuickInputService,
  TestReadonlyTextFileEditorModel,
  TestRemoteAgentService,
  TestRemoteExtensionsScannerService,
  TestServiceAccessor,
  TestSideBarPart,
  TestSingletonFileEditorInput,
  TestTerminalConfigurationService,
  TestTerminalEditorService,
  TestTerminalGroupService,
  TestTerminalInstanceService,
  TestTerminalProfileResolverService,
  TestTerminalProfileService,
  TestTextFileEditor,
  TestTextFileService,
  TestTextResourceConfigurationService,
  TestTextResourceEditor,
  TestUserDataProfileService,
  TestViewsService,
  TestWebExtensionsScannerService,
  TestWillShutdownEvent,
  TestWorkbenchExtensionEnablementService,
  TestWorkbenchExtensionManagementService,
  TestWorkingCopyBackupService,
  TestWorkingCopyService,
  TestWorkspacesService,
  createEditorPart,
  createEditorParts,
  createFileEditorInput,
  getLastResolvedFileStat,
  productService,
  registerTestEditor,
  registerTestFileEditor,
  registerTestResourceEditor,
  registerTestSideBySideEditor,
  toTypedWorkingCopyId,
  toUntypedWorkingCopyId,
  workbenchInstantiationService,
  workbenchTeardown
};
