import { Disposable } from "vs/base/common/lifecycle";
import { IProcessEnvironment, OperatingSystem } from "vs/base/common/platform";
import { ThemeIcon } from "vs/base/common/themables";
import { URI } from "vs/base/common/uri";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IShellLaunchConfig, ITerminalLogService, ITerminalProfile, TerminalIcon } from "vs/platform/terminal/common/terminal";
import { IWorkspaceContextService } from "vs/platform/workspace/common/workspace";
import { ITerminalInstanceService } from "vs/workbench/contrib/terminal/browser/terminal";
import { IShellLaunchConfigResolveOptions, ITerminalProfileResolverService, ITerminalProfileService } from "vs/workbench/contrib/terminal/common/terminal";
import { IConfigurationResolverService } from "vs/workbench/services/configurationResolver/common/configurationResolver";
import { IHistoryService } from "vs/workbench/services/history/common/history";
import { IRemoteAgentService } from "vs/workbench/services/remote/common/remoteAgentService";
export interface IProfileContextProvider {
    getDefaultSystemShell(remoteAuthority: string | undefined, os: OperatingSystem): Promise<string>;
    getEnvironment(remoteAuthority: string | undefined): Promise<IProcessEnvironment>;
}
export declare abstract class BaseTerminalProfileResolverService extends Disposable implements ITerminalProfileResolverService {
    private readonly _context;
    private readonly _configurationService;
    private readonly _configurationResolverService;
    private readonly _historyService;
    private readonly _logService;
    private readonly _terminalProfileService;
    private readonly _workspaceContextService;
    private readonly _remoteAgentService;
    _serviceBrand: undefined;
    private _primaryBackendOs;
    private readonly _iconRegistry;
    private _defaultProfileName;
    get defaultProfileName(): string | undefined;
    constructor(_context: IProfileContextProvider, _configurationService: IConfigurationService, _configurationResolverService: IConfigurationResolverService, _historyService: IHistoryService, _logService: ITerminalLogService, _terminalProfileService: ITerminalProfileService, _workspaceContextService: IWorkspaceContextService, _remoteAgentService: IRemoteAgentService);
    private _refreshDefaultProfileName;
    resolveIcon(shellLaunchConfig: IShellLaunchConfig, os: OperatingSystem): void;
    getDefaultIcon(resource?: URI): TerminalIcon & ThemeIcon;
    resolveShellLaunchConfig(shellLaunchConfig: IShellLaunchConfig, options: IShellLaunchConfigResolveOptions): Promise<void>;
    getDefaultShell(options: IShellLaunchConfigResolveOptions): Promise<string>;
    getDefaultShellArgs(options: IShellLaunchConfigResolveOptions): Promise<string | string[]>;
    getDefaultProfile(options: IShellLaunchConfigResolveOptions): Promise<ITerminalProfile>;
    getEnvironment(remoteAuthority: string | undefined): Promise<IProcessEnvironment>;
    private _getCustomIcon;
    private _getUnresolvedDefaultProfile;
    private _setIconForAutomation;
    private _getUnresolvedRealDefaultProfile;
    private _getUnresolvedFallbackDefaultProfile;
    private _getUnresolvedAutomationShellProfile;
    private _resolveProfile;
    private _resolveVariables;
    private _getOsKey;
    private _guessProfileIcon;
    private _isValidAutomationProfile;
}
export declare class BrowserTerminalProfileResolverService extends BaseTerminalProfileResolverService {
    constructor(configurationResolverService: IConfigurationResolverService, configurationService: IConfigurationService, historyService: IHistoryService, logService: ITerminalLogService, terminalInstanceService: ITerminalInstanceService, terminalProfileService: ITerminalProfileService, workspaceContextService: IWorkspaceContextService, remoteAgentService: IRemoteAgentService);
}
