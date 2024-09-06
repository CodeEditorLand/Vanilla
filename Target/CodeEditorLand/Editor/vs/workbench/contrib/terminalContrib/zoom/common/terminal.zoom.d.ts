import type { IStringDictionary } from "vs/base/common/collections";
import type { IConfigurationPropertySchema } from "vs/platform/configuration/common/configurationRegistry";
export declare const enum TerminalZoomCommandId {
    FontZoomIn = "workbench.action.terminal.fontZoomIn",
    FontZoomOut = "workbench.action.terminal.fontZoomOut",
    FontZoomReset = "workbench.action.terminal.fontZoomReset"
}
export declare const enum TerminalZoomSettingId {
    MouseWheelZoom = "terminal.integrated.mouseWheelZoom"
}
export declare const terminalZoomConfiguration: IStringDictionary<IConfigurationPropertySchema>;
