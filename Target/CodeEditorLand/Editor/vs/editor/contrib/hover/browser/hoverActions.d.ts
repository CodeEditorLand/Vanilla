import { ICodeEditor } from "vs/editor/browser/editorBrowser";
import { EditorAction, ServicesAccessor } from "vs/editor/browser/editorExtensions";
import "vs/css!./hover";
export declare class ShowOrFocusHoverAction extends EditorAction {
    constructor();
    run(accessor: ServicesAccessor, editor: ICodeEditor, args: any): void;
}
export declare class ShowDefinitionPreviewHoverAction extends EditorAction {
    constructor();
    run(accessor: ServicesAccessor, editor: ICodeEditor): void;
}
export declare class ScrollUpHoverAction extends EditorAction {
    constructor();
    run(accessor: ServicesAccessor, editor: ICodeEditor): void;
}
export declare class ScrollDownHoverAction extends EditorAction {
    constructor();
    run(accessor: ServicesAccessor, editor: ICodeEditor): void;
}
export declare class ScrollLeftHoverAction extends EditorAction {
    constructor();
    run(accessor: ServicesAccessor, editor: ICodeEditor): void;
}
export declare class ScrollRightHoverAction extends EditorAction {
    constructor();
    run(accessor: ServicesAccessor, editor: ICodeEditor): void;
}
export declare class PageUpHoverAction extends EditorAction {
    constructor();
    run(accessor: ServicesAccessor, editor: ICodeEditor): void;
}
export declare class PageDownHoverAction extends EditorAction {
    constructor();
    run(accessor: ServicesAccessor, editor: ICodeEditor): void;
}
export declare class GoToTopHoverAction extends EditorAction {
    constructor();
    run(accessor: ServicesAccessor, editor: ICodeEditor): void;
}
export declare class GoToBottomHoverAction extends EditorAction {
    constructor();
    run(accessor: ServicesAccessor, editor: ICodeEditor): void;
}
export declare class IncreaseHoverVerbosityLevel extends EditorAction {
    constructor();
    run(accessor: ServicesAccessor, editor: ICodeEditor, args?: {
        index: number;
        focus: boolean;
    }): void;
}
export declare class DecreaseHoverVerbosityLevel extends EditorAction {
    constructor();
    run(accessor: ServicesAccessor, editor: ICodeEditor, args?: {
        index: number;
        focus: boolean;
    }): void;
}
