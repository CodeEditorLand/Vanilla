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
import { Registry } from "../../../../platform/registry/common/platform.js";
import { Extensions as WorkbenchExtensions, IWorkbenchContributionsRegistry, IWorkbenchContribution } from "../../../common/contributions.js";
import { LifecyclePhase, ILifecycleService, StartupKind } from "../../../services/lifecycle/common/lifecycle.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { IWorkspaceContextService, WorkbenchState } from "../../../../platform/workspace/common/workspace.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { IWorkbenchThemeService } from "../../../services/themes/common/workbenchThemeService.js";
import { IWorkbenchEnvironmentService } from "../../../services/environment/common/environmentService.js";
import { language } from "../../../../base/common/platform.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import ErrorTelemetry from "../../../../platform/telemetry/browser/errorTelemetry.js";
import { TelemetryTrustedValue } from "../../../../platform/telemetry/common/telemetryUtils.js";
import { ConfigurationTarget, ConfigurationTargetToString, IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { ITextFileService, ITextFileSaveEvent, ITextFileResolveEvent } from "../../../services/textfile/common/textfiles.js";
import { extname, basename, isEqual, isEqualOrParent } from "../../../../base/common/resources.js";
import { URI } from "../../../../base/common/uri.js";
import { Event } from "../../../../base/common/event.js";
import { Schemas } from "../../../../base/common/network.js";
import { getMimeTypes } from "../../../../editor/common/services/languagesAssociations.js";
import { hash } from "../../../../base/common/hash.js";
import { IPaneCompositePartService } from "../../../services/panecomposite/browser/panecomposite.js";
import { ViewContainerLocation } from "../../../common/views.js";
import { IUserDataProfileService } from "../../../services/userDataProfile/common/userDataProfile.js";
import { mainWindow } from "../../../../base/browser/window.js";
import { IConfigurationRegistry, Extensions as ConfigurationExtensions } from "../../../../platform/configuration/common/configurationRegistry.js";
import { isBoolean, isNumber, isString } from "../../../../base/common/types.js";
import { LayoutSettings } from "../../../services/layout/browser/layoutService.js";
import { AutoRestartConfigurationKey, AutoUpdateConfigurationKey } from "../../extensions/common/extensions.js";
import { KEYWORD_ACTIVIATION_SETTING_ID } from "../../chat/common/chatService.js";
import { IUserDataProfilesService } from "../../../../platform/userDataProfile/common/userDataProfile.js";
let TelemetryContribution = class extends Disposable {
  constructor(telemetryService, contextService, lifecycleService, editorService, keybindingsService, themeService, environmentService, userDataProfileService, paneCompositeService, textFileService) {
    super();
    this.telemetryService = telemetryService;
    this.contextService = contextService;
    this.userDataProfileService = userDataProfileService;
    const { filesToOpenOrCreate, filesToDiff, filesToMerge } = environmentService;
    const activeViewlet = paneCompositeService.getActivePaneComposite(ViewContainerLocation.Sidebar);
    telemetryService.publicLog2("workspaceLoad", {
      windowSize: { innerHeight: mainWindow.innerHeight, innerWidth: mainWindow.innerWidth, outerHeight: mainWindow.outerHeight, outerWidth: mainWindow.outerWidth },
      emptyWorkbench: contextService.getWorkbenchState() === WorkbenchState.EMPTY,
      "workbench.filesToOpenOrCreate": filesToOpenOrCreate && filesToOpenOrCreate.length || 0,
      "workbench.filesToDiff": filesToDiff && filesToDiff.length || 0,
      "workbench.filesToMerge": filesToMerge && filesToMerge.length || 0,
      customKeybindingsCount: keybindingsService.customKeybindingsCount(),
      theme: themeService.getColorTheme().id,
      language,
      pinnedViewlets: paneCompositeService.getPinnedPaneCompositeIds(ViewContainerLocation.Sidebar),
      restoredViewlet: activeViewlet ? activeViewlet.getId() : void 0,
      restoredEditors: editorService.visibleEditors.length,
      startupKind: lifecycleService.startupKind
    });
    this._register(new ErrorTelemetry(telemetryService));
    this._register(textFileService.files.onDidResolve((e) => this.onTextFileModelResolved(e)));
    this._register(textFileService.files.onDidSave((e) => this.onTextFileModelSaved(e)));
    this._register(lifecycleService.onDidShutdown(() => this.dispose()));
  }
  static {
    __name(this, "TelemetryContribution");
  }
  static ALLOWLIST_JSON = ["package.json", "package-lock.json", "tsconfig.json", "jsconfig.json", "bower.json", ".eslintrc.json", "tslint.json", "composer.json"];
  static ALLOWLIST_WORKSPACE_JSON = ["settings.json", "extensions.json", "tasks.json", "launch.json"];
  onTextFileModelResolved(e) {
    const settingsType = this.getTypeIfSettings(e.model.resource);
    if (settingsType) {
      this.telemetryService.publicLog2("settingsRead", { settingsType });
    } else {
      this.telemetryService.publicLog2("fileGet", this.getTelemetryData(e.model.resource, e.reason));
    }
  }
  onTextFileModelSaved(e) {
    const settingsType = this.getTypeIfSettings(e.model.resource);
    if (settingsType) {
      this.telemetryService.publicLog2("settingsWritten", { settingsType });
    } else {
      this.telemetryService.publicLog2("filePUT", this.getTelemetryData(e.model.resource, e.reason));
    }
  }
  getTypeIfSettings(resource) {
    if (extname(resource) !== ".json") {
      return "";
    }
    if (isEqual(resource, this.userDataProfileService.currentProfile.settingsResource)) {
      return "global-settings";
    }
    if (isEqual(resource, this.userDataProfileService.currentProfile.keybindingsResource)) {
      return "keybindings";
    }
    if (isEqualOrParent(resource, this.userDataProfileService.currentProfile.snippetsHome)) {
      return "snippets";
    }
    const folders = this.contextService.getWorkspace().folders;
    for (const folder of folders) {
      if (isEqualOrParent(resource, folder.toResource(".vscode"))) {
        const filename = basename(resource);
        if (TelemetryContribution.ALLOWLIST_WORKSPACE_JSON.indexOf(filename) > -1) {
          return `.vscode/${filename}`;
        }
      }
    }
    return "";
  }
  getTelemetryData(resource, reason) {
    let ext = extname(resource);
    const queryStringLocation = ext.indexOf("?");
    ext = queryStringLocation !== -1 ? ext.substr(0, queryStringLocation) : ext;
    const fileName = basename(resource);
    const path = resource.scheme === Schemas.file ? resource.fsPath : resource.path;
    const telemetryData = {
      mimeType: new TelemetryTrustedValue(getMimeTypes(resource).join(", ")),
      ext,
      path: hash(path),
      reason,
      allowlistedjson: void 0
    };
    if (ext === ".json" && TelemetryContribution.ALLOWLIST_JSON.indexOf(fileName) > -1) {
      telemetryData["allowlistedjson"] = fileName;
    }
    return telemetryData;
  }
};
TelemetryContribution = __decorateClass([
  __decorateParam(0, ITelemetryService),
  __decorateParam(1, IWorkspaceContextService),
  __decorateParam(2, ILifecycleService),
  __decorateParam(3, IEditorService),
  __decorateParam(4, IKeybindingService),
  __decorateParam(5, IWorkbenchThemeService),
  __decorateParam(6, IWorkbenchEnvironmentService),
  __decorateParam(7, IUserDataProfileService),
  __decorateParam(8, IPaneCompositePartService),
  __decorateParam(9, ITextFileService)
], TelemetryContribution);
let ConfigurationTelemetryContribution = class extends Disposable {
  constructor(configurationService, userDataProfilesService, telemetryService) {
    super();
    this.configurationService = configurationService;
    this.userDataProfilesService = userDataProfilesService;
    this.telemetryService = telemetryService;
    const debouncedConfigService = Event.debounce(configurationService.onDidChangeConfiguration, (last, cur) => {
      const newAffectedKeys = last ? /* @__PURE__ */ new Set([...last.affectedKeys, ...cur.affectedKeys]) : cur.affectedKeys;
      return { ...cur, affectedKeys: newAffectedKeys };
    }, 1e3, true);
    this._register(debouncedConfigService((event) => {
      if (event.source !== ConfigurationTarget.DEFAULT) {
        telemetryService.publicLog2("updateConfiguration", {
          configurationSource: ConfigurationTargetToString(event.source),
          configurationKeys: Array.from(event.affectedKeys)
        });
      }
    }));
    const { user, workspace } = configurationService.keys();
    for (const setting of user) {
      this.reportTelemetry(setting, ConfigurationTarget.USER_LOCAL);
    }
    for (const setting of workspace) {
      this.reportTelemetry(setting, ConfigurationTarget.WORKSPACE);
    }
  }
  static {
    __name(this, "ConfigurationTelemetryContribution");
  }
  configurationRegistry = Registry.as(ConfigurationExtensions.Configuration);
  /**
   * Report value of a setting only if it is an enum, boolean, or number or an array of those.
   */
  getValueToReport(key, target) {
    const inpsectData = this.configurationService.inspect(key);
    const value = target === ConfigurationTarget.USER_LOCAL ? inpsectData.user?.value : inpsectData.workspace?.value;
    if (isNumber(value) || isBoolean(value)) {
      return value.toString();
    }
    const schema = this.configurationRegistry.getConfigurationProperties()[key];
    if (isString(value)) {
      if (schema?.enum?.includes(value)) {
        return value;
      }
      return void 0;
    }
    if (Array.isArray(value)) {
      if (value.every((v) => isNumber(v) || isBoolean(v) || isString(v) && schema?.enum?.includes(v))) {
        return JSON.stringify(value);
      }
    }
    return void 0;
  }
  reportTelemetry(key, target) {
    const source = ConfigurationTargetToString(target);
    switch (key) {
      case LayoutSettings.ACTIVITY_BAR_LOCATION:
        this.telemetryService.publicLog2("workbench.activityBar.location", { settingValue: this.getValueToReport(key, target), source });
        return;
      case AutoUpdateConfigurationKey:
        this.telemetryService.publicLog2("extensions.autoUpdate", { settingValue: this.getValueToReport(key, target), source });
        return;
      case "files.autoSave":
        this.telemetryService.publicLog2("files.autoSave", { settingValue: this.getValueToReport(key, target), source });
        return;
      case "editor.stickyScroll.enabled":
        this.telemetryService.publicLog2("editor.stickyScroll.enabled", { settingValue: this.getValueToReport(key, target), source });
        return;
      case KEYWORD_ACTIVIATION_SETTING_ID:
        this.telemetryService.publicLog2("accessibility.voice.keywordActivation", { settingValue: this.getValueToReport(key, target), source });
        return;
      case "window.zoomLevel":
        this.telemetryService.publicLog2("window.zoomLevel", { settingValue: this.getValueToReport(key, target), source });
        return;
      case "window.zoomPerWindow":
        this.telemetryService.publicLog2("window.zoomPerWindow", { settingValue: this.getValueToReport(key, target), source });
        return;
      case "window.titleBarStyle":
        this.telemetryService.publicLog2("window.titleBarStyle", { settingValue: this.getValueToReport(key, target), source });
        return;
      case "window.customTitleBarVisibility":
        this.telemetryService.publicLog2("window.customTitleBarVisibility", { settingValue: this.getValueToReport(key, target), source });
        return;
      case "window.nativeTabs":
        this.telemetryService.publicLog2("window.nativeTabs", { settingValue: this.getValueToReport(key, target), source });
        return;
      case "extensions.verifySignature":
        this.telemetryService.publicLog2("extensions.verifySignature", { settingValue: this.getValueToReport(key, target), source });
        return;
      case "window.systemColorTheme":
        this.telemetryService.publicLog2("window.systemColorTheme", { settingValue: this.getValueToReport(key, target), source });
        return;
      case "window.newWindowProfile": {
        const valueToReport = this.getValueToReport(key, target);
        const settingValue = valueToReport === null ? "null" : valueToReport === this.userDataProfilesService.defaultProfile.name ? "default" : "custom";
        this.telemetryService.publicLog2("window.newWindowProfile", { settingValue, source });
        return;
      }
      case AutoRestartConfigurationKey:
        this.telemetryService.publicLog2("extensions.autoRestart", { settingValue: this.getValueToReport(key, target), source });
        return;
    }
  }
};
ConfigurationTelemetryContribution = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, IUserDataProfilesService),
  __decorateParam(2, ITelemetryService)
], ConfigurationTelemetryContribution);
const workbenchContributionRegistry = Registry.as(WorkbenchExtensions.Workbench);
workbenchContributionRegistry.registerWorkbenchContribution(TelemetryContribution, LifecyclePhase.Restored);
workbenchContributionRegistry.registerWorkbenchContribution(ConfigurationTelemetryContribution, LifecyclePhase.Eventually);
export {
  TelemetryContribution
};
//# sourceMappingURL=telemetry.contribution.js.map
