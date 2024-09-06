import { IntervalTimer } from "vs/base/common/async";
import { CancellationToken } from "vs/base/common/cancellation";
import { IRange } from "vs/editor/common/core/range";
import { IIdentifiedSingleEditOperation, ITextModel, IValidEditOperation } from "vs/editor/common/model";
import { IProgress } from "vs/platform/progress/common/progress";
import { IEditObserver } from "./inlineChatStrategies";
export interface AsyncTextEdit {
    readonly range: IRange;
    readonly newText: AsyncIterable<string>;
}
export declare function performAsyncTextEdit(model: ITextModel, edit: AsyncTextEdit, progress?: IProgress<IValidEditOperation[]>, obs?: IEditObserver): Promise<void>;
export declare function asProgressiveEdit(interval: IntervalTimer, edit: IIdentifiedSingleEditOperation, wordsPerSec: number, token: CancellationToken): AsyncTextEdit;
