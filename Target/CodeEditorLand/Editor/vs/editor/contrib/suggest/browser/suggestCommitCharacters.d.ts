import type { ICodeEditor } from "../../../browser/editorBrowser.js";
import { type SuggestModel } from "./suggestModel.js";
import type { ISelectedSuggestion, SuggestWidget } from "./suggestWidget.js";
export declare class CommitCharacterController {
    private readonly _disposables;
    private _active?;
    constructor(editor: ICodeEditor, widget: SuggestWidget, model: SuggestModel, accept: (selected: ISelectedSuggestion) => any);
    private _onItem;
    reset(): void;
    dispose(): void;
}
