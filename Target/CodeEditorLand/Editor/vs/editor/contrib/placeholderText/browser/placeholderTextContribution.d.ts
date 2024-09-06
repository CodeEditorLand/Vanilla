import { Disposable } from "vs/base/common/lifecycle";
import { ICodeEditor } from "vs/editor/browser/editorBrowser";
import { IEditorContribution } from "vs/editor/common/editorCommon";
/**
 * Use the editor option to set the placeholder text.
 */
export declare class PlaceholderTextContribution extends Disposable implements IEditorContribution {
    private readonly _editor;
    static get(editor: ICodeEditor): PlaceholderTextContribution;
    static readonly ID = "editor.contrib.placeholderText";
    private readonly _editorObs;
    private readonly _placeholderText;
    private readonly _state;
    private readonly _shouldViewBeAlive;
    private readonly _view;
    constructor(_editor: ICodeEditor);
}
