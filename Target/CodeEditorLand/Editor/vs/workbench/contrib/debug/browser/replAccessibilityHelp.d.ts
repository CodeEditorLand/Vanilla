import { Disposable } from "../../../../base/common/lifecycle.js";
import type { ServicesAccessor } from "../../../../editor/browser/editorExtensions.js";
import { AccessibleViewProviderId, AccessibleViewType, type IAccessibleViewContentProvider } from "../../../../platform/accessibility/browser/accessibleView.js";
import type { IAccessibleViewImplentation } from "../../../../platform/accessibility/browser/accessibleViewRegistry.js";
import { AccessibilityVerbositySettingId } from "../../accessibility/browser/accessibilityConfiguration.js";
import { type Repl } from "./repl.js";
export declare class ReplAccessibilityHelp implements IAccessibleViewImplentation {
    priority: number;
    name: string;
    when: import("../../../../platform/contextkey/common/contextkey.js").ContextKeyExpression;
    type: AccessibleViewType;
    getProvider(accessor: ServicesAccessor): ReplAccessibilityHelpProvider | undefined;
}
declare class ReplAccessibilityHelpProvider extends Disposable implements IAccessibleViewContentProvider {
    private readonly _replView;
    readonly id = AccessibleViewProviderId.ReplHelp;
    readonly verbositySettingKey = AccessibilityVerbositySettingId.Debug;
    readonly options: {
        type: AccessibleViewType;
    };
    private _treeHadFocus;
    constructor(_replView: Repl);
    onClose(): void;
    provideContent(): string;
}
export {};