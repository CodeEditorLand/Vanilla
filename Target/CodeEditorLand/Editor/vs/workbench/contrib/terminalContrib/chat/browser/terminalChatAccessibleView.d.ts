import { IAccessibleViewImplentation } from "vs/platform/accessibility/browser/accessibleViewRegistry";
import { ServicesAccessor } from "vs/platform/instantiation/common/instantiation";
export declare class TerminalInlineChatAccessibleView implements IAccessibleViewImplentation {
    readonly priority = 105;
    readonly name = "terminalInlineChat";
    readonly type: any;
    readonly when: any;
    getProvider(accessor: ServicesAccessor): any;
}
