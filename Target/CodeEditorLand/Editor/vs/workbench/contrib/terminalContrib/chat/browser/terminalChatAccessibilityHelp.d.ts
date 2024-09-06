import { IAccessibleViewImplentation } from "vs/platform/accessibility/browser/accessibleViewRegistry";
import { ServicesAccessor } from "vs/platform/instantiation/common/instantiation";
export declare class TerminalChatAccessibilityHelp implements IAccessibleViewImplentation {
    readonly priority = 110;
    readonly name = "terminalChat";
    readonly when: any;
    readonly type: any;
    getProvider(accessor: ServicesAccessor): any;
}
export declare function getAccessibilityHelpText(accessor: ServicesAccessor): string;
