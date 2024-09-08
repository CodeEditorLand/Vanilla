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
import { Action } from "../../../../base/common/actions.js";
import { VSBuffer } from "../../../../base/common/buffer.js";
import { Schemas } from "../../../../base/common/network.js";
import { joinPath } from "../../../../base/common/resources.js";
import { URI } from "../../../../base/common/uri.js";
import * as nls from "../../../../nls.js";
import { IClipboardService } from "../../../../platform/clipboard/common/clipboardService.js";
import {
  IContextKeyService,
  RawContextKey
} from "../../../../platform/contextkey/common/contextkey.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { IFileDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { IHoverService } from "../../../../platform/hover/browser/hover.js";
import {
  IInstantiationService,
  createDecorator
} from "../../../../platform/instantiation/common/instantiation.js";
import { ILabelService } from "../../../../platform/label/common/label.js";
import { INotificationService } from "../../../../platform/notification/common/notification.js";
import {
  Utils
} from "../../../../platform/profiling/common/profiling.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { IWorkbenchEnvironmentService } from "../../../services/environment/common/environmentService.js";
import { IExtensionFeaturesManagementService } from "../../../services/extensionManagement/common/extensionFeatures.js";
import {
  IExtensionService
} from "../../../services/extensions/common/extensions.js";
import {
  AbstractRuntimeExtensionsEditor
} from "../browser/abstractRuntimeExtensionsEditor.js";
import { IExtensionsWorkbenchService } from "../common/extensions.js";
import { ReportExtensionIssueAction } from "../common/reportExtensionIssueAction.js";
import { SlowExtensionAction } from "./extensionsSlowActions.js";
const IExtensionHostProfileService = createDecorator(
  "extensionHostProfileService"
);
const CONTEXT_PROFILE_SESSION_STATE = new RawContextKey(
  "profileSessionState",
  "none"
);
const CONTEXT_EXTENSION_HOST_PROFILE_RECORDED = new RawContextKey("extensionHostProfileRecorded", false);
var ProfileSessionState = /* @__PURE__ */ ((ProfileSessionState2) => {
  ProfileSessionState2[ProfileSessionState2["None"] = 0] = "None";
  ProfileSessionState2[ProfileSessionState2["Starting"] = 1] = "Starting";
  ProfileSessionState2[ProfileSessionState2["Running"] = 2] = "Running";
  ProfileSessionState2[ProfileSessionState2["Stopping"] = 3] = "Stopping";
  return ProfileSessionState2;
})(ProfileSessionState || {});
let RuntimeExtensionsEditor = class extends AbstractRuntimeExtensionsEditor {
  constructor(group, telemetryService, themeService, contextKeyService, extensionsWorkbenchService, extensionService, notificationService, contextMenuService, instantiationService, storageService, labelService, environmentService, clipboardService, _extensionHostProfileService, extensionFeaturesManagementService, hoverService) {
    super(group, telemetryService, themeService, contextKeyService, extensionsWorkbenchService, extensionService, notificationService, contextMenuService, instantiationService, storageService, labelService, environmentService, clipboardService, extensionFeaturesManagementService, hoverService);
    this._extensionHostProfileService = _extensionHostProfileService;
    this._profileInfo = this._extensionHostProfileService.lastProfile;
    this._extensionsHostRecorded = CONTEXT_EXTENSION_HOST_PROFILE_RECORDED.bindTo(contextKeyService);
    this._profileSessionState = CONTEXT_PROFILE_SESSION_STATE.bindTo(contextKeyService);
    this._register(this._extensionHostProfileService.onDidChangeLastProfile(() => {
      this._profileInfo = this._extensionHostProfileService.lastProfile;
      this._extensionsHostRecorded.set(!!this._profileInfo);
      this._updateExtensions();
    }));
    this._register(this._extensionHostProfileService.onDidChangeState(() => {
      const state = this._extensionHostProfileService.state;
      this._profileSessionState.set(ProfileSessionState[state].toLowerCase());
    }));
  }
  _profileInfo;
  _extensionsHostRecorded;
  _profileSessionState;
  _getProfileInfo() {
    return this._profileInfo;
  }
  _getUnresponsiveProfile(extensionId) {
    return this._extensionHostProfileService.getUnresponsiveProfile(
      extensionId
    );
  }
  _createSlowExtensionAction(element) {
    if (element.unresponsiveProfile) {
      return this._instantiationService.createInstance(
        SlowExtensionAction,
        element.description,
        element.unresponsiveProfile
      );
    }
    return null;
  }
  _createReportExtensionIssueAction(element) {
    if (element.marketplaceInfo) {
      return this._instantiationService.createInstance(
        ReportExtensionIssueAction,
        element.description
      );
    }
    return null;
  }
  _createSaveExtensionHostProfileAction() {
    return this._instantiationService.createInstance(
      SaveExtensionHostProfileAction,
      SaveExtensionHostProfileAction.ID,
      SaveExtensionHostProfileAction.LABEL
    );
  }
  _createProfileAction() {
    const state = this._extensionHostProfileService.state;
    const profileAction = state === 2 /* Running */ ? this._instantiationService.createInstance(
      StopExtensionHostProfileAction,
      StopExtensionHostProfileAction.ID,
      StopExtensionHostProfileAction.LABEL
    ) : this._instantiationService.createInstance(
      StartExtensionHostProfileAction,
      StartExtensionHostProfileAction.ID,
      StartExtensionHostProfileAction.LABEL
    );
    return profileAction;
  }
};
RuntimeExtensionsEditor = __decorateClass([
  __decorateParam(1, ITelemetryService),
  __decorateParam(2, IThemeService),
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, IExtensionsWorkbenchService),
  __decorateParam(5, IExtensionService),
  __decorateParam(6, INotificationService),
  __decorateParam(7, IContextMenuService),
  __decorateParam(8, IInstantiationService),
  __decorateParam(9, IStorageService),
  __decorateParam(10, ILabelService),
  __decorateParam(11, IWorkbenchEnvironmentService),
  __decorateParam(12, IClipboardService),
  __decorateParam(13, IExtensionHostProfileService),
  __decorateParam(14, IExtensionFeaturesManagementService),
  __decorateParam(15, IHoverService)
], RuntimeExtensionsEditor);
let StartExtensionHostProfileAction = class extends Action {
  constructor(id = StartExtensionHostProfileAction.ID, label = StartExtensionHostProfileAction.LABEL, _extensionHostProfileService) {
    super(id, label);
    this._extensionHostProfileService = _extensionHostProfileService;
  }
  static ID = "workbench.extensions.action.extensionHostProfile";
  static LABEL = nls.localize(
    "extensionHostProfileStart",
    "Start Extension Host Profile"
  );
  run() {
    this._extensionHostProfileService.startProfiling();
    return Promise.resolve();
  }
};
StartExtensionHostProfileAction = __decorateClass([
  __decorateParam(2, IExtensionHostProfileService)
], StartExtensionHostProfileAction);
let StopExtensionHostProfileAction = class extends Action {
  constructor(id = StartExtensionHostProfileAction.ID, label = StartExtensionHostProfileAction.LABEL, _extensionHostProfileService) {
    super(id, label);
    this._extensionHostProfileService = _extensionHostProfileService;
  }
  static ID = "workbench.extensions.action.stopExtensionHostProfile";
  static LABEL = nls.localize(
    "stopExtensionHostProfileStart",
    "Stop Extension Host Profile"
  );
  run() {
    this._extensionHostProfileService.stopProfiling();
    return Promise.resolve();
  }
};
StopExtensionHostProfileAction = __decorateClass([
  __decorateParam(2, IExtensionHostProfileService)
], StopExtensionHostProfileAction);
let SaveExtensionHostProfileAction = class extends Action {
  constructor(id = SaveExtensionHostProfileAction.ID, label = SaveExtensionHostProfileAction.LABEL, _environmentService, _extensionHostProfileService, _fileService, _fileDialogService) {
    super(id, label, void 0, false);
    this._environmentService = _environmentService;
    this._extensionHostProfileService = _extensionHostProfileService;
    this._fileService = _fileService;
    this._fileDialogService = _fileDialogService;
    this._extensionHostProfileService.onDidChangeLastProfile(() => {
      this.enabled = this._extensionHostProfileService.lastProfile !== null;
    });
  }
  static LABEL = nls.localize(
    "saveExtensionHostProfile",
    "Save Extension Host Profile"
  );
  static ID = "workbench.extensions.action.saveExtensionHostProfile";
  run() {
    return Promise.resolve(this._asyncRun());
  }
  async _asyncRun() {
    const picked = await this._fileDialogService.showSaveDialog({
      title: nls.localize(
        "saveprofile.dialogTitle",
        "Save Extension Host Profile"
      ),
      availableFileSystems: [Schemas.file],
      defaultUri: joinPath(
        await this._fileDialogService.defaultFilePath(),
        `CPU-${(/* @__PURE__ */ new Date()).toISOString().replace(/[\-:]/g, "")}.cpuprofile`
      ),
      filters: [
        {
          name: "CPU Profiles",
          extensions: ["cpuprofile", "txt"]
        }
      ]
    });
    if (!picked) {
      return;
    }
    const profileInfo = this._extensionHostProfileService.lastProfile;
    let dataToWrite = profileInfo ? profileInfo.data : {};
    let savePath = picked.fsPath;
    if (this._environmentService.isBuilt) {
      dataToWrite = Utils.rewriteAbsolutePaths(
        dataToWrite,
        "piiRemoved"
      );
      savePath = savePath + ".txt";
    }
    return this._fileService.writeFile(
      URI.file(savePath),
      VSBuffer.fromString(
        JSON.stringify(profileInfo ? profileInfo.data : {}, null, "	")
      )
    );
  }
};
SaveExtensionHostProfileAction = __decorateClass([
  __decorateParam(2, IWorkbenchEnvironmentService),
  __decorateParam(3, IExtensionHostProfileService),
  __decorateParam(4, IFileService),
  __decorateParam(5, IFileDialogService)
], SaveExtensionHostProfileAction);
export {
  CONTEXT_EXTENSION_HOST_PROFILE_RECORDED,
  CONTEXT_PROFILE_SESSION_STATE,
  IExtensionHostProfileService,
  ProfileSessionState,
  RuntimeExtensionsEditor,
  SaveExtensionHostProfileAction,
  StartExtensionHostProfileAction,
  StopExtensionHostProfileAction
};
