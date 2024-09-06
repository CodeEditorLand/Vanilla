import { IAccessibleViewImplentation } from "vs/platform/accessibility/browser/accessibleViewRegistry";
import { ServicesAccessor } from "vs/platform/instantiation/common/instantiation";
export declare class DiffEditorAccessibilityHelp implements IAccessibleViewImplentation {
    readonly priority = 105;
    readonly name = "diff-editor";
    readonly when: any;
    readonly type: any;
    getProvider(accessor: ServicesAccessor): any;
}
