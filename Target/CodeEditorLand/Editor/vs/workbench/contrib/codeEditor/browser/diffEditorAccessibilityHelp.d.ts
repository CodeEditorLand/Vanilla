import { AccessibleContentProvider, AccessibleViewType } from "../../../../platform/accessibility/browser/accessibleView.js";
import type { IAccessibleViewImplentation } from "../../../../platform/accessibility/browser/accessibleViewRegistry.js";
import type { ServicesAccessor } from "../../../../platform/instantiation/common/instantiation.js";
export declare class DiffEditorAccessibilityHelp implements IAccessibleViewImplentation {
    readonly priority = 105;
    readonly name = "diff-editor";
    readonly when: import("../../../../platform/contextkey/common/contextkey.js").ContextKeyExpression;
    readonly type = AccessibleViewType.Help;
    getProvider(accessor: ServicesAccessor): AccessibleContentProvider | undefined;
}
