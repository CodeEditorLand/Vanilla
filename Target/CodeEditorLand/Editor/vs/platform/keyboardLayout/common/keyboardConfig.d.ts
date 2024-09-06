import { IConfigurationService } from "vs/platform/configuration/common/configuration";
export declare const enum DispatchConfig {
    Code = 0,
    KeyCode = 1
}
export interface IKeyboardConfig {
    dispatch: DispatchConfig;
    mapAltGrToCtrlAlt: boolean;
}
export declare function readKeyboardConfig(configurationService: IConfigurationService): IKeyboardConfig;
