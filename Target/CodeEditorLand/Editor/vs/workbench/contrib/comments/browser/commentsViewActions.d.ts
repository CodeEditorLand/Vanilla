import { Event } from "vs/base/common/event";
import { Disposable } from "vs/base/common/lifecycle";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
export declare const enum CommentsSortOrder {
    ResourceAscending = "resourceAscending",
    UpdatedAtDescending = "updatedAtDescending"
}
export interface CommentsFiltersChangeEvent {
    showResolved?: boolean;
    showUnresolved?: boolean;
    sortBy?: CommentsSortOrder;
}
interface CommentsFiltersOptions {
    showResolved: boolean;
    showUnresolved: boolean;
    sortBy: CommentsSortOrder;
}
export declare class CommentsFilters extends Disposable {
    private readonly contextKeyService;
    private readonly _onDidChange;
    readonly onDidChange: Event<CommentsFiltersChangeEvent>;
    constructor(options: CommentsFiltersOptions, contextKeyService: IContextKeyService);
    private readonly _showUnresolved;
    get showUnresolved(): boolean;
    set showUnresolved(showUnresolved: boolean);
    private _showResolved;
    get showResolved(): boolean;
    set showResolved(showResolved: boolean);
    private _sortBy;
    get sortBy(): CommentsSortOrder;
    set sortBy(sortBy: CommentsSortOrder);
}
export {};
