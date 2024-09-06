import { CancellationToken } from "vs/base/common/cancellation";
import { Disposable, IDisposable } from "vs/base/common/lifecycle";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { FileOperation } from "vs/platform/files/common/files";
import { ILogService } from "vs/platform/log/common/log";
import { IFileOperationUndoRedoInfo, IWorkingCopyFileOperationParticipant, SourceTargetPair } from "vs/workbench/services/workingCopy/common/workingCopyFileService";
export declare class WorkingCopyFileOperationParticipant extends Disposable {
    private readonly logService;
    private readonly configurationService;
    private readonly participants;
    constructor(logService: ILogService, configurationService: IConfigurationService);
    addFileOperationParticipant(participant: IWorkingCopyFileOperationParticipant): IDisposable;
    participate(files: SourceTargetPair[], operation: FileOperation, undoInfo: IFileOperationUndoRedoInfo | undefined, token: CancellationToken): Promise<void>;
    dispose(): void;
}
