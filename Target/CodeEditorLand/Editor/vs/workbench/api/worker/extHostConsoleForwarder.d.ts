import { AbstractExtHostConsoleForwarder } from "vs/workbench/api/common/extHostConsoleForwarder";
import { IExtHostInitDataService } from "vs/workbench/api/common/extHostInitDataService";
import { IExtHostRpcService } from "vs/workbench/api/common/extHostRpcService";
export declare class ExtHostConsoleForwarder extends AbstractExtHostConsoleForwarder {
    constructor(extHostRpc: IExtHostRpcService, initData: IExtHostInitDataService);
    protected _nativeConsoleLogMessage(_method: unknown, original: (...args: any[]) => void, args: IArguments): void;
}
