import { ICodeEditor } from "vs/editor/browser/editorBrowser";
import { EditorAction2, ServicesAccessor } from "vs/editor/browser/editorExtensions";
import "vs/css!./colorPicker";
export declare class ShowOrFocusStandaloneColorPicker extends EditorAction2 {
    constructor();
    runEditorCommand(_accessor: ServicesAccessor, editor: ICodeEditor): void;
}
