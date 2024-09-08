import "./media/singleeditortabscontrol.css";
import { Dimension } from "../../../../base/browser/dom.js";
import type { IToolbarActions } from "../../../common/editor.js";
import type { EditorInput } from "../../../common/editor/editorInput.js";
import { EditorTabsControl } from "./editorTabsControl.js";
import type { IEditorTitleControlDimensions } from "./editorTitleControl.js";
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
