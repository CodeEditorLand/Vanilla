import { type IAction } from "../../../../base/common/actions.js";
import { type IMenu } from "../../../../platform/actions/common/actions.js";
import { type IExtensionTerminalProfile, type ITerminalProfile } from "../../../../platform/terminal/common/terminal.js";
import type { ITerminalLocationOptions, ITerminalService } from "./terminal.js";
export declare enum TerminalMenuBarGroup {
    Create = "1_create",
    Run = "3_run",
    Manage = "5_manage",
    Configure = "7_configure"
}
export declare function setupTerminalMenus(): void;
export declare function getTerminalActionBarArgs(location: ITerminalLocationOptions, profiles: ITerminalProfile[], defaultProfileName: string, contributedProfiles: readonly IExtensionTerminalProfile[], terminalService: ITerminalService, dropdownMenu: IMenu): {
    dropdownAction: IAction;
    dropdownMenuActions: IAction[];
    className: string;
    dropdownIcon?: string;
};
