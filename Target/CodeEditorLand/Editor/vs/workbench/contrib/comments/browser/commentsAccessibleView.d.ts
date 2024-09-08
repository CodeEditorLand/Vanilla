import { Disposable } from "../../../../base/common/lifecycle.js";
import type { ServicesAccessor } from "../../../../editor/browser/editorExtensions.js";
import { AccessibleViewProviderId, AccessibleViewType, type IAccessibleViewContentProvider } from "../../../../platform/accessibility/browser/accessibleView.js";
import type { IAccessibleViewImplentation } from "../../../../platform/accessibility/browser/accessibleViewRegistry.js";
import { AccessibilityVerbositySettingId } from "../../accessibility/browser/accessibilityConfiguration.js";
import { CommentsMenus } from "./commentsTreeViewer.js";
import { type CommentsPanel } from "./commentsView.js";
export declare class CommentsAccessibleView extends Disposable implements IAccessibleViewImplentation {
    readonly priority = 90;
    readonly name = "comment";
    readonly when: import("../../../../platform/contextkey/common/contextkey.js").RawContextKey<boolean>;
    readonly type = AccessibleViewType.View;
    getProvider(accessor: ServicesAccessor): CommentsAccessibleContentProvider | undefined;
    constructor();
}
declare class CommentsAccessibleContentProvider extends Disposable implements IAccessibleViewContentProvider {
    private readonly _commentsView;
    private readonly _focusedCommentNode;
    private readonly _menus;
    constructor(_commentsView: CommentsPanel, _focusedCommentNode: any, _menus: CommentsMenus);
    readonly id = AccessibleViewProviderId.Comments;
    readonly verbositySettingKey = AccessibilityVerbositySettingId.Comments;
    readonly options: {
        type: AccessibleViewType;
    };
    actions: {
        run: () => void;
        id: string;
        label: string;
        tooltip: string;
        class: string | undefined;
        enabled: boolean;
        checked?: boolean;
    }[];
    provideContent(): string;
    onClose(): void;
    provideNextContent(): string | undefined;
    providePreviousContent(): string | undefined;
}
export {};
