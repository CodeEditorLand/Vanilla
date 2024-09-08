import type { ICodeEditor } from "../../../browser/editorBrowser.js";
import type { IPosition } from "../../../common/core/position.js";
import { type CompletionItem } from "../../../common/languages.js";
import type { IEditorWorkerService } from "../../../common/services/editorWorker.js";
export declare abstract class WordDistance {
    static readonly None: {
        distance(): number;
    };
    static create(service: IEditorWorkerService, editor: ICodeEditor): Promise<WordDistance>;
    abstract distance(anchor: IPosition, suggestion: CompletionItem): number;
}
