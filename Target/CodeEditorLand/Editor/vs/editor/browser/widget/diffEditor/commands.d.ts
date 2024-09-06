import { ICodeEditor, IDiffEditor } from "vs/editor/browser/editorBrowser";
import { EditorAction2, ServicesAccessor } from "vs/editor/browser/editorExtensions";
import { Action2 } from "vs/platform/actions/common/actions";
import "./registrations.contribution";
import { URI } from "vs/base/common/uri";
import { DiffEditorSelectionHunkToolbarContext } from "vs/editor/browser/widget/diffEditor/features/gutterFeature";
export declare class ToggleCollapseUnchangedRegions extends Action2 {
    constructor();
    run(accessor: ServicesAccessor, ...args: unknown[]): void;
}
export declare class ToggleShowMovedCodeBlocks extends Action2 {
    constructor();
    run(accessor: ServicesAccessor, ...args: unknown[]): void;
}
export declare class ToggleUseInlineViewWhenSpaceIsLimited extends Action2 {
    constructor();
    run(accessor: ServicesAccessor, ...args: unknown[]): void;
}
export declare class SwitchSide extends EditorAction2 {
    constructor();
    runEditorCommand(accessor: ServicesAccessor, editor: ICodeEditor, arg?: {
        dryRun: boolean;
    }): unknown;
}
export declare class ExitCompareMove extends EditorAction2 {
    constructor();
    runEditorCommand(accessor: ServicesAccessor, editor: ICodeEditor, ...args: unknown[]): void;
}
export declare class CollapseAllUnchangedRegions extends EditorAction2 {
    constructor();
    runEditorCommand(accessor: ServicesAccessor, editor: ICodeEditor, ...args: unknown[]): void;
}
export declare class ShowAllUnchangedRegions extends EditorAction2 {
    constructor();
    runEditorCommand(accessor: ServicesAccessor, editor: ICodeEditor, ...args: unknown[]): void;
}
export declare class RevertHunkOrSelection extends Action2 {
    constructor();
    run(accessor: ServicesAccessor, arg: DiffEditorSelectionHunkToolbarContext): unknown;
}
export declare class AccessibleDiffViewerNext extends Action2 {
    static id: string;
    constructor();
    run(accessor: ServicesAccessor): void;
}
export declare class AccessibleDiffViewerPrev extends Action2 {
    static id: string;
    constructor();
    run(accessor: ServicesAccessor): void;
}
export declare function findDiffEditor(accessor: ServicesAccessor, originalUri: URI, modifiedUri: URI): IDiffEditor | null;
export declare function findFocusedDiffEditor(accessor: ServicesAccessor): IDiffEditor | null;
