import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { ITerminalLogService } from "vs/platform/terminal/common/terminal";
import { IWorkspaceContextService } from "vs/platform/workspace/common/workspace";
import { ITerminalInstanceService } from "vs/workbench/contrib/terminal/browser/terminal";
import { BaseTerminalProfileResolverService } from "vs/workbench/contrib/terminal/browser/terminalProfileResolverService";
import { ITerminalProfileService } from "vs/workbench/contrib/terminal/common/terminal";
import { IConfigurationResolverService } from "vs/workbench/services/configurationResolver/common/configurationResolver";
import { IHistoryService } from "vs/workbench/services/history/common/history";
import { IRemoteAgentService } from "vs/workbench/services/remote/common/remoteAgentService";
export declare class ElectronTerminalProfileResolverService extends BaseTerminalProfileResolverService {
    constructor(configurationResolverService: IConfigurationResolverService, configurationService: IConfigurationService, historyService: IHistoryService, logService: ITerminalLogService, workspaceContextService: IWorkspaceContextService, terminalProfileService: ITerminalProfileService, remoteAgentService: IRemoteAgentService, terminalInstanceService: ITerminalInstanceService);
}
