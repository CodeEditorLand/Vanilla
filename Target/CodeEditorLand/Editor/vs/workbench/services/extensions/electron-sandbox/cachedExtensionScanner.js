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
import { timeout } from "../../../../base/common/async.js";
import { getErrorMessage } from "../../../../base/common/errors.js";
import * as platform from "../../../../base/common/platform.js";
import Severity from "../../../../base/common/severity.js";
import { localize } from "../../../../nls.js";
import {
  IExtensionsScannerService,
  toExtensionDescription as toExtensionDescriptionFromScannedExtension
} from "../../../../platform/extensionManagement/common/extensionsScannerService.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { INotificationService } from "../../../../platform/notification/common/notification.js";
import { IWorkbenchEnvironmentService } from "../../environment/common/environmentService.js";
import { IWorkbenchExtensionManagementService } from "../../extensionManagement/common/extensionManagement.js";
import { IHostService } from "../../host/browser/host.js";
import { IUserDataProfileService } from "../../userDataProfile/common/userDataProfile.js";
import { toExtensionDescription } from "../common/extensions.js";
import { dedupExtensions } from "../common/extensionsUtil.js";
let CachedExtensionScanner = class {
  constructor(_notificationService, _hostService, _extensionsScannerService, _userDataProfileService, _extensionManagementService, _environmentService, _logService) {
    this._notificationService = _notificationService;
    this._hostService = _hostService;
    this._extensionsScannerService = _extensionsScannerService;
    this._userDataProfileService = _userDataProfileService;
    this._extensionManagementService = _extensionManagementService;
    this._environmentService = _environmentService;
    this._logService = _logService;
    this.scannedExtensions = new Promise(
      (resolve, reject) => {
        this._scannedExtensionsResolve = resolve;
        this._scannedExtensionsReject = reject;
      }
    );
  }
  scannedExtensions;
  _scannedExtensionsResolve;
  _scannedExtensionsReject;
  async startScanningExtensions() {
    try {
      const extensions = await this._scanInstalledExtensions();
      this._scannedExtensionsResolve(extensions);
    } catch (err) {
      this._scannedExtensionsReject(err);
    }
  }
  async _scanInstalledExtensions() {
    try {
      const language = platform.language;
      const result = await Promise.allSettled([
        this._extensionsScannerService.scanSystemExtensions({
          language,
          useCache: true,
          checkControlFile: true
        }),
        this._extensionsScannerService.scanUserExtensions({
          language,
          profileLocation: this._userDataProfileService.currentProfile.extensionsResource,
          useCache: true
        }),
        this._environmentService.remoteAuthority ? [] : this._extensionManagementService.getInstalledWorkspaceExtensions(
          false
        )
      ]);
      let scannedSystemExtensions = [], scannedUserExtensions = [], workspaceExtensions = [], scannedDevelopedExtensions = [], hasErrors = false;
      if (result[0].status === "fulfilled") {
        scannedSystemExtensions = result[0].value;
      } else {
        hasErrors = true;
        this._logService.error(
          `Error scanning system extensions:`,
          getErrorMessage(result[0].reason)
        );
      }
      if (result[1].status === "fulfilled") {
        scannedUserExtensions = result[1].value;
      } else {
        hasErrors = true;
        this._logService.error(
          `Error scanning user extensions:`,
          getErrorMessage(result[1].reason)
        );
      }
      if (result[2].status === "fulfilled") {
        workspaceExtensions = result[2].value;
      } else {
        hasErrors = true;
        this._logService.error(
          `Error scanning workspace extensions:`,
          getErrorMessage(result[2].reason)
        );
      }
      try {
        scannedDevelopedExtensions = await this._extensionsScannerService.scanExtensionsUnderDevelopment(
          { language },
          [...scannedSystemExtensions, ...scannedUserExtensions]
        );
      } catch (error) {
        this._logService.error(error);
      }
      const system = scannedSystemExtensions.map(
        (e) => toExtensionDescriptionFromScannedExtension(e, false)
      );
      const user = scannedUserExtensions.map(
        (e) => toExtensionDescriptionFromScannedExtension(e, false)
      );
      const workspace = workspaceExtensions.map(
        (e) => toExtensionDescription(e, false)
      );
      const development = scannedDevelopedExtensions.map(
        (e) => toExtensionDescriptionFromScannedExtension(e, true)
      );
      const r = dedupExtensions(
        system,
        user,
        workspace,
        development,
        this._logService
      );
      if (!hasErrors) {
        const disposable = this._extensionsScannerService.onDidChangeCache(() => {
          disposable.dispose();
          this._notificationService.prompt(
            Severity.Error,
            localize(
              "extensionCache.invalid",
              "Extensions have been modified on disk. Please reload the window."
            ),
            [
              {
                label: localize(
                  "reloadWindow",
                  "Reload Window"
                ),
                run: () => this._hostService.reload()
              }
            ]
          );
        });
        timeout(5e3).then(() => disposable.dispose());
      }
      return r;
    } catch (err) {
      this._logService.error(`Error scanning installed extensions:`);
      this._logService.error(err);
      return [];
    }
  }
};
CachedExtensionScanner = __decorateClass([
  __decorateParam(0, INotificationService),
  __decorateParam(1, IHostService),
  __decorateParam(2, IExtensionsScannerService),
  __decorateParam(3, IUserDataProfileService),
  __decorateParam(4, IWorkbenchExtensionManagementService),
  __decorateParam(5, IWorkbenchEnvironmentService),
  __decorateParam(6, ILogService)
], CachedExtensionScanner);
export {
  CachedExtensionScanner
};
