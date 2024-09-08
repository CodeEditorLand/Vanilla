import type * as vscode from "vscode";
import { type UriComponents } from "../../../base/common/uri.js";
import type { IExtensionDescription } from "../../../platform/extensions/common/extensions.js";
import { ILogService } from "../../../platform/log/common/log.js";
import { IExtHostApiDeprecationService } from "../common/extHostApiDeprecationService.js";
import { IExtHostConfiguration } from "../common/extHostConfiguration.js";
import { IExtHostDocumentsAndEditors } from "../common/extHostDocumentsAndEditors.js";
import { IExtHostInitDataService } from "../common/extHostInitDataService.js";
import { IExtHostRpcService } from "../common/extHostRpcService.js";
import { ExtHostTaskBase, type HandlerData } from "../common/extHostTask.js";
import { IExtHostTerminalService } from "../common/extHostTerminalService.js";
import { IExtHostVariableResolverProvider } from "../common/extHostVariableResolverService.js";
import { IExtHostWorkspace } from "../common/extHostWorkspace.js";
import type * as tasks from "../common/shared/tasks.js";
export declare class ExtHostTask extends ExtHostTaskBase {
    private readonly workspaceService;
    private readonly variableResolver;
    constructor(extHostRpc: IExtHostRpcService, initData: IExtHostInitDataService, workspaceService: IExtHostWorkspace, editorService: IExtHostDocumentsAndEditors, configurationService: IExtHostConfiguration, extHostTerminalService: IExtHostTerminalService, logService: ILogService, deprecationService: IExtHostApiDeprecationService, variableResolver: IExtHostVariableResolverProvider);
    executeTask(extension: IExtensionDescription, task: vscode.Task): Promise<vscode.TaskExecution>;
    protected provideTasksInternal(validTypes: {
        [key: string]: boolean;
    }, taskIdPromises: Promise<void>[], handler: HandlerData, value: vscode.Task[] | null | undefined): {
        tasks: tasks.ITaskDTO[];
        extension: IExtensionDescription;
    };
    protected resolveTaskInternal(resolvedTaskDTO: tasks.ITaskDTO): Promise<tasks.ITaskDTO | undefined>;
    private getAFolder;
    $resolveVariables(uriComponents: UriComponents, toResolve: {
        process?: {
            name: string;
            cwd?: string;
            path?: string;
        };
        variables: string[];
    }): Promise<{
        process?: string;
        variables: {
            [key: string]: string;
        };
    }>;
    $jsonTasksSupported(): Promise<boolean>;
    $findExecutable(command: string, cwd?: string, paths?: string[]): Promise<string>;
}
