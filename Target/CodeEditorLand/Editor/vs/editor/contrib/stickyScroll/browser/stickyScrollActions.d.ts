import { ICodeEditor } from "vs/editor/browser/editorBrowser";
import { EditorAction2, ServicesAccessor } from "vs/editor/browser/editorExtensions";
import { Action2 } from "vs/platform/actions/common/actions";
export declare class ToggleStickyScroll extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class FocusStickyScroll extends EditorAction2 {
    constructor();
    runEditorCommand(_accessor: ServicesAccessor, editor: ICodeEditor): void;
}
export declare class SelectNextStickyScrollLine extends EditorAction2 {
    constructor();
    runEditorCommand(_accessor: ServicesAccessor, editor: ICodeEditor): void;
}
export declare class SelectPreviousStickyScrollLine extends EditorAction2 {
    constructor();
    runEditorCommand(_accessor: ServicesAccessor, editor: ICodeEditor): void;
}
export declare class GoToStickyScrollLine extends EditorAction2 {
    constructor();
    runEditorCommand(_accessor: ServicesAccessor, editor: ICodeEditor): void;
}
export declare class SelectEditor extends EditorAction2 {
    constructor();
    runEditorCommand(_accessor: ServicesAccessor, editor: ICodeEditor): void;
}
