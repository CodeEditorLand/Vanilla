import { Disposable } from "vs/base/common/lifecycle";
import { ServicesAccessor } from "vs/editor/browser/editorExtensions";
import { IAccessibleViewContentProvider } from "vs/platform/accessibility/browser/accessibleView";
import { IAccessibleViewImplentation } from "vs/platform/accessibility/browser/accessibleViewRegistry";
import { CommentsMenus } from "vs/workbench/contrib/comments/browser/commentsTreeViewer";
import { CommentsPanel } from "vs/workbench/contrib/comments/browser/commentsView";
export declare class CommentsAccessibleView extends Disposable implements IAccessibleViewImplentation {
    readonly priority = 90;
    readonly name = "comment";
    readonly when: any;
    readonly type: any;
    getProvider(accessor: ServicesAccessor): CommentsAccessibleContentProvider | undefined;
    constructor();
}
declare class CommentsAccessibleContentProvider extends Disposable implements IAccessibleViewContentProvider {
    private readonly _commentsView;
    private readonly _focusedCommentNode;
    private readonly _menus;
    constructor(_commentsView: CommentsPanel, _focusedCommentNode: any, _menus: CommentsMenus);
    readonly id: any;
    readonly verbositySettingKey: any;
    readonly options: {
        type: any;
    };
    actions: any[];
    provideContent(): string;
    onClose(): void;
    provideNextContent(): string | undefined;
    providePreviousContent(): string | undefined;
}
export {};
