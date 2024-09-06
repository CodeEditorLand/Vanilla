import { Disposable } from "../../../../base/common/lifecycle.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import { IWorkbenchContribution } from "../../../common/contributions.js";
import { IWorkbenchEnvironmentService } from "../../../services/environment/common/environmentService.js";
import { IExtensionService } from "../../../services/extensions/common/extensions.js";
import { IHostService } from "../../../services/host/browser/host.js";
export declare class SettingsChangeRelauncher extends Disposable implements IWorkbenchContribution {
    private readonly hostService;
    private readonly configurationService;
    private readonly productService;
    private readonly dialogService;
    private static SETTINGS;
    private readonly titleBarStyle;
    private readonly nativeTabs;
    private readonly nativeFullScreen;
    private readonly clickThroughInactive;
    private readonly linuxWindowControlOverlay;
    private readonly updateMode;
    private accessibilitySupport;
    private readonly workspaceTrustEnabled;
    private readonly experimentsEnabled;
    private readonly enablePPEExtensionsGallery;
    private readonly restrictUNCAccess;
    private readonly accessibilityVerbosityDebug;
    constructor(hostService: IHostService, configurationService: IConfigurationService, productService: IProductService, dialogService: IDialogService);
    private onConfigurationChange;
    private doConfirm;
}
export declare class WorkspaceChangeExtHostRelauncher extends Disposable implements IWorkbenchContribution {
    private readonly contextService;
    private firstFolderResource?;
    private extensionHostRestarter;
    private onDidChangeWorkspaceFoldersUnbind;
    constructor(contextService: IWorkspaceContextService, extensionService: IExtensionService, hostService: IHostService, environmentService: IWorkbenchEnvironmentService);
    private handleWorkbenchState;
    private onDidChangeWorkspaceFolders;
}
