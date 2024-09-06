import { IAccessibleViewImplentation } from "vs/platform/accessibility/browser/accessibleViewRegistry";
import { ServicesAccessor } from "vs/platform/instantiation/common/instantiation";
export declare class NotificationAccessibleView implements IAccessibleViewImplentation {
    readonly priority = 90;
    readonly name = "notifications";
    readonly when: any;
    readonly type: any;
    getProvider(accessor: ServicesAccessor): any;
}
