import type { IStringDictionary } from "vs/base/common/collections";
import type { IConfigurationPropertySchema } from "vs/platform/configuration/common/configurationRegistry";
export declare const enum TerminalStickyScrollSettingId {
    Enabled = "terminal.integrated.stickyScroll.enabled",
    MaxLineCount = "terminal.integrated.stickyScroll.maxLineCount"
}
export interface ITerminalStickyScrollConfiguration {
    enabled: boolean;
    maxLineCount: number;
}
export declare const terminalStickyScrollConfiguration: IStringDictionary<IConfigurationPropertySchema>;
