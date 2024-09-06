import { ICommandService } from "vs/platform/commands/common/commands";
import { EnvironmentVariableScope, IMergedEnvironmentVariableCollection, IMergedEnvironmentVariableCollectionDiff } from "vs/platform/terminal/common/environmentVariable";
import { ITerminalService } from "vs/workbench/contrib/terminal/browser/terminal";
import { IEnvironmentVariableInfo } from "vs/workbench/contrib/terminal/common/environmentVariable";
import { ITerminalStatus } from "vs/workbench/contrib/terminal/common/terminal";
import { IExtensionService } from "vs/workbench/services/extensions/common/extensions";
export declare class EnvironmentVariableInfoStale implements IEnvironmentVariableInfo {
    private readonly _diff;
    private readonly _terminalId;
    private readonly _collection;
    private readonly _terminalService;
    private readonly _extensionService;
    readonly requiresAction = true;
    constructor(_diff: IMergedEnvironmentVariableCollectionDiff, _terminalId: number, _collection: IMergedEnvironmentVariableCollection, _terminalService: ITerminalService, _extensionService: IExtensionService);
    private _getInfo;
    private _getActions;
    getStatus(scope: EnvironmentVariableScope | undefined): ITerminalStatus;
}
export declare class EnvironmentVariableInfoChangesActive implements IEnvironmentVariableInfo {
    private readonly _collection;
    private readonly _commandService;
    private readonly _extensionService;
    readonly requiresAction = false;
    constructor(_collection: IMergedEnvironmentVariableCollection, _commandService: ICommandService, _extensionService: IExtensionService);
    private _getInfo;
    private _getActions;
    getStatus(scope: EnvironmentVariableScope | undefined): ITerminalStatus;
}
