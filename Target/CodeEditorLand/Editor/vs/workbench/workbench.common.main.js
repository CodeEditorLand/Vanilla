import "../editor/editor.all.js";
import "./api/browser/extensionHost.contribution.js";
import "./browser/workbench.contribution.js";
import "./browser/actions/textInputActions.js";
import "./browser/actions/developerActions.js";
import "./browser/actions/helpActions.js";
import "./browser/actions/layoutActions.js";
import "./browser/actions/listCommands.js";
import "./browser/actions/navigationActions.js";
import "./browser/actions/windowActions.js";
import "./browser/actions/workspaceActions.js";
import "./browser/actions/workspaceCommands.js";
import "./browser/actions/quickAccessActions.js";
import "./browser/actions/widgetNavigationCommands.js";
import "./services/actions/common/menusExtensionPoint.js";
import "./api/common/configurationExtensionPoint.js";
import "./api/browser/viewsExtensionPoint.js";
import "./browser/parts/editor/editor.contribution.js";
import "./browser/parts/editor/editorParts.js";
import "./browser/parts/paneCompositePartService.js";
import "./browser/parts/banner/bannerPart.js";
import "./browser/parts/statusbar/statusbarPart.js";
import "../platform/actions/common/actions.contribution.js";
import "../platform/undoRedo/common/undoRedoService.js";
import "./services/workspaces/common/editSessionIdentityService.js";
import "./services/workspaces/common/canonicalUriService.js";
import "./services/extensions/browser/extensionUrlHandler.js";
import "./services/keybinding/common/keybindingEditing.js";
import "./services/decorations/browser/decorationsService.js";
import "./services/dialogs/common/dialogService.js";
import "./services/progress/browser/progressService.js";
import "./services/editor/browser/codeEditorService.js";
import "./services/preferences/browser/preferencesService.js";
import "./services/configuration/common/jsonEditingService.js";
import "./services/textmodelResolver/common/textModelResolverService.js";
import "./services/editor/browser/editorService.js";
import "./services/editor/browser/editorResolverService.js";
import "./services/aiEmbeddingVector/common/aiEmbeddingVectorService.js";
import "./services/aiRelatedInformation/common/aiRelatedInformationService.js";
import "./services/history/browser/historyService.js";
import "./services/activity/browser/activityService.js";
import "./services/keybinding/browser/keybindingService.js";
import "./services/untitled/common/untitledTextEditorService.js";
import "./services/textresourceProperties/common/textResourcePropertiesService.js";
import "./services/textfile/common/textEditorService.js";
import "./services/language/common/languageService.js";
import "./services/model/common/modelService.js";
import "./services/notebook/common/notebookDocumentService.js";
import "./services/commands/common/commandService.js";
import "./services/themes/browser/workbenchThemeService.js";
import "./services/label/common/labelService.js";
import "./services/extensions/common/extensionManifestPropertiesService.js";
import "./services/extensionManagement/browser/extensionEnablementService.js";
import "./services/extensionManagement/browser/builtinExtensionsScannerService.js";
import "./services/extensionRecommendations/common/extensionIgnoredRecommendationsService.js";
import "./services/extensionRecommendations/common/workspaceExtensionsConfig.js";
import "./services/extensionManagement/common/extensionFeaturesManagemetService.js";
import "./services/notification/common/notificationService.js";
import "./services/userDataSync/common/userDataSyncUtil.js";
import "./services/userDataProfile/browser/userDataProfileImportExportService.js";
import "./services/userDataProfile/browser/userDataProfileManagement.js";
import "./services/userDataProfile/common/remoteUserDataProfiles.js";
import "./services/remote/common/remoteExplorerService.js";
import "./services/remote/common/remoteExtensionsScanner.js";
import "./services/terminal/common/embedderTerminalService.js";
import "./services/workingCopy/common/workingCopyService.js";
import "./services/workingCopy/common/workingCopyFileService.js";
import "./services/workingCopy/common/workingCopyEditorService.js";
import "./services/filesConfiguration/common/filesConfigurationService.js";
import "./services/views/browser/viewDescriptorService.js";
import "./services/views/browser/viewsService.js";
import "./services/quickinput/browser/quickInputService.js";
import "./services/userDataSync/browser/userDataSyncWorkbenchService.js";
import "./services/authentication/browser/authenticationService.js";
import "./services/authentication/browser/authenticationExtensionsService.js";
import "./services/authentication/browser/authenticationUsageService.js";
import "./services/authentication/browser/authenticationAccessService.js";
import "../editor/browser/services/hoverService/hoverService.js";
import "./services/assignment/common/assignmentService.js";
import "./services/outline/browser/outlineService.js";
import "./services/languageDetection/browser/languageDetectionWorkerServiceImpl.js";
import "../editor/common/services/languageFeaturesService.js";
import "../editor/common/services/semanticTokensStylingService.js";
import "../editor/common/services/treeViewsDndService.js";
import "./services/textMate/browser/textMateTokenizationFeature.contribution.js";
import "./services/treeSitter/browser/treeSitterTokenizationFeature.contribution.js";
import "./services/userActivity/common/userActivityService.js";
import "./services/userActivity/browser/userActivityBrowser.js";
import "./services/editor/browser/editorPaneService.js";
import "./services/editor/common/customEditorLabelService.js";
import { OpenerService } from "../editor/browser/services/openerService.js";
import { IEditorWorkerService } from "../editor/common/services/editorWorker.js";
import { IMarkerDecorationsService } from "../editor/common/services/markerDecorations.js";
import { MarkerDecorationsService } from "../editor/common/services/markerDecorationsService.js";
import { ITextResourceConfigurationService } from "../editor/common/services/textResourceConfiguration.js";
import { TextResourceConfigurationService } from "../editor/common/services/textResourceConfigurationService.js";
import { ContextKeyService } from "../platform/contextkey/browser/contextKeyService.js";
import { IContextKeyService } from "../platform/contextkey/common/contextkey.js";
import { IContextViewService } from "../platform/contextview/browser/contextView.js";
import { ContextViewService } from "../platform/contextview/browser/contextViewService.js";
import { IDownloadService } from "../platform/download/common/download.js";
import { DownloadService } from "../platform/download/common/downloadService.js";
import { GlobalExtensionEnablementService } from "../platform/extensionManagement/common/extensionEnablementService.js";
import { ExtensionGalleryService } from "../platform/extensionManagement/common/extensionGalleryService.js";
import {
  IExtensionGalleryService,
  IGlobalExtensionEnablementService
} from "../platform/extensionManagement/common/extensionManagement.js";
import {
  ExtensionStorageService,
  IExtensionStorageService
} from "../platform/extensionManagement/common/extensionStorage.js";
import {
  InstantiationType,
  registerSingleton
} from "../platform/instantiation/common/extensions.js";
import {
  IListService,
  ListService
} from "../platform/list/browser/listService.js";
import { IMarkerService } from "../platform/markers/common/markers.js";
import { MarkerService } from "../platform/markers/common/markerService.js";
import { IOpenerService } from "../platform/opener/common/opener.js";
import {
  IgnoredExtensionsManagementService,
  IIgnoredExtensionsManagementService
} from "../platform/userDataSync/common/ignoredExtensions.js";
import { IUserDataSyncLogService } from "../platform/userDataSync/common/userDataSync.js";
import { UserDataSyncLogService } from "../platform/userDataSync/common/userDataSyncLog.js";
import { WorkbenchEditorWorkerService } from "./contrib/codeEditor/browser/workbenchEditorWorkerService.js";
import "./contrib/telemetry/browser/telemetry.contribution.js";
import "./contrib/preferences/browser/preferences.contribution.js";
import "./contrib/preferences/browser/keybindingsEditorContribution.js";
import "./contrib/preferences/browser/preferencesSearch.js";
import "./contrib/performance/browser/performance.contribution.js";
import "./contrib/contextmenu/browser/contextmenu.contribution.js";
import "./contrib/notebook/browser/notebook.contribution.js";
import "./contrib/speech/browser/speech.contribution.js";
import "./contrib/chat/browser/chat.contribution.js";
import "./contrib/inlineChat/browser/inlineChat.contribution.js";
import "./contrib/interactive/browser/interactive.contribution.js";
import "./contrib/replNotebook/browser/repl.contribution.js";
import "./contrib/testing/browser/testing.contribution.js";
import "./contrib/logs/common/logs.contribution.js";
import "./contrib/quickaccess/browser/quickAccess.contribution.js";
import "./contrib/files/browser/explorerViewlet.js";
import "./contrib/files/browser/fileActions.contribution.js";
import "./contrib/files/browser/files.contribution.js";
import "./contrib/bulkEdit/browser/bulkEditService.js";
import "./contrib/bulkEdit/browser/preview/bulkEdit.contribution.js";
import "./contrib/search/browser/search.contribution.js";
import "./contrib/search/browser/searchView.js";
import "./contrib/searchEditor/browser/searchEditor.contribution.js";
import "./contrib/sash/browser/sash.contribution.js";
import "./contrib/scm/browser/scm.contribution.js";
import "./contrib/debug/browser/debug.contribution.js";
import "./contrib/debug/browser/debugEditorContribution.js";
import "./contrib/debug/browser/breakpointEditorContribution.js";
import "./contrib/debug/browser/callStackEditorContribution.js";
import "./contrib/debug/browser/repl.js";
import "./contrib/debug/browser/debugViewlet.js";
import "./contrib/markers/browser/markers.contribution.js";
import "./contrib/mergeEditor/browser/mergeEditor.contribution.js";
import "./contrib/multiDiffEditor/browser/multiDiffEditor.contribution.js";
import "./contrib/mappedEdits/common/mappedEdits.contribution.js";
import "./contrib/commands/common/commands.contribution.js";
import "./contrib/comments/browser/comments.contribution.js";
import "./contrib/url/browser/url.contribution.js";
import "./contrib/webview/browser/webview.contribution.js";
import "./contrib/webviewPanel/browser/webviewPanel.contribution.js";
import "./contrib/webviewView/browser/webviewView.contribution.js";
import "./contrib/customEditor/browser/customEditor.contribution.js";
import "./contrib/externalUriOpener/common/externalUriOpener.contribution.js";
import "./contrib/extensions/browser/extensions.contribution.js";
import "./contrib/extensions/browser/extensionsViewlet.js";
import "./contrib/output/common/outputChannelModelService.js";
import "./contrib/output/browser/output.contribution.js";
import "./contrib/output/browser/outputView.js";
import "./contrib/terminal/terminal.all.js";
import "./contrib/externalTerminal/browser/externalTerminal.contribution.js";
import "./contrib/relauncher/browser/relauncher.contribution.js";
import "./contrib/tasks/browser/task.contribution.js";
import "./contrib/remote/common/remote.contribution.js";
import "./contrib/remote/browser/remote.contribution.js";
import "./contrib/emmet/browser/emmet.contribution.js";
import "./contrib/codeEditor/browser/codeEditor.contribution.js";
import "./contrib/keybindings/browser/keybindings.contribution.js";
import "./contrib/snippets/browser/snippets.contribution.js";
import "./contrib/format/browser/format.contribution.js";
import "./contrib/folding/browser/folding.contribution.js";
import "./contrib/limitIndicator/browser/limitIndicator.contribution.js";
import "./contrib/inlayHints/browser/inlayHintsAccessibilty.js";
import "./contrib/themes/browser/themes.contribution.js";
import "./contrib/update/browser/update.contribution.js";
import "./contrib/surveys/browser/nps.contribution.js";
import "./contrib/surveys/browser/languageSurveys.contribution.js";
import "./contrib/welcomeGettingStarted/browser/gettingStarted.contribution.js";
import "./contrib/welcomeWalkthrough/browser/walkThrough.contribution.js";
import "./contrib/welcomeViews/common/viewsWelcome.contribution.js";
import "./contrib/welcomeViews/common/newFile.contribution.js";
import "./contrib/callHierarchy/browser/callHierarchy.contribution.js";
import "./contrib/typeHierarchy/browser/typeHierarchy.contribution.js";
import "./contrib/codeEditor/browser/outline/documentSymbolsOutline.js";
import "./contrib/outline/browser/outline.contribution.js";
import "./contrib/languageDetection/browser/languageDetection.contribution.js";
import "./contrib/languageStatus/browser/languageStatus.contribution.js";
import "./contrib/authentication/browser/authentication.contribution.js";
import "./contrib/userDataSync/browser/userDataSync.contribution.js";
import "./contrib/userDataProfile/browser/userDataProfile.contribution.js";
import "./contrib/editSessions/browser/editSessions.contribution.js";
import "./contrib/codeActions/browser/codeActions.contribution.js";
import "./contrib/timeline/browser/timeline.contribution.js";
import "./contrib/localHistory/browser/localHistory.contribution.js";
import "./contrib/workspace/browser/workspace.contribution.js";
import "./contrib/workspaces/browser/workspaces.contribution.js";
import "./contrib/list/browser/list.contribution.js";
import "./contrib/accessibilitySignals/browser/accessibilitySignal.contribution.js";
import "./contrib/deprecatedExtensionMigrator/browser/deprecatedExtensionMigrator.contribution.js";
import "./contrib/bracketPairColorizer2Telemetry/browser/bracketPairColorizer2Telemetry.contribution.js";
import "./contrib/accessibility/browser/accessibility.contribution.js";
import "./contrib/share/browser/share.contribution.js";
import "./contrib/accountEntitlements/browser/accountsEntitlements.contribution.js";
import "./contrib/scrollLocking/browser/scrollLocking.contribution.js";
import "./contrib/request/common/request.contribution.js";
registerSingleton(
  IUserDataSyncLogService,
  UserDataSyncLogService,
  InstantiationType.Delayed
);
registerSingleton(
  IIgnoredExtensionsManagementService,
  IgnoredExtensionsManagementService,
  InstantiationType.Delayed
);
registerSingleton(
  IGlobalExtensionEnablementService,
  GlobalExtensionEnablementService,
  InstantiationType.Delayed
);
registerSingleton(
  IExtensionStorageService,
  ExtensionStorageService,
  InstantiationType.Delayed
);
registerSingleton(
  IExtensionGalleryService,
  ExtensionGalleryService,
  InstantiationType.Delayed
);
registerSingleton(
  IContextViewService,
  ContextViewService,
  InstantiationType.Delayed
);
registerSingleton(IListService, ListService, InstantiationType.Delayed);
registerSingleton(
  IEditorWorkerService,
  WorkbenchEditorWorkerService,
  InstantiationType.Eager
);
registerSingleton(
  IMarkerDecorationsService,
  MarkerDecorationsService,
  InstantiationType.Delayed
);
registerSingleton(IMarkerService, MarkerService, InstantiationType.Delayed);
registerSingleton(
  IContextKeyService,
  ContextKeyService,
  InstantiationType.Delayed
);
registerSingleton(
  ITextResourceConfigurationService,
  TextResourceConfigurationService,
  InstantiationType.Delayed
);
registerSingleton(IDownloadService, DownloadService, InstantiationType.Delayed);
registerSingleton(IOpenerService, OpenerService, InstantiationType.Delayed);
