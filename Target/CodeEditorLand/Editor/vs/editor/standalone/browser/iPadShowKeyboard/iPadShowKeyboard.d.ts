import "./iPadShowKeyboard.css";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { type ICodeEditor } from "../../../browser/editorBrowser.js";
import type { IEditorContribution } from "../../../common/editorCommon.js";
export declare class IPadShowKeyboard extends Disposable implements IEditorContribution {
    static readonly ID = "editor.contrib.iPadShowKeyboard";
    private readonly editor;
    private widget;
    constructor(editor: ICodeEditor);
    private update;
    dispose(): void;
}