import { IStringDictionary } from "vs/base/common/collections";
import { IConfigurationPropertySchema } from "vs/platform/configuration/common/configurationRegistry";
export declare const enum TerminalInitialHintSettingId {
    Enabled = "terminal.integrated.initialHint"
}
export declare const terminalInitialHintConfiguration: IStringDictionary<IConfigurationPropertySchema>;
