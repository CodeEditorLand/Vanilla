import "vs/css!./media/singleeditortabscontrol";
import { Dimension } from "vs/base/browser/dom";
import { EditorTabsControl } from "vs/workbench/browser/parts/editor/editorTabsControl";
import { IEditorTitleControlDimensions } from "vs/workbench/browser/parts/editor/editorTitleControl";
import { IToolbarActions } from "vs/workbench/common/editor";
import { EditorInput } from "vs/workbench/common/editor/editorInput";
export declare class NoEditorTabsControl extends EditorTabsControl {
    private activeEditor;
    protected prepareEditorActions(editorActions: IToolbarActions): IToolbarActions;
    openEditor(editor: EditorInput): boolean;
    openEditors(editors: EditorInput[]): boolean;
    private handleOpenedEditors;
    private activeEditorChanged;
    beforeCloseEditor(editor: EditorInput): void;
    closeEditor(editor: EditorInput): void;
    closeEditors(editors: EditorInput[]): void;
    moveEditor(editor: EditorInput, fromIndex: number, targetIndex: number): void;
    pinEditor(editor: EditorInput): void;
    stickEditor(editor: EditorInput): void;
    unstickEditor(editor: EditorInput): void;
    setActive(isActive: boolean): void;
    updateEditorSelections(): void;
    updateEditorLabel(editor: EditorInput): void;
    updateEditorDirty(editor: EditorInput): void;
    getHeight(): number;
    layout(dimensions: IEditorTitleControlDimensions): Dimension;
}
