import { ILogService } from "vs/platform/log/common/log";
import { ISignService } from "vs/platform/sign/common/sign";
import { IExtHostInitDataService } from "vs/workbench/api/common/extHostInitDataService";
import { IExtHostRpcService } from "vs/workbench/api/common/extHostRpcService";
import { ExtHostTunnelService } from "vs/workbench/api/common/extHostTunnelService";
import { CandidatePort } from "vs/workbench/services/remote/common/tunnelModel";
import * as vscode from "vscode";
export declare function getSockets(stdout: string): Record<string, {
    pid: number;
    socket: number;
}>;
export declare function loadListeningPorts(...stdouts: string[]): {
    socket: number;
    ip: string;
    port: number;
}[];
export declare function parseIpAddress(hex: string): string;
export declare function loadConnectionTable(stdout: string): Record<string, string>[];
export declare function getRootProcesses(stdout: string): {
    pid: number;
    cmd: string;
    ppid: number;
}[];
export declare function findPorts(connections: {
    socket: number;
    ip: string;
    port: number;
}[], socketMap: Record<string, {
    pid: number;
    socket: number;
}>, processes: {
    pid: number;
    cwd: string;
    cmd: string;
}[]): Promise<CandidatePort[]>;
export declare function tryFindRootPorts(connections: {
    socket: number;
    ip: string;
    port: number;
}[], rootProcessesStdout: string, previousPorts: Map<number, CandidatePort & {
    ppid: number;
}>): Map<number, CandidatePort & {
    ppid: number;
}>;
export declare class NodeExtHostTunnelService extends ExtHostTunnelService {
    private readonly initData;
    private readonly signService;
    private _initialCandidates;
    private _foundRootPorts;
    private _candidateFindingEnabled;
    constructor(extHostRpc: IExtHostRpcService, initData: IExtHostInitDataService, logService: ILogService, signService: ISignService);
    $registerCandidateFinder(enable: boolean): Promise<void>;
    private calculateDelay;
    private setInitialCandidates;
    private findCandidatePorts;
    protected makeManagedTunnelFactory(authority: vscode.ManagedResolvedAuthority): vscode.RemoteAuthorityResolver["tunnelFactory"];
}
