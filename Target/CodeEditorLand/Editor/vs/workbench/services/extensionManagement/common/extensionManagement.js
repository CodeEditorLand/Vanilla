import { Event } from "../../../../base/common/event.js";
import { createDecorator, refineServiceDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { IExtension, ExtensionType, IExtensionManifest, IExtensionIdentifier } from "../../../../platform/extensions/common/extensions.js";
import { IExtensionManagementService, IGalleryExtension, ILocalExtension, InstallOptions, InstallExtensionEvent, DidUninstallExtensionEvent, InstallExtensionResult, Metadata, UninstallExtensionEvent } from "../../../../platform/extensionManagement/common/extensionManagement.js";
import { URI } from "../../../../base/common/uri.js";
import { FileAccess } from "../../../../base/common/network.js";
import { localize } from "../../../../nls.js";
const IProfileAwareExtensionManagementService = refineServiceDecorator(IExtensionManagementService);
var ExtensionInstallLocation = /* @__PURE__ */ ((ExtensionInstallLocation2) => {
  ExtensionInstallLocation2[ExtensionInstallLocation2["Local"] = 1] = "Local";
  ExtensionInstallLocation2[ExtensionInstallLocation2["Remote"] = 2] = "Remote";
  ExtensionInstallLocation2[ExtensionInstallLocation2["Web"] = 3] = "Web";
  return ExtensionInstallLocation2;
})(ExtensionInstallLocation || {});
const IExtensionManagementServerService = createDecorator("extensionManagementServerService");
const DefaultIconPath = FileAccess.asBrowserUri("vs/workbench/services/extensionManagement/common/media/defaultIcon.png").toString(true);
const IWorkbenchExtensionManagementService = refineServiceDecorator(IProfileAwareExtensionManagementService);
const extensionsConfigurationNodeBase = {
  id: "extensions",
  order: 30,
  title: localize("extensionsConfigurationTitle", "Extensions"),
  type: "object"
};
var EnablementState = /* @__PURE__ */ ((EnablementState2) => {
  EnablementState2[EnablementState2["DisabledByTrustRequirement"] = 0] = "DisabledByTrustRequirement";
  EnablementState2[EnablementState2["DisabledByExtensionKind"] = 1] = "DisabledByExtensionKind";
  EnablementState2[EnablementState2["DisabledByEnvironment"] = 2] = "DisabledByEnvironment";
  EnablementState2[EnablementState2["EnabledByEnvironment"] = 3] = "EnabledByEnvironment";
  EnablementState2[EnablementState2["DisabledByVirtualWorkspace"] = 4] = "DisabledByVirtualWorkspace";
  EnablementState2[EnablementState2["DisabledByInvalidExtension"] = 5] = "DisabledByInvalidExtension";
  EnablementState2[EnablementState2["DisabledByExtensionDependency"] = 6] = "DisabledByExtensionDependency";
  EnablementState2[EnablementState2["DisabledGlobally"] = 7] = "DisabledGlobally";
  EnablementState2[EnablementState2["DisabledWorkspace"] = 8] = "DisabledWorkspace";
  EnablementState2[EnablementState2["EnabledGlobally"] = 9] = "EnabledGlobally";
  EnablementState2[EnablementState2["EnabledWorkspace"] = 10] = "EnabledWorkspace";
  return EnablementState2;
})(EnablementState || {});
const IWorkbenchExtensionEnablementService = createDecorator("extensionEnablementService");
const IWebExtensionsScannerService = createDecorator("IWebExtensionsScannerService");
export {
  DefaultIconPath,
  EnablementState,
  ExtensionInstallLocation,
  IExtensionManagementServerService,
  IProfileAwareExtensionManagementService,
  IWebExtensionsScannerService,
  IWorkbenchExtensionEnablementService,
  IWorkbenchExtensionManagementService,
  extensionsConfigurationNodeBase
};
//# sourceMappingURL=extensionManagement.js.map
