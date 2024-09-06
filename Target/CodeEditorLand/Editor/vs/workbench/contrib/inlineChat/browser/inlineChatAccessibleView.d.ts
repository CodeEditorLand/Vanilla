import { IAccessibleViewImplentation } from "vs/platform/accessibility/browser/accessibleViewRegistry";
import { ServicesAccessor } from "vs/platform/instantiation/common/instantiation";
export declare class InlineChatAccessibleView implements IAccessibleViewImplentation {
    readonly priority = 100;
    readonly name = "inlineChat";
    readonly when: any;
    readonly type: any;
    getProvider(accessor: ServicesAccessor): any;
}
