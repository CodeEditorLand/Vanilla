import { Disposable } from "../../../../base/common/lifecycle.js";
import { type ICodeEditor, type IContentWidgetPosition } from "../../../../editor/browser/editorBrowser.js";
import { CommentThreadState } from "../../../../editor/common/languages.js";
export declare const overviewRulerCommentingRangeForeground: string;
export declare class CommentGlyphWidget extends Disposable {
    static description: string;
    private _lineNumber;
    private _editor;
    private _threadState;
    private readonly _commentsDecorations;
    private _commentsOptions;
    private readonly _onDidChangeLineNumber;
    readonly onDidChangeLineNumber: import("../../../../base/common/event.js").Event<number>;
    constructor(editor: ICodeEditor, lineNumber: number);
    private createDecorationOptions;
    setThreadState(state: CommentThreadState | undefined): void;
    private _updateDecorations;
    setLineNumber(lineNumber: number): void;
    getPosition(): IContentWidgetPosition;
}
