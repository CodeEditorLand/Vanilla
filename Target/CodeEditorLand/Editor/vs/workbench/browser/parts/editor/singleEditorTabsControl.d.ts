import "vs/css!./media/singleeditortabscontrol";
import { Dimension } from "vs/base/browser/dom";
import { EditorTabsControl } from "vs/workbench/browser/parts/editor/editorTabsControl";
import { IEditorTitleControlDimensions } from "vs/workbench/browser/parts/editor/editorTitleControl";
import { IEditorPartOptions, IToolbarActions } from "vs/workbench/common/editor";
import { EditorInput } from "vs/workbench/common/editor/editorInput";
export declare class SingleEditorTabsControl extends EditorTabsControl {
    private titleContainer;
    private editorLabel;
    private activeLabel;
    private breadcrumbsControlFactory;
    private get breadcrumbsControl();
    protected create(parent: HTMLElement): void;
    private registerContainerListeners;
    private onTitleLabelClick;
    private onTitleDoubleClick;
    private onTitleAuxClick;
    private onTitleTap;
    openEditor(editor: EditorInput): boolean;
    openEditors(editors: EditorInput[]): boolean;
    private doHandleOpenEditor;
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
    updateOptions(oldOptions: IEditorPartOptions, newOptions: IEditorPartOptions): void;
    updateStyles(): void;
    protected handleBreadcrumbsEnablementChange(): void;
    private ifActiveEditorChanged;
    private ifActiveEditorPropertiesChanged;
    private ifEditorIsActive;
    private redraw;
    private getVerbosity;
    protected prepareEditorActions(editorActions: IToolbarActions): IToolbarActions;
    getHeight(): number;
    layout(dimensions: IEditorTitleControlDimensions): Dimension;
}
