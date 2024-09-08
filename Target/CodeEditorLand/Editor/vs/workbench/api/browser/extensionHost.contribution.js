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
import { IInstantiationService } from "../../../platform/instantiation/common/instantiation.js";
import {
  registerWorkbenchContribution2,
  WorkbenchPhase
} from "../../common/contributions.js";
import { LanguageConfigurationFileHandler } from "../../contrib/codeEditor/common/languageConfigurationExtensionPoint.js";
import { ColorExtensionPoint } from "../../services/themes/common/colorExtensionPoint.js";
import { IconExtensionPoint } from "../../services/themes/common/iconExtensionPoint.js";
import { TokenClassificationExtensionPoints } from "../../services/themes/common/tokenClassificationExtensionPoint.js";
import { JSONValidationExtensionPoint } from "../common/jsonValidationExtensionPoint.js";
import { StatusBarItemsExtensionPoint } from "./statusBarExtensionPoint.js";
import "./mainThreadLocalization.js";
import "./mainThreadBulkEdits.js";
import "./mainThreadLanguageModels.js";
import "./mainThreadChatAgents2.js";
import "./mainThreadChatVariables.js";
import "./mainThreadLanguageModelTools.js";
import "./mainThreadEmbeddings.js";
import "./mainThreadCodeInsets.js";
import "./mainThreadCLICommands.js";
import "./mainThreadClipboard.js";
import "./mainThreadCommands.js";
import "./mainThreadConfiguration.js";
import "./mainThreadConsole.js";
import "./mainThreadDebugService.js";
import "./mainThreadDecorations.js";
import "./mainThreadDiagnostics.js";
import "./mainThreadDialogs.js";
import "./mainThreadDocumentContentProviders.js";
import "./mainThreadDocuments.js";
import "./mainThreadDocumentsAndEditors.js";
import "./mainThreadEditor.js";
import "./mainThreadEditors.js";
import "./mainThreadEditorTabs.js";
import "./mainThreadErrors.js";
import "./mainThreadExtensionService.js";
import "./mainThreadFileSystem.js";
import "./mainThreadFileSystemEventService.js";
import "./mainThreadLanguageFeatures.js";
import "./mainThreadLanguages.js";
import "./mainThreadLogService.js";
import "./mainThreadMessageService.js";
import "./mainThreadManagedSockets.js";
import "./mainThreadOutputService.js";
import "./mainThreadProgress.js";
import "./mainThreadQuickDiff.js";
import "./mainThreadQuickOpen.js";
import "./mainThreadRemoteConnectionData.js";
import "./mainThreadSaveParticipant.js";
import "./mainThreadSpeech.js";
import "./mainThreadEditSessionIdentityParticipant.js";
import "./mainThreadSCM.js";
import "./mainThreadSearch.js";
import "./mainThreadStatusBar.js";
import "./mainThreadStorage.js";
import "./mainThreadTelemetry.js";
import "./mainThreadTerminalService.js";
import "./mainThreadTerminalShellIntegration.js";
import "./mainThreadTheming.js";
import "./mainThreadTreeViews.js";
import "./mainThreadDownloadService.js";
import "./mainThreadUrls.js";
import "./mainThreadUriOpeners.js";
import "./mainThreadWindow.js";
import "./mainThreadWebviewManager.js";
import "./mainThreadWorkspace.js";
import "./mainThreadComments.js";
import "./mainThreadNotebook.js";
import "./mainThreadNotebookKernels.js";
import "./mainThreadNotebookDocumentsAndEditors.js";
import "./mainThreadNotebookRenderers.js";
import "./mainThreadNotebookSaveParticipant.js";
import "./mainThreadInteractive.js";
import "./mainThreadTask.js";
import "./mainThreadLabelService.js";
import "./mainThreadTunnelService.js";
import "./mainThreadAuthentication.js";
import "./mainThreadTimeline.js";
import "./mainThreadTesting.js";
import "./mainThreadSecretState.js";
import "./mainThreadShare.js";
import "./mainThreadProfileContentHandlers.js";
import "./mainThreadAiRelatedInformation.js";
import "./mainThreadAiEmbeddingVector.js";
let ExtensionPoints = class {
  constructor(instantiationService) {
    this.instantiationService = instantiationService;
    this.instantiationService.createInstance(JSONValidationExtensionPoint);
    this.instantiationService.createInstance(ColorExtensionPoint);
    this.instantiationService.createInstance(IconExtensionPoint);
    this.instantiationService.createInstance(
      TokenClassificationExtensionPoints
    );
    this.instantiationService.createInstance(
      LanguageConfigurationFileHandler
    );
    this.instantiationService.createInstance(StatusBarItemsExtensionPoint);
  }
  static ID = "workbench.contrib.extensionPoints";
};
ExtensionPoints = __decorateClass([
  __decorateParam(0, IInstantiationService)
], ExtensionPoints);
registerWorkbenchContribution2(
  ExtensionPoints.ID,
  ExtensionPoints,
  WorkbenchPhase.BlockStartup
);
export {
  ExtensionPoints
};
