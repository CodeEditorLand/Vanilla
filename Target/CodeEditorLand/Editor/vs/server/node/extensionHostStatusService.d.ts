import { IExtensionHostExitInfo } from "vs/workbench/services/remote/common/remoteAgentService";
export declare const IExtensionHostStatusService: any;
export interface IExtensionHostStatusService {
    readonly _serviceBrand: undefined;
    setExitInfo(reconnectionToken: string, info: IExtensionHostExitInfo): void;
    getExitInfo(reconnectionToken: string): IExtensionHostExitInfo | null;
}
export declare class ExtensionHostStatusService implements IExtensionHostStatusService {
    _serviceBrand: undefined;
    private readonly _exitInfo;
    setExitInfo(reconnectionToken: string, info: IExtensionHostExitInfo): void;
    getExitInfo(reconnectionToken: string): IExtensionHostExitInfo | null;
}
