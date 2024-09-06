import type { IStringDictionary } from "vs/base/common/collections";
import type { IConfigurationPropertySchema } from "vs/platform/configuration/common/configurationRegistry";
export declare const enum TerminalCommandGuideSettingId {
    ShowCommandGuide = "terminal.integrated.shellIntegration.showCommandGuide"
}
export declare const terminalCommandGuideConfigSection = "terminal.integrated.shellIntegration";
export interface ITerminalCommandGuideConfiguration {
    showCommandGuide: boolean;
}
export declare const terminalCommandGuideConfiguration: IStringDictionary<IConfigurationPropertySchema>;
