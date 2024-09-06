import { CancellationToken } from "vs/base/common/cancellation";
import { Disposable, IDisposable } from "vs/base/common/lifecycle";
import { ILogService } from "vs/platform/log/common/log";
import { IProgress, IProgressStep } from "vs/platform/progress/common/progress";
import { IStoredFileWorkingCopy, IStoredFileWorkingCopyModel } from "vs/workbench/services/workingCopy/common/storedFileWorkingCopy";
import { IStoredFileWorkingCopySaveParticipant, IStoredFileWorkingCopySaveParticipantContext } from "vs/workbench/services/workingCopy/common/workingCopyFileService";
export declare class StoredFileWorkingCopySaveParticipant extends Disposable {
    private readonly logService;
    private readonly saveParticipants;
    get length(): number;
    constructor(logService: ILogService);
    addSaveParticipant(participant: IStoredFileWorkingCopySaveParticipant): IDisposable;
    participate(workingCopy: IStoredFileWorkingCopy<IStoredFileWorkingCopyModel>, context: IStoredFileWorkingCopySaveParticipantContext, progress: IProgress<IProgressStep>, token: CancellationToken): Promise<void>;
    dispose(): void;
}
