import { Disposable } from "vs/base/common/lifecycle";
import { ICommandService } from "vs/platform/commands/common/commands";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IDialogService } from "vs/platform/dialogs/common/dialogs";
import { INativeEnvironmentService } from "vs/platform/environment/common/environment";
import { ILoggerService } from "vs/platform/log/common/log";
import { INotificationService } from "vs/platform/notification/common/notification";
import { IProductService } from "vs/platform/product/common/productService";
import { IProgressService } from "vs/platform/progress/common/progress";
import { IQuickInputService } from "vs/platform/quickinput/common/quickInput";
import { IRemoteTunnelService } from "vs/platform/remoteTunnel/common/remoteTunnel";
import { IStorageService } from "vs/platform/storage/common/storage";
import { IWorkspaceContextService } from "vs/platform/workspace/common/workspace";
import { IWorkbenchContribution } from "vs/workbench/common/contributions";
import { IAuthenticationService } from "vs/workbench/services/authentication/common/authentication";
import { IExtensionService } from "vs/workbench/services/extensions/common/extensions";
export declare const REMOTE_TUNNEL_CATEGORY: any;
export declare const REMOTE_TUNNEL_CONNECTION_STATE_KEY = "remoteTunnelConnection";
export declare const REMOTE_TUNNEL_CONNECTION_STATE: any;
export declare class RemoteTunnelWorkbenchContribution extends Disposable implements IWorkbenchContribution {
    private readonly authenticationService;
    private readonly dialogService;
    private readonly extensionService;
    private readonly contextKeyService;
    private readonly storageService;
    private readonly quickInputService;
    private environmentService;
    private remoteTunnelService;
    private commandService;
    private workspaceContextService;
    private progressService;
    private notificationService;
    private readonly connectionStateContext;
    private readonly serverConfiguration;
    private connectionInfo;
    private readonly logger;
    private expiredSessions;
    constructor(authenticationService: IAuthenticationService, dialogService: IDialogService, extensionService: IExtensionService, contextKeyService: IContextKeyService, productService: IProductService, storageService: IStorageService, loggerService: ILoggerService, quickInputService: IQuickInputService, environmentService: INativeEnvironmentService, remoteTunnelService: IRemoteTunnelService, commandService: ICommandService, workspaceContextService: IWorkspaceContextService, progressService: IProgressService, notificationService: INotificationService);
    private handleTunnelStatusUpdate;
    private recommendRemoteExtensionIfNeeded;
    private initialize;
    private getPreferredTokenFromSession;
    private startTunnel;
    private getAuthenticationSession;
    private createExistingSessionItem;
    private createQuickpickItems;
    /**
     * Returns all authentication sessions available from {@link getAuthenticationProviders}.
     */
    private getAllSessions;
    private getSessionToken;
    /**
     * Returns all authentication providers which can be used to authenticate
     * to the remote storage service, based on product.json configuration
     * and registered authentication providers.
     */
    private getAuthenticationProviders;
    private registerCommands;
    private getLinkToOpen;
    private showManageOptions;
}
