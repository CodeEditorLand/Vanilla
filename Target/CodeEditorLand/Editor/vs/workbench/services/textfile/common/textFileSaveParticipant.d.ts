import { CancellationToken } from "vs/base/common/cancellation";
import { Disposable, IDisposable } from "vs/base/common/lifecycle";
import { ILogService } from "vs/platform/log/common/log";
import { IProgress, IProgressStep } from "vs/platform/progress/common/progress";
import { ITextFileEditorModel, ITextFileSaveParticipant, ITextFileSaveParticipantContext } from "vs/workbench/services/textfile/common/textfiles";
export declare class TextFileSaveParticipant extends Disposable {
    private readonly logService;
    private readonly saveParticipants;
    constructor(logService: ILogService);
    addSaveParticipant(participant: ITextFileSaveParticipant): IDisposable;
    participate(model: ITextFileEditorModel, context: ITextFileSaveParticipantContext, progress: IProgress<IProgressStep>, token: CancellationToken): Promise<void>;
    dispose(): void;
}
