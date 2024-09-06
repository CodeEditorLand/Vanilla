import { Disposable } from "vs/base/common/lifecycle";
import { IWorkbenchContribution } from "vs/workbench/common/contributions";
import { IActivityService } from "vs/workbench/services/activity/common/activity";
import { IFilesConfigurationService } from "vs/workbench/services/filesConfiguration/common/filesConfigurationService";
import { IWorkingCopyService } from "vs/workbench/services/workingCopy/common/workingCopyService";
export declare class DirtyFilesIndicator extends Disposable implements IWorkbenchContribution {
    private readonly activityService;
    private readonly workingCopyService;
    private readonly filesConfigurationService;
    static readonly ID = "workbench.contrib.dirtyFilesIndicator";
    private readonly badgeHandle;
    private lastKnownDirtyCount;
    constructor(activityService: IActivityService, workingCopyService: IWorkingCopyService, filesConfigurationService: IFilesConfigurationService);
    private registerListeners;
    private onWorkingCopyDidChangeDirty;
    private updateActivityBadge;
}
