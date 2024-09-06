import { UriComponents } from "vs/base/common/uri";
import { IExtensionDescription } from "vs/platform/extensions/common/extensions";
import { ILogService } from "vs/platform/log/common/log";
import { IExtHostApiDeprecationService } from "vs/workbench/api/common/extHostApiDeprecationService";
import { IExtHostConfiguration } from "vs/workbench/api/common/extHostConfiguration";
import { IExtHostDocumentsAndEditors } from "vs/workbench/api/common/extHostDocumentsAndEditors";
import { IExtHostInitDataService } from "vs/workbench/api/common/extHostInitDataService";
import { IExtHostRpcService } from "vs/workbench/api/common/extHostRpcService";
import { ExtHostTaskBase, HandlerData } from "vs/workbench/api/common/extHostTask";
import { IExtHostTerminalService } from "vs/workbench/api/common/extHostTerminalService";
import { IExtHostVariableResolverProvider } from "vs/workbench/api/common/extHostVariableResolverService";
import { IExtHostWorkspace } from "vs/workbench/api/common/extHostWorkspace";
import type * as vscode from "vscode";
import * as tasks from "../common/shared/tasks";
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
