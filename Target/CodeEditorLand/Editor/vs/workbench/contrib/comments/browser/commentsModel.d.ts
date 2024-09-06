import { Disposable } from "../../../../base/common/lifecycle.js";
import { CommentThread } from "../../../../editor/common/languages.js";
import { ICommentThreadChangedEvent, ResourceWithCommentThreads } from "../common/commentModel.js";
export declare function threadHasMeaningfulComments(thread: CommentThread): boolean;
export interface ICommentsModel {
    hasCommentThreads(): boolean;
    getMessage(): string;
    readonly resourceCommentThreads: ResourceWithCommentThreads[];
    readonly commentThreadsMap: Map<string, {
        resourceWithCommentThreads: ResourceWithCommentThreads[];
        ownerLabel?: string;
    }>;
}
export declare class CommentsModel extends Disposable implements ICommentsModel {
    readonly _serviceBrand: undefined;
    private _resourceCommentThreads;
    get resourceCommentThreads(): ResourceWithCommentThreads[];
    readonly commentThreadsMap: Map<string, {
        resourceWithCommentThreads: ResourceWithCommentThreads[];
        ownerLabel?: string;
    }>;
    constructor();
    private updateResourceCommentThreads;
    setCommentThreads(uniqueOwner: string, owner: string, ownerLabel: string, commentThreads: CommentThread[]): void;
    deleteCommentsByOwner(uniqueOwner?: string): void;
    updateCommentThreads(event: ICommentThreadChangedEvent): boolean;
    hasCommentThreads(): boolean;
    getMessage(): string;
    private groupByResource;
    private static _compareURIs;
}
