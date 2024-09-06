import { CancellationToken } from "../../../../base/common/cancellation.js";
import { Disposable, IDisposable } from "../../../../base/common/lifecycle.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IProgress, IProgressStep } from "../../../../platform/progress/common/progress.js";
import { ITextFileEditorModel, ITextFileSaveParticipant, ITextFileSaveParticipantContext } from "./textfiles.js";
export declare class TextFileSaveParticipant extends Disposable {
    private readonly logService;
    private readonly saveParticipants;
    constructor(logService: ILogService);
    addSaveParticipant(participant: ITextFileSaveParticipant): IDisposable;
    participate(model: ITextFileEditorModel, context: ITextFileSaveParticipantContext, progress: IProgress<IProgressStep>, token: CancellationToken): Promise<void>;
    dispose(): void;
}
