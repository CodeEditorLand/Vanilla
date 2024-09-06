import { ICodeEditor, IContentWidgetPosition } from "vs/editor/browser/editorBrowser";
import { CommentThreadState } from "vs/editor/common/languages";
export declare const overviewRulerCommentingRangeForeground: any;
export declare class CommentGlyphWidget {
    static description: string;
    private _lineNumber;
    private _editor;
    private _threadState;
    private readonly _commentsDecorations;
    private _commentsOptions;
    constructor(editor: ICodeEditor, lineNumber: number);
    private createDecorationOptions;
    setThreadState(state: CommentThreadState | undefined): void;
    private _updateDecorations;
    setLineNumber(lineNumber: number): void;
    getPosition(): IContentWidgetPosition;
    dispose(): void;
}
