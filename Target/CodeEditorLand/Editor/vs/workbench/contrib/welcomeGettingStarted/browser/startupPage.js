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
import * as arrays from "../../../../base/common/arrays.js";
import { onUnexpectedError } from "../../../../base/common/errors.js";
import { joinPath } from "../../../../base/common/resources.js";
import { localize } from "../../../../nls.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { INotificationService } from "../../../../platform/notification/common/notification.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import {
  IStorageService,
  StorageScope,
  StorageTarget
} from "../../../../platform/storage/common/storage.js";
import { TelemetryLevel } from "../../../../platform/telemetry/common/telemetry.js";
import { getTelemetryLevel } from "../../../../platform/telemetry/common/telemetryUtils.js";
import {
  IWorkspaceContextService,
  UNKNOWN_EMPTY_WINDOW_WORKSPACE,
  WorkbenchState
} from "../../../../platform/workspace/common/workspace.js";
import {
  IEditorResolverService,
  RegisteredEditorPriority
} from "../../../services/editor/common/editorResolverService.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { IWorkbenchEnvironmentService } from "../../../services/environment/common/environmentService.js";
import { IWorkbenchLayoutService } from "../../../services/layout/browser/layoutService.js";
import {
  ILifecycleService,
  LifecyclePhase,
  StartupKind
} from "../../../services/lifecycle/common/lifecycle.js";
import { IWorkingCopyBackupService } from "../../../services/workingCopy/common/workingCopyBackup.js";
import { TerminalCommandId } from "../../terminal/common/terminal.js";
import {
  GettingStartedInput,
  gettingStartedInputTypeId
} from "./gettingStartedInput.js";
const restoreWalkthroughsConfigurationKey = "workbench.welcomePage.restorableWalkthroughs";
const configurationKey = "workbench.startupEditor";
const oldConfigurationKey = "workbench.welcome.enabled";
const telemetryOptOutStorageKey = "workbench.telemetryOptOutShown";
let StartupPageEditorResolverContribution = class {
  constructor(instantiationService, editorResolverService) {
    this.instantiationService = instantiationService;
    editorResolverService.registerEditor(
      `${GettingStartedInput.RESOURCE.scheme}:/**`,
      {
        id: GettingStartedInput.ID,
        label: localize("welcome.displayName", "Welcome Page"),
        priority: RegisteredEditorPriority.builtin
      },
      {
        singlePerResource: false,
        canSupportResource: (uri) => uri.scheme === GettingStartedInput.RESOURCE.scheme
      },
      {
        createEditorInput: ({ resource, options }) => {
          return {
            editor: this.instantiationService.createInstance(
              GettingStartedInput,
              options
            ),
            options: {
              ...options,
              pinned: false
            }
          };
        }
      }
    );
  }
  static ID = "workbench.contrib.startupPageEditorResolver";
};
StartupPageEditorResolverContribution = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IEditorResolverService)
], StartupPageEditorResolverContribution);
let StartupPageRunnerContribution = class {
  constructor(configurationService, editorService, workingCopyBackupService, fileService, contextService, lifecycleService, layoutService, productService, commandService, environmentService, storageService, logService, notificationService) {
    this.configurationService = configurationService;
    this.editorService = editorService;
    this.workingCopyBackupService = workingCopyBackupService;
    this.fileService = fileService;
    this.contextService = contextService;
    this.lifecycleService = lifecycleService;
    this.layoutService = layoutService;
    this.productService = productService;
    this.commandService = commandService;
    this.environmentService = environmentService;
    this.storageService = storageService;
    this.logService = logService;
    this.notificationService = notificationService;
    this.run().then(void 0, onUnexpectedError);
  }
  static ID = "workbench.contrib.startupPageRunner";
  async run() {
    await this.lifecycleService.when(LifecyclePhase.Restored);
    if (this.productService.enableTelemetry && this.productService.showTelemetryOptOut && getTelemetryLevel(this.configurationService) !== TelemetryLevel.NONE && !this.environmentService.skipWelcome && !this.storageService.get(
      telemetryOptOutStorageKey,
      StorageScope.PROFILE
    )) {
      this.storageService.store(
        telemetryOptOutStorageKey,
        true,
        StorageScope.PROFILE,
        StorageTarget.USER
      );
      await this.openGettingStarted(true);
      return;
    }
    if (this.tryOpenWalkthroughForFolder()) {
      return;
    }
    const enabled = isStartupPageEnabled(
      this.configurationService,
      this.contextService,
      this.environmentService
    );
    if (enabled && this.lifecycleService.startupKind !== StartupKind.ReloadedWindow) {
      const hasBackups = await this.workingCopyBackupService.hasBackups();
      if (hasBackups) {
        return;
      }
      if (!this.editorService.activeEditor || this.layoutService.openedDefaultEditors) {
        const startupEditorSetting = this.configurationService.inspect(configurationKey);
        const isStartupEditorReadme = startupEditorSetting.value === "readme";
        const isStartupEditorUserReadme = startupEditorSetting.userValue === "readme";
        const isStartupEditorDefaultReadme = startupEditorSetting.defaultValue === "readme";
        if (isStartupEditorReadme && (!isStartupEditorUserReadme || !isStartupEditorDefaultReadme)) {
          this.logService.warn(
            `Warning: 'workbench.startupEditor: readme' setting ignored due to being set somewhere other than user or default settings (user=${startupEditorSetting.userValue}, default=${startupEditorSetting.defaultValue})`
          );
        }
        const openWithReadme = isStartupEditorReadme && (isStartupEditorUserReadme || isStartupEditorDefaultReadme);
        if (openWithReadme) {
          await this.openReadme();
        } else if (startupEditorSetting.value === "welcomePage" || startupEditorSetting.value === "welcomePageInEmptyWorkbench") {
          await this.openGettingStarted();
        } else if (startupEditorSetting.value === "terminal") {
          this.commandService.executeCommand(
            TerminalCommandId.CreateTerminalEditor
          );
        }
      }
    }
  }
  tryOpenWalkthroughForFolder() {
    const toRestore = this.storageService.get(
      restoreWalkthroughsConfigurationKey,
      StorageScope.PROFILE
    );
    if (toRestore) {
      const restoreData = JSON.parse(toRestore);
      const currentWorkspace = this.contextService.getWorkspace();
      if (restoreData.folder === UNKNOWN_EMPTY_WINDOW_WORKSPACE.id || restoreData.folder === currentWorkspace.folders[0].uri.toString()) {
        const options = {
          selectedCategory: restoreData.category,
          selectedStep: restoreData.step,
          pinned: false
        };
        this.editorService.openEditor({
          resource: GettingStartedInput.RESOURCE,
          options
        });
        this.storageService.remove(
          restoreWalkthroughsConfigurationKey,
          StorageScope.PROFILE
        );
        return true;
      }
    } else {
      return false;
    }
    return false;
  }
  async openReadme() {
    const readmes = arrays.coalesce(
      await Promise.all(
        this.contextService.getWorkspace().folders.map(async (folder) => {
          const folderUri = folder.uri;
          const folderStat = await this.fileService.resolve(folderUri).catch(onUnexpectedError);
          const files = folderStat?.children ? folderStat.children.map((child) => child.name).sort() : [];
          const file = files.find(
            (file2) => file2.toLowerCase() === "readme.md"
          ) || files.find(
            (file2) => file2.toLowerCase().startsWith("readme")
          );
          if (file) {
            return joinPath(folderUri, file);
          } else {
            return void 0;
          }
        })
      )
    );
    if (!this.editorService.activeEditor) {
      if (readmes.length) {
        const isMarkDown = (readme) => readme.path.toLowerCase().endsWith(".md");
        await Promise.all([
          this.commandService.executeCommand(
            "markdown.showPreview",
            null,
            readmes.filter(isMarkDown),
            { locked: true }
          ).catch((error) => {
            this.notificationService.error(
              localize(
                "startupPage.markdownPreviewError",
                "Could not open markdown preview: {0}.\n\nPlease make sure the markdown extension is enabled.",
                error.message
              )
            );
          }),
          this.editorService.openEditors(
            readmes.filter((readme) => !isMarkDown(readme)).map((readme) => ({ resource: readme }))
          )
        ]);
      } else {
        await this.openGettingStarted();
      }
    }
  }
  async openGettingStarted(showTelemetryNotice) {
    const startupEditorTypeID = gettingStartedInputTypeId;
    const editor = this.editorService.activeEditor;
    if (editor?.typeId === startupEditorTypeID || this.editorService.editors.some(
      (e) => e.typeId === startupEditorTypeID
    )) {
      return;
    }
    const options = editor ? { pinned: false, index: 0, showTelemetryNotice } : { pinned: false, showTelemetryNotice };
    if (startupEditorTypeID === gettingStartedInputTypeId) {
      this.editorService.openEditor({
        resource: GettingStartedInput.RESOURCE,
        options
      });
    }
  }
};
StartupPageRunnerContribution = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, IEditorService),
  __decorateParam(2, IWorkingCopyBackupService),
  __decorateParam(3, IFileService),
  __decorateParam(4, IWorkspaceContextService),
  __decorateParam(5, ILifecycleService),
  __decorateParam(6, IWorkbenchLayoutService),
  __decorateParam(7, IProductService),
  __decorateParam(8, ICommandService),
  __decorateParam(9, IWorkbenchEnvironmentService),
  __decorateParam(10, IStorageService),
  __decorateParam(11, ILogService),
  __decorateParam(12, INotificationService)
], StartupPageRunnerContribution);
function isStartupPageEnabled(configurationService, contextService, environmentService) {
  if (environmentService.skipWelcome) {
    return false;
  }
  const startupEditor = configurationService.inspect(configurationKey);
  if (!startupEditor.userValue && !startupEditor.workspaceValue) {
    const welcomeEnabled = configurationService.inspect(oldConfigurationKey);
    if (welcomeEnabled.value !== void 0 && welcomeEnabled.value !== null) {
      return welcomeEnabled.value;
    }
  }
  return startupEditor.value === "welcomePage" || startupEditor.value === "readme" && (startupEditor.userValue === "readme" || startupEditor.defaultValue === "readme") || contextService.getWorkbenchState() === WorkbenchState.EMPTY && startupEditor.value === "welcomePageInEmptyWorkbench" || startupEditor.value === "terminal";
}
export {
  StartupPageEditorResolverContribution,
  StartupPageRunnerContribution,
  restoreWalkthroughsConfigurationKey
};
