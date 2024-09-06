import { Event } from "vs/base/common/event";
import { Disposable } from "vs/base/common/lifecycle";
import { ICodeEditor } from "vs/editor/browser/editorBrowser";
import { Position } from "vs/editor/common/core/position";
import { Range } from "vs/editor/common/core/range";
import { SingleTextEdit } from "vs/editor/common/core/textEdit";
import { CompletionItemKind, SelectedSuggestionInfo } from "vs/editor/common/languages";
import { ITextModel } from "vs/editor/common/model";
import { CompletionItem } from "vs/editor/contrib/suggest/browser/suggest";
import { SuggestController } from "vs/editor/contrib/suggest/browser/suggestController";
export declare class SuggestWidgetAdaptor extends Disposable {
    private readonly editor;
    private readonly suggestControllerPreselector;
    private readonly onWillAccept;
    private isSuggestWidgetVisible;
    private isShiftKeyPressed;
    private _isActive;
    private _currentSuggestItemInfo;
    get selectedItem(): SuggestItemInfo | undefined;
    private _onDidSelectedItemChange;
    readonly onDidSelectedItemChange: Event<void>;
    constructor(editor: ICodeEditor, suggestControllerPreselector: () => SingleTextEdit | undefined, onWillAccept: (item: SuggestItemInfo) => void);
    private update;
    private getSuggestItemInfo;
    stopForceRenderingAbove(): void;
    forceRenderingAbove(): void;
}
export declare class SuggestItemInfo {
    readonly range: Range;
    readonly insertText: string;
    readonly completionItemKind: CompletionItemKind;
    readonly isSnippetText: boolean;
    static fromSuggestion(suggestController: SuggestController, model: ITextModel, position: Position, item: CompletionItem, toggleMode: boolean): SuggestItemInfo;
    private constructor();
    equals(other: SuggestItemInfo): boolean;
    toSelectedSuggestionInfo(): SelectedSuggestionInfo;
    toSingleTextEdit(): SingleTextEdit;
}
