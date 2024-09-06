import { IView } from "vs/workbench/common/views";
import { CommentsFilters } from "vs/workbench/contrib/comments/browser/commentsViewActions";
export declare const CommentsViewFilterFocusContextKey: any;
export interface ICommentsView extends IView {
    readonly filters: CommentsFilters;
    focusFilter(): void;
    clearFilterText(): void;
    getFilterStats(): {
        total: number;
        filtered: number;
    };
    collapseAll(): void;
}
