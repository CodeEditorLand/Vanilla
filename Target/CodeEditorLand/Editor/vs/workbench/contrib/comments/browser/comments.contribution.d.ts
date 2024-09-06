import "vs/workbench/contrib/comments/browser/commentsEditorContribution";
import { Disposable } from "vs/base/common/lifecycle";
import { IWorkbenchContribution } from "vs/workbench/common/contributions";
import { ICommentService } from "vs/workbench/contrib/comments/browser/commentService";
import { IActivityService } from "vs/workbench/services/activity/common/activity";
export declare class UnresolvedCommentsBadge extends Disposable implements IWorkbenchContribution {
    private readonly _commentService;
    private readonly activityService;
    private readonly activity;
    private totalUnresolved;
    constructor(_commentService: ICommentService, activityService: IActivityService);
    private onAllCommentsChanged;
    private onCommentsUpdated;
    private updateBadge;
}
