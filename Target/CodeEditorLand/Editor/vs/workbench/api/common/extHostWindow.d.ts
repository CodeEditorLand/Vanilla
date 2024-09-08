import type { WindowState } from "vscode";
import { type Event } from "../../../base/common/event.js";
import { URI } from "../../../base/common/uri.js";
import { type ExtHostWindowShape, type IOpenUriOptions } from "./extHost.protocol.js";
import { IExtHostRpcService } from "./extHostRpcService.js";
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
export declare const IExtHostWindow: import("../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IExtHostWindow>;
export interface IExtHostWindow extends ExtHostWindow, ExtHostWindowShape {
}
