import "vs/css!./media/editortitlecontrol";
import { Dimension } from "vs/base/browser/dom";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IThemeService, Themable } from "vs/platform/theme/common/themeService";
import { IEditorGroupsView, IEditorGroupTitleHeight, IEditorGroupView, IEditorPartsView, IInternalEditorOpenOptions } from "vs/workbench/browser/parts/editor/editor";
import { IEditorPartOptions } from "vs/workbench/common/editor";
import { IReadonlyEditorGroupModel } from "vs/workbench/common/editor/editorGroupModel";
import { EditorInput } from "vs/workbench/common/editor/editorInput";
export interface IEditorTitleControlDimensions {
    /**
     * The size of the parent container the title control is layed out in.
     */
    readonly container: Dimension;
    /**
     * The maximum size the title control is allowed to consume based on
     * other controls that are positioned inside the container.
     */
    readonly available: Dimension;
}
export declare class EditorTitleControl extends Themable {
    private readonly parent;
    private readonly editorPartsView;
    private readonly groupsView;
    private readonly groupView;
    private readonly model;
    private instantiationService;
    private editorTabsControl;
    private readonly editorTabsControlDisposable;
    private breadcrumbsControlFactory;
    private readonly breadcrumbsControlDisposables;
    private get breadcrumbsControl();
    constructor(parent: HTMLElement, editorPartsView: IEditorPartsView, groupsView: IEditorGroupsView, groupView: IEditorGroupView, model: IReadonlyEditorGroupModel, instantiationService: IInstantiationService, themeService: IThemeService);
    private createEditorTabsControl;
    private createBreadcrumbsControl;
    openEditor(editor: EditorInput, options?: IInternalEditorOpenOptions): void;
    openEditors(editors: EditorInput[]): void;
    private handleOpenedEditors;
    beforeCloseEditor(editor: EditorInput): void;
    closeEditor(editor: EditorInput): void;
    closeEditors(editors: EditorInput[]): void;
    private handleClosedEditors;
    moveEditor(editor: EditorInput, fromIndex: number, targetIndex: number, stickyStateChange: boolean): void;
    pinEditor(editor: EditorInput): void;
    stickEditor(editor: EditorInput): void;
    unstickEditor(editor: EditorInput): void;
    setActive(isActive: boolean): void;
    updateEditorSelections(): void;
    updateEditorLabel(editor: EditorInput): void;
    updateEditorDirty(editor: EditorInput): void;
    updateOptions(oldOptions: IEditorPartOptions, newOptions: IEditorPartOptions): void;
    layout(dimensions: IEditorTitleControlDimensions): Dimension;
    getHeight(): IEditorGroupTitleHeight;
}
