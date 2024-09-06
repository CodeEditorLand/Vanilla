import type { IStringDictionary } from "vs/base/common/collections";
import type { IConfigurationPropertySchema } from "vs/platform/configuration/common/configurationRegistry";
export declare const enum TerminalAccessibilitySettingId {
    AccessibleViewPreserveCursorPosition = "terminal.integrated.accessibleViewPreserveCursorPosition",
    AccessibleViewFocusOnCommandExecution = "terminal.integrated.accessibleViewFocusOnCommandExecution"
}
export interface ITerminalAccessibilityConfiguration {
    accessibleViewPreserveCursorPosition: boolean;
    accessibleViewFocusOnCommandExecution: number;
}
export declare const terminalAccessibilityConfiguration: IStringDictionary<IConfigurationPropertySchema>;
