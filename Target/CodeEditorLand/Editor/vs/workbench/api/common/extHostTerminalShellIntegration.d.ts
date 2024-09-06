import { type Event } from "vs/base/common/event";
import { Disposable } from "vs/base/common/lifecycle";
import { type UriComponents } from "vs/base/common/uri";
import { type ExtHostTerminalShellIntegrationShape, type MainThreadTerminalShellIntegrationShape } from "vs/workbench/api/common/extHost.protocol";
import { IExtHostRpcService } from "vs/workbench/api/common/extHostRpcService";
import { IExtHostTerminalService } from "vs/workbench/api/common/extHostTerminalService";
import type * as vscode from "vscode";
import { TerminalShellExecutionCommandLineConfidence } from "./extHostTypes";
export interface IExtHostTerminalShellIntegration extends ExtHostTerminalShellIntegrationShape {
    readonly _serviceBrand: undefined;
    readonly onDidChangeTerminalShellIntegration: Event<vscode.TerminalShellIntegrationChangeEvent>;
    readonly onDidStartTerminalShellExecution: Event<vscode.TerminalShellExecutionStartEvent>;
    readonly onDidEndTerminalShellExecution: Event<vscode.TerminalShellExecutionEndEvent>;
}
export declare const IExtHostTerminalShellIntegration: any;
export declare class ExtHostTerminalShellIntegration extends Disposable implements IExtHostTerminalShellIntegration {
    private readonly _extHostTerminalService;
    readonly _serviceBrand: undefined;
    protected _proxy: MainThreadTerminalShellIntegrationShape;
    private _activeShellIntegrations;
    protected readonly _onDidChangeTerminalShellIntegration: any;
    readonly onDidChangeTerminalShellIntegration: any;
    protected readonly _onDidStartTerminalShellExecution: any;
    readonly onDidStartTerminalShellExecution: any;
    protected readonly _onDidEndTerminalShellExecution: any;
    readonly onDidEndTerminalShellExecution: any;
    constructor(extHostRpc: IExtHostRpcService, _extHostTerminalService: IExtHostTerminalService);
    $shellIntegrationChange(instanceId: number): void;
    $shellExecutionStart(instanceId: number, commandLineValue: string, commandLineConfidence: TerminalShellExecutionCommandLineConfidence, isTrusted: boolean, cwd: UriComponents | undefined): void;
    $shellExecutionEnd(instanceId: number, commandLineValue: string, commandLineConfidence: TerminalShellExecutionCommandLineConfidence, isTrusted: boolean, exitCode: number | undefined): void;
    $shellExecutionData(instanceId: number, data: string): void;
    $cwdChange(instanceId: number, cwd: UriComponents | undefined): void;
    $closeTerminal(instanceId: number): void;
}
