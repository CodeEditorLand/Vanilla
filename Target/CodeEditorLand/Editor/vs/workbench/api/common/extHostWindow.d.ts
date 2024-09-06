import { Event } from "vs/base/common/event";
import { URI } from "vs/base/common/uri";
import { IExtHostRpcService } from "vs/workbench/api/common/extHostRpcService";
import { WindowState } from "vscode";
import { ExtHostWindowShape, IOpenUriOptions } from "./extHost.protocol";
export declare class ExtHostWindow implements ExtHostWindowShape {
    private static InitialState;
    private _proxy;
    private readonly _onDidChangeWindowState;
    readonly onDidChangeWindowState: Event<WindowState>;
    private _state;
    getState(): WindowState;
    constructor(extHostRpc: IExtHostRpcService);
    $onDidChangeWindowFocus(value: boolean): void;
    $onDidChangeWindowActive(value: boolean): void;
    onDidChangeWindowProperty(property: keyof WindowState, value: boolean): void;
    openUri(stringOrUri: string | URI, options: IOpenUriOptions): Promise<boolean>;
    asExternalUri(uri: URI, options: IOpenUriOptions): Promise<URI>;
}
export declare const IExtHostWindow: any;
export interface IExtHostWindow extends ExtHostWindow, ExtHostWindowShape {
}
