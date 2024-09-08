import { Disposable } from "../../../../base/common/lifecycle.js";
import type { ICodeEditor } from "../../../browser/editorBrowser.js";
import type { IEditorContribution } from "../../../common/editorCommon.js";
export declare class ReadOnlyMessageController extends Disposable implements IEditorContribution {
    private readonly editor;
    static readonly ID = "editor.contrib.readOnlyMessageController";
    constructor(editor: ICodeEditor);
    private _onDidAttemptReadOnlyEdit;
}
