import type { ICodeEditor } from "../../../browser/editorBrowser.js";
import { EditorAction, type ServicesAccessor } from "../../../browser/editorExtensions.js";
export declare class ExpandLineSelectionAction extends EditorAction {
    constructor();
    run(_accessor: ServicesAccessor, editor: ICodeEditor, args: any): void;
}
