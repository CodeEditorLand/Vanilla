import "./workbench.common.main.js";
import "./electron-sandbox/desktop.main.js";
import "./electron-sandbox/desktop.contribution.js";
import "./electron-sandbox/parts/dialogs/dialog.contribution.js";
import "./services/textfile/electron-sandbox/nativeTextFileService.js";
import "./services/dialogs/electron-sandbox/fileDialogService.js";
import "./services/workspaces/electron-sandbox/workspacesService.js";
import "./services/menubar/electron-sandbox/menubarService.js";
import "./services/update/electron-sandbox/updateService.js";
import "./services/url/electron-sandbox/urlService.js";
import "./services/lifecycle/electron-sandbox/lifecycleService.js";
import "./services/title/electron-sandbox/titleService.js";
import "./services/host/electron-sandbox/nativeHostService.js";
import "./services/request/electron-sandbox/requestService.js";
import "./services/clipboard/electron-sandbox/clipboardService.js";
import "./services/contextmenu/electron-sandbox/contextmenuService.js";
import "./services/workspaces/electron-sandbox/workspaceEditingService.js";
import "./services/configurationResolver/electron-sandbox/configurationResolverService.js";
import "./services/accessibility/electron-sandbox/accessibilityService.js";
import "./services/keybinding/electron-sandbox/nativeKeyboardLayout.js";
import "./services/path/electron-sandbox/pathService.js";
import "./services/themes/electron-sandbox/nativeHostColorSchemeService.js";
import "./services/extensionManagement/electron-sandbox/extensionManagementService.js";
import "./services/encryption/electron-sandbox/encryptionService.js";
import "./services/secrets/electron-sandbox/secretStorageService.js";
import "./services/localization/electron-sandbox/languagePackService.js";
import "./services/telemetry/electron-sandbox/telemetryService.js";
import "./services/extensions/electron-sandbox/extensionHostStarter.js";
import "../platform/extensionResourceLoader/common/extensionResourceLoaderService.js";
import "./services/localization/electron-sandbox/localeService.js";
import "./services/extensions/electron-sandbox/extensionsScannerService.js";
import "./services/extensionManagement/electron-sandbox/extensionManagementServerService.js";
import "./services/extensionManagement/electron-sandbox/extensionTipsService.js";
import "./services/userDataSync/electron-sandbox/userDataSyncService.js";
import "./services/userDataSync/electron-sandbox/userDataAutoSyncService.js";
import "./services/timer/electron-sandbox/timerService.js";
import "./services/environment/electron-sandbox/shellEnvironmentService.js";
import "./services/integrity/electron-sandbox/integrityService.js";
import "./services/workingCopy/electron-sandbox/workingCopyBackupService.js";
import "./services/checksum/electron-sandbox/checksumService.js";
import "../platform/remote/electron-sandbox/sharedProcessTunnelService.js";
import "./services/tunnel/electron-sandbox/tunnelService.js";
import "../platform/diagnostics/electron-sandbox/diagnosticsService.js";
import "../platform/profiling/electron-sandbox/profilingService.js";
import "../platform/telemetry/electron-sandbox/customEndpointTelemetryService.js";
import "../platform/remoteTunnel/electron-sandbox/remoteTunnelService.js";
import "./services/files/electron-sandbox/elevatedFileService.js";
import "./services/search/electron-sandbox/searchService.js";
import "./services/workingCopy/electron-sandbox/workingCopyHistoryService.js";
import "./services/userDataSync/browser/userDataSyncEnablementService.js";
import "./services/extensions/electron-sandbox/nativeExtensionService.js";
import "../platform/userDataProfile/electron-sandbox/userDataProfileStorageService.js";
import "./services/auxiliaryWindow/electron-sandbox/auxiliaryWindowService.js";
import "../platform/extensionManagement/electron-sandbox/extensionsProfileScannerService.js";
import { SyncDescriptor } from "../platform/instantiation/common/descriptors.js";
import { registerSingleton } from "../platform/instantiation/common/extensions.js";
import {
  IUserDataInitializationService,
  UserDataInitializationService
} from "./services/userData/browser/userDataInit.js";
registerSingleton(
  IUserDataInitializationService,
  new SyncDescriptor(UserDataInitializationService, [[]], true)
);
import "./contrib/logs/electron-sandbox/logs.contribution.js";
import "./contrib/localization/electron-sandbox/localization.contribution.js";
import "./contrib/files/electron-sandbox/fileActions.contribution.js";
import "./contrib/codeEditor/electron-sandbox/codeEditor.contribution.js";
import "./contrib/debug/electron-sandbox/extensionHostDebugService.js";
import "./contrib/extensions/electron-sandbox/extensions.contribution.js";
import "./contrib/issue/electron-sandbox/issue.contribution.js";
import "./contrib/issue/electron-sandbox/process.contribution.js";
import "./contrib/remote/electron-sandbox/remote.contribution.js";
import "./contrib/configExporter/electron-sandbox/configurationExportHelper.contribution.js";
import "./contrib/terminal/electron-sandbox/terminal.contribution.js";
import "./contrib/themes/browser/themes.test.contribution.js";
import "./services/themes/electron-sandbox/themes.contribution.js";
import "./contrib/userDataSync/electron-sandbox/userDataSync.contribution.js";
import "./contrib/tags/electron-sandbox/workspaceTagsService.js";
import "./contrib/tags/electron-sandbox/tags.contribution.js";
import "./contrib/performance/electron-sandbox/performance.contribution.js";
import "./contrib/tasks/electron-sandbox/taskService.js";
import "./contrib/externalTerminal/electron-sandbox/externalTerminal.contribution.js";
import "./contrib/webview/electron-sandbox/webview.contribution.js";
import "./contrib/splash/electron-sandbox/splash.contribution.js";
import "./contrib/localHistory/electron-sandbox/localHistory.contribution.js";
import "./contrib/mergeEditor/electron-sandbox/mergeEditor.contribution.js";
import "./contrib/multiDiffEditor/browser/multiDiffEditor.contribution.js";
import "./contrib/remoteTunnel/electron-sandbox/remoteTunnel.contribution.js";
import "./contrib/chat/electron-sandbox/chat.contribution.js";
import "./contrib/inlineChat/electron-sandbox/inlineChat.contribution.js";
import "./contrib/encryption/electron-sandbox/encryption.contribution.js";
import "./contrib/emergencyAlert/electron-sandbox/emergencyAlert.contribution.js";
import { main } from "./electron-sandbox/desktop.main.js";
export {
  main
};
//# sourceMappingURL=workbench.desktop.main.js.map
