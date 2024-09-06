import { Disposable } from "vs/base/common/lifecycle";
import { IAccessibleViewContentProvider, IAccessibleViewOptions } from "vs/platform/accessibility/browser/accessibleView";
import { IAccessibleViewImplentation } from "vs/platform/accessibility/browser/accessibleViewRegistry";
import { ServicesAccessor } from "vs/platform/instantiation/common/instantiation";
import { AccessibilityVerbositySettingId } from "vs/workbench/contrib/accessibility/browser/accessibilityConfiguration";
export declare namespace CommentAccessibilityHelpNLS {
    const intro: any;
    const tabFocus: any;
    const commentCommands: any;
    const escape: any;
    const nextRange: any;
    const previousRange: any;
    const nextCommentThread: any;
    const previousCommentThread: any;
    const addComment: any;
    const submitComment: any;
}
export declare class CommentsAccessibilityHelpProvider extends Disposable implements IAccessibleViewContentProvider {
    id: any;
    verbositySettingKey: AccessibilityVerbositySettingId;
    options: IAccessibleViewOptions;
    private _element;
    provideContent(): string;
    onClose(): void;
}
export declare class CommentsAccessibilityHelp implements IAccessibleViewImplentation {
    readonly priority = 110;
    readonly name = "comments";
    readonly type: any;
    readonly when: any;
    getProvider(accessor: ServicesAccessor): any;
}
