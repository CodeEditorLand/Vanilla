import { Disposable } from "vs/base/common/lifecycle";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { ILogService } from "vs/platform/log/common/log";
import { INotificationService } from "vs/platform/notification/common/notification";
import { IOpenerService } from "vs/platform/opener/common/opener";
import { IStorageService } from "vs/platform/storage/common/storage";
import { ITunnelService } from "vs/platform/tunnel/common/tunnel";
import { IWorkbenchContribution } from "vs/workbench/common/contributions";
import { IDebugService } from "vs/workbench/contrib/debug/common/debug";
import { IExternalUriOpenerService } from "vs/workbench/contrib/externalUriOpener/common/externalUriOpenerService";
import { ITerminalService } from "vs/workbench/contrib/terminal/browser/terminal";
import { IActivityService } from "vs/workbench/services/activity/common/activity";
import { IWorkbenchConfigurationService } from "vs/workbench/services/configuration/common/configuration";
import { IWorkbenchEnvironmentService } from "vs/workbench/services/environment/common/environmentService";
import { IHostService } from "vs/workbench/services/host/browser/host";
import { IPreferencesService } from "vs/workbench/services/preferences/common/preferences";
import { IRemoteAgentService } from "vs/workbench/services/remote/common/remoteAgentService";
import { IRemoteExplorerService } from "vs/workbench/services/remote/common/remoteExplorerService";
import { IStatusbarService } from "vs/workbench/services/statusbar/browser/statusbar";
export declare const VIEWLET_ID = "workbench.view.remote";
export declare class ForwardedPortsView extends Disposable implements IWorkbenchContribution {
    private readonly contextKeyService;
    private readonly environmentService;
    private readonly remoteExplorerService;
    private readonly tunnelService;
    private readonly activityService;
    private readonly statusbarService;
    private readonly contextKeyListener;
    private readonly activityBadge;
    private entryAccessor;
    constructor(contextKeyService: IContextKeyService, environmentService: IWorkbenchEnvironmentService, remoteExplorerService: IRemoteExplorerService, tunnelService: ITunnelService, activityService: IActivityService, statusbarService: IStatusbarService);
    private getViewContainer;
    private enableForwardedPortsView;
    private enableBadgeAndStatusBar;
    private updateActivityBadge;
    private updateStatusBar;
    private get entry();
}
export declare class PortRestore implements IWorkbenchContribution {
    private readonly remoteExplorerService;
    private readonly logService;
    constructor(remoteExplorerService: IRemoteExplorerService, logService: ILogService);
    private restore;
}
export declare class AutomaticPortForwarding extends Disposable implements IWorkbenchContribution {
    private readonly terminalService;
    private readonly notificationService;
    private readonly openerService;
    private readonly externalOpenerService;
    private readonly remoteExplorerService;
    private readonly contextKeyService;
    private readonly configurationService;
    private readonly debugService;
    private readonly tunnelService;
    private readonly hostService;
    private readonly logService;
    private readonly storageService;
    private readonly preferencesService;
    private procForwarder;
    private outputForwarder;
    private portListener;
    constructor(terminalService: ITerminalService, notificationService: INotificationService, openerService: IOpenerService, externalOpenerService: IExternalUriOpenerService, remoteExplorerService: IRemoteExplorerService, environmentService: IWorkbenchEnvironmentService, contextKeyService: IContextKeyService, configurationService: IWorkbenchConfigurationService, debugService: IDebugService, remoteAgentService: IRemoteAgentService, tunnelService: ITunnelService, hostService: IHostService, logService: ILogService, storageService: IStorageService, preferencesService: IPreferencesService);
    private getPortAutoFallbackNumber;
    private listenForPorts;
    private setup;
}
