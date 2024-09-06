import { ICodeEditor } from "vs/editor/browser/editorBrowser";
import { EditorAction, ServicesAccessor } from "vs/editor/browser/editorExtensions";
export declare class AcceptInlineEdit extends EditorAction {
    constructor();
    run(accessor: ServicesAccessor | undefined, editor: ICodeEditor): Promise<void>;
}
export declare class TriggerInlineEdit extends EditorAction {
    constructor();
    run(accessor: ServicesAccessor | undefined, editor: ICodeEditor): Promise<void>;
}
export declare class JumpToInlineEdit extends EditorAction {
    constructor();
    run(accessor: ServicesAccessor | undefined, editor: ICodeEditor): Promise<void>;
}
export declare class JumpBackInlineEdit extends EditorAction {
    constructor();
    run(accessor: ServicesAccessor | undefined, editor: ICodeEditor): Promise<void>;
}
export declare class RejectInlineEdit extends EditorAction {
    constructor();
    run(accessor: ServicesAccessor | undefined, editor: ICodeEditor): Promise<void>;
}
