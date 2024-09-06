import { CancellationToken } from "../../../../base/common/cancellation.js";
import { Disposable, IDisposable } from "../../../../base/common/lifecycle.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IProgress, IProgressStep } from "../../../../platform/progress/common/progress.js";
import { IStoredFileWorkingCopy, IStoredFileWorkingCopyModel } from "./storedFileWorkingCopy.js";
import { IStoredFileWorkingCopySaveParticipant, IStoredFileWorkingCopySaveParticipantContext } from "./workingCopyFileService.js";
export declare class StoredFileWorkingCopySaveParticipant extends Disposable {
    private readonly logService;
    private readonly saveParticipants;
    get length(): number;
    constructor(logService: ILogService);
    addSaveParticipant(participant: IStoredFileWorkingCopySaveParticipant): IDisposable;
    participate(workingCopy: IStoredFileWorkingCopy<IStoredFileWorkingCopyModel>, context: IStoredFileWorkingCopySaveParticipantContext, progress: IProgress<IProgressStep>, token: CancellationToken): Promise<void>;
    dispose(): void;
}
