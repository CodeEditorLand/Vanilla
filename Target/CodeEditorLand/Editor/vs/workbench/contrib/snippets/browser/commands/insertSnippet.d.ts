import type { ICodeEditor } from "../../../../../editor/browser/editorBrowser.js";
import type { ServicesAccessor } from "../../../../../editor/browser/editorExtensions.js";
import { SnippetEditorAction } from "./abstractSnippetsActions.js";
export declare class InsertSnippetAction extends SnippetEditorAction {
    constructor();
    runEditorCommand(accessor: ServicesAccessor, editor: ICodeEditor, arg: any): Promise<void>;
}
