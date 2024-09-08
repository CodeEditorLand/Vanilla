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
import { RunOnceScheduler } from "../../../../base/common/async.js";
import {
  Disposable,
  dispose,
  toDisposable
} from "../../../../base/common/lifecycle.js";
import {
  isLinux,
  isMacintosh,
  isNative
} from "../../../../base/common/platform.js";
import { isEqual } from "../../../../base/common/resources.js";
import { localize } from "../../../../nls.js";
import {
  ConfigurationTarget,
  IConfigurationService
} from "../../../../platform/configuration/common/configuration.js";
import { IDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import {
  TitleBarSetting,
  TitlebarStyle
} from "../../../../platform/window/common/window.js";
import {
  IWorkspaceContextService,
  WorkbenchState
} from "../../../../platform/workspace/common/workspace.js";
import {
  Extensions as WorkbenchExtensions
} from "../../../common/contributions.js";
import { IWorkbenchEnvironmentService } from "../../../services/environment/common/environmentService.js";
import { IExtensionService } from "../../../services/extensions/common/extensions.js";
import { IHostService } from "../../../services/host/browser/host.js";
import { LifecyclePhase } from "../../../services/lifecycle/common/lifecycle.js";
let SettingsChangeRelauncher = class extends Disposable {
  constructor(hostService, configurationService, productService, dialogService) {
    super();
    this.hostService = hostService;
    this.configurationService = configurationService;
    this.productService = productService;
    this.dialogService = dialogService;
    this.onConfigurationChange(void 0);
    this._register(
      this.configurationService.onDidChangeConfiguration(
        (e) => this.onConfigurationChange(e)
      )
    );
  }
  static SETTINGS = [
    TitleBarSetting.TITLE_BAR_STYLE,
    "window.nativeTabs",
    "window.nativeFullScreen",
    "window.clickThroughInactive",
    "window.experimentalControlOverlay",
    "update.mode",
    "editor.accessibilitySupport",
    "security.workspace.trust.enabled",
    "workbench.enableExperiments",
    "_extensionsGallery.enablePPE",
    "security.restrictUNCAccess",
    "accessibility.verbosity.debug"
  ];
  titleBarStyle = new ChangeObserver(
    "string"
  );
  nativeTabs = new ChangeObserver("boolean");
  nativeFullScreen = new ChangeObserver("boolean");
  clickThroughInactive = new ChangeObserver("boolean");
  linuxWindowControlOverlay = new ChangeObserver("boolean");
  updateMode = new ChangeObserver("string");
  accessibilitySupport;
  workspaceTrustEnabled = new ChangeObserver("boolean");
  experimentsEnabled = new ChangeObserver("boolean");
  enablePPEExtensionsGallery = new ChangeObserver("boolean");
  restrictUNCAccess = new ChangeObserver("boolean");
  accessibilityVerbosityDebug = new ChangeObserver(
    "boolean"
  );
  onConfigurationChange(e) {
    if (e && !SettingsChangeRelauncher.SETTINGS.some(
      (key) => e.affectsConfiguration(key)
    )) {
      return;
    }
    let changed = false;
    function processChanged(didChange) {
      changed = changed || didChange;
    }
    const config = this.configurationService.getValue();
    if (isNative) {
      processChanged(
        (config.window.titleBarStyle === TitlebarStyle.NATIVE || config.window.titleBarStyle === TitlebarStyle.CUSTOM) && this.titleBarStyle.handleChange(
          config.window?.titleBarStyle
        )
      );
      processChanged(
        isMacintosh && this.nativeTabs.handleChange(config.window?.nativeTabs)
      );
      processChanged(
        isMacintosh && this.nativeFullScreen.handleChange(
          config.window?.nativeFullScreen
        )
      );
      processChanged(
        isMacintosh && this.clickThroughInactive.handleChange(
          config.window?.clickThroughInactive
        )
      );
      processChanged(
        isLinux && this.linuxWindowControlOverlay.handleChange(
          config.window?.experimentalControlOverlay
        )
      );
      processChanged(this.updateMode.handleChange(config.update?.mode));
      if (isLinux && typeof config.editor?.accessibilitySupport === "string" && config.editor.accessibilitySupport !== this.accessibilitySupport) {
        this.accessibilitySupport = config.editor.accessibilitySupport;
        if (this.accessibilitySupport === "on") {
          changed = true;
        }
      }
      processChanged(
        this.workspaceTrustEnabled.handleChange(
          config?.security?.workspace?.trust?.enabled
        )
      );
      processChanged(
        this.restrictUNCAccess.handleChange(
          config?.security?.restrictUNCAccess
        )
      );
      processChanged(
        this.accessibilityVerbosityDebug.handleChange(
          config?.accessibility?.verbosity?.debug
        )
      );
    }
    processChanged(
      this.experimentsEnabled.handleChange(
        config.workbench?.enableExperiments
      )
    );
    processChanged(
      this.productService.quality !== "stable" && this.enablePPEExtensionsGallery.handleChange(
        config._extensionsGallery?.enablePPE
      )
    );
    if (changed && e && e.source !== ConfigurationTarget.DEFAULT) {
      this.doConfirm(
        isNative ? localize(
          "relaunchSettingMessage",
          "A setting has changed that requires a restart to take effect."
        ) : localize(
          "relaunchSettingMessageWeb",
          "A setting has changed that requires a reload to take effect."
        ),
        isNative ? localize(
          "relaunchSettingDetail",
          "Press the restart button to restart {0} and enable the setting.",
          this.productService.nameLong
        ) : localize(
          "relaunchSettingDetailWeb",
          "Press the reload button to reload {0} and enable the setting.",
          this.productService.nameLong
        ),
        isNative ? localize(
          {
            key: "restart",
            comment: ["&& denotes a mnemonic"]
          },
          "&&Restart"
        ) : localize(
          {
            key: "restartWeb",
            comment: ["&& denotes a mnemonic"]
          },
          "&&Reload"
        ),
        () => this.hostService.restart()
      );
    }
  }
  async doConfirm(message, detail, primaryButton, confirmedFn) {
    if (this.hostService.hasFocus) {
      const { confirmed } = await this.dialogService.confirm({
        message,
        detail,
        primaryButton
      });
      if (confirmed) {
        confirmedFn();
      }
    }
  }
};
SettingsChangeRelauncher = __decorateClass([
  __decorateParam(0, IHostService),
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IProductService),
  __decorateParam(3, IDialogService)
], SettingsChangeRelauncher);
class ChangeObserver {
  constructor(typeName) {
    this.typeName = typeName;
  }
  static create(typeName) {
    return new ChangeObserver(typeName);
  }
  lastValue = void 0;
  /**
   * Returns if there was a change compared to the last value
   */
  handleChange(value) {
    if (typeof value === this.typeName && value !== this.lastValue) {
      this.lastValue = value;
      return true;
    }
    return false;
  }
}
let WorkspaceChangeExtHostRelauncher = class extends Disposable {
  constructor(contextService, extensionService, hostService, environmentService) {
    super();
    this.contextService = contextService;
    this.extensionHostRestarter = this._register(
      new RunOnceScheduler(async () => {
        if (!!environmentService.extensionTestsLocationURI) {
          return;
        }
        if (environmentService.remoteAuthority) {
          hostService.reload();
        } else if (isNative) {
          const stopped = await extensionService.stopExtensionHosts(
            localize(
              "restartExtensionHost.reason",
              "Restarting extension host due to a workspace folder change."
            )
          );
          if (stopped) {
            extensionService.startExtensionHosts();
          }
        }
      }, 10)
    );
    this.contextService.getCompleteWorkspace().then((workspace) => {
      this.firstFolderResource = workspace.folders.length > 0 ? workspace.folders[0].uri : void 0;
      this.handleWorkbenchState();
      this._register(
        this.contextService.onDidChangeWorkbenchState(
          () => setTimeout(() => this.handleWorkbenchState())
        )
      );
    });
    this._register(
      toDisposable(() => {
        this.onDidChangeWorkspaceFoldersUnbind?.dispose();
      })
    );
  }
  firstFolderResource;
  extensionHostRestarter;
  onDidChangeWorkspaceFoldersUnbind;
  handleWorkbenchState() {
    if (this.contextService.getWorkbenchState() === WorkbenchState.WORKSPACE) {
      const workspace = this.contextService.getWorkspace();
      this.firstFolderResource = workspace.folders.length > 0 ? workspace.folders[0].uri : void 0;
      if (!this.onDidChangeWorkspaceFoldersUnbind) {
        this.onDidChangeWorkspaceFoldersUnbind = this.contextService.onDidChangeWorkspaceFolders(
          () => this.onDidChangeWorkspaceFolders()
        );
      }
    } else {
      dispose(this.onDidChangeWorkspaceFoldersUnbind);
      this.onDidChangeWorkspaceFoldersUnbind = void 0;
    }
  }
  onDidChangeWorkspaceFolders() {
    const workspace = this.contextService.getWorkspace();
    const newFirstFolderResource = workspace.folders.length > 0 ? workspace.folders[0].uri : void 0;
    if (!isEqual(this.firstFolderResource, newFirstFolderResource)) {
      this.firstFolderResource = newFirstFolderResource;
      this.extensionHostRestarter.schedule();
    }
  }
};
WorkspaceChangeExtHostRelauncher = __decorateClass([
  __decorateParam(0, IWorkspaceContextService),
  __decorateParam(1, IExtensionService),
  __decorateParam(2, IHostService),
  __decorateParam(3, IWorkbenchEnvironmentService)
], WorkspaceChangeExtHostRelauncher);
const workbenchRegistry = Registry.as(
  WorkbenchExtensions.Workbench
);
workbenchRegistry.registerWorkbenchContribution(
  SettingsChangeRelauncher,
  LifecyclePhase.Restored
);
workbenchRegistry.registerWorkbenchContribution(
  WorkspaceChangeExtHostRelauncher,
  LifecyclePhase.Restored
);
export {
  SettingsChangeRelauncher,
  WorkspaceChangeExtHostRelauncher
};
