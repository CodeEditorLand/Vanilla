import { CancellationToken } from "../../../../base/common/cancellation.js";
import { Disposable, IDisposable } from "../../../../base/common/lifecycle.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { FileOperation } from "../../../../platform/files/common/files.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IFileOperationUndoRedoInfo, IWorkingCopyFileOperationParticipant, SourceTargetPair } from "./workingCopyFileService.js";
export declare class WorkingCopyFileOperationParticipant extends Disposable {
    private readonly logService;
    private readonly configurationService;
    private readonly participants;
    constructor(logService: ILogService, configurationService: IConfigurationService);
    addFileOperationParticipant(participant: IWorkingCopyFileOperationParticipant): IDisposable;
    participate(files: SourceTargetPair[], operation: FileOperation, undoInfo: IFileOperationUndoRedoInfo | undefined, token: CancellationToken): Promise<void>;
    dispose(): void;
}
