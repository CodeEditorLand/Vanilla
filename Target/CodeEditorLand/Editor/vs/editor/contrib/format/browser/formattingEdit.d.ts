import type { ICodeEditor } from "../../../browser/editorBrowser.js";
import type { TextEdit } from "../../../common/languages.js";
export declare class FormattingEdit {
    private static _handleEolEdits;
    private static _isFullModelReplaceEdit;
    static execute(editor: ICodeEditor, _edits: TextEdit[], addUndoStops: boolean): void;
}
