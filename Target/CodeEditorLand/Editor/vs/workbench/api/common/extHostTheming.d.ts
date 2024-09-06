import { Event } from "vs/base/common/event";
import { ExtHostThemingShape } from "vs/workbench/api/common/extHost.protocol";
import { IExtHostRpcService } from "vs/workbench/api/common/extHostRpcService";
import { ColorTheme } from "./extHostTypes";
export declare class ExtHostTheming implements ExtHostThemingShape {
    readonly _serviceBrand: undefined;
    private _actual;
    private _onDidChangeActiveColorTheme;
    constructor(_extHostRpc: IExtHostRpcService);
    get activeColorTheme(): ColorTheme;
    $onColorThemeChange(type: string): void;
    get onDidChangeActiveColorTheme(): Event<ColorTheme>;
}
