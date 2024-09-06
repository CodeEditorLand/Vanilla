import { ICodeEditor } from "../../../browser/editorBrowser.js";
import { EditorAction, ServicesAccessor } from "../../../browser/editorExtensions.js";
export declare class ShowNextInlineEditAction extends EditorAction {
    static ID: string;
    constructor();
    run(accessor: ServicesAccessor | undefined, editor: ICodeEditor): Promise<void>;
}
export declare class ShowPreviousInlineEditAction extends EditorAction {
    static ID: string;
    constructor();
    run(accessor: ServicesAccessor | undefined, editor: ICodeEditor): Promise<void>;
}
export declare class TriggerInlineEditAction extends EditorAction {
    constructor();
    run(accessor: ServicesAccessor | undefined, editor: ICodeEditor): Promise<void>;
}
export declare class AcceptInlineEdit extends EditorAction {
    constructor();
    run(accessor: ServicesAccessor | undefined, editor: ICodeEditor): Promise<void>;
}
export declare class HideInlineEdit extends EditorAction {
    static ID: string;
    constructor();
    run(accessor: ServicesAccessor | undefined, editor: ICodeEditor): Promise<void>;
}
