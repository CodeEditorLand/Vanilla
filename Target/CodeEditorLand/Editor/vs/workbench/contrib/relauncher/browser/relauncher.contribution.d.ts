import { Disposable } from "vs/base/common/lifecycle";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IDialogService } from "vs/platform/dialogs/common/dialogs";
import { IProductService } from "vs/platform/product/common/productService";
import { IWorkspaceContextService } from "vs/platform/workspace/common/workspace";
import { IWorkbenchContribution } from "vs/workbench/common/contributions";
import { IWorkbenchEnvironmentService } from "vs/workbench/services/environment/common/environmentService";
import { IExtensionService } from "vs/workbench/services/extensions/common/extensions";
import { IHostService } from "vs/workbench/services/host/browser/host";
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
