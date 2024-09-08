import { AccessibleViewType, type AccessibleContentProvider, type ExtensionContentProvider } from "../../../../platform/accessibility/browser/accessibleView.js";
import type { IAccessibleViewImplentation } from "../../../../platform/accessibility/browser/accessibleViewRegistry.js";
import type { ContextKeyExpression } from "../../../../platform/contextkey/common/contextkey.js";
import type { ServicesAccessor } from "../../../../platform/instantiation/common/instantiation.js";
export declare class GettingStartedAccessibleView implements IAccessibleViewImplentation {
    readonly type = AccessibleViewType.View;
    readonly priority = 110;
    readonly name = "walkthroughs";
    readonly when?: ContextKeyExpression | undefined;
    getProvider: (accessor: ServicesAccessor) => AccessibleContentProvider | ExtensionContentProvider | undefined;
}
