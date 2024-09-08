import { Dimension } from "../../../../base/browser/dom.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import type { IEditorPartOptions } from "../../../common/editor.js";
import type { IReadonlyEditorGroupModel } from "../../../common/editor/editorGroupModel.js";
import type { EditorInput } from "../../../common/editor/editorInput.js";
import type { IEditorGroupView, IEditorGroupsView, IEditorPartsView, IInternalEditorOpenOptions } from "./editor.js";
import type { IEditorTabsControl } from "./editorTabsControl.js";
import type { IEditorTitleControlDimensions } from "./editorTitleControl.js";
export declare class MultiRowEditorControl extends Disposable implements IEditorTabsControl {
    private readonly parent;
    private readonly groupsView;
    private readonly groupView;
    private readonly model;
    private readonly instantiationService;
    private readonly stickyEditorTabsControl;
    private readonly unstickyEditorTabsControl;
    private activeControl;
    constructor(parent: HTMLElement, editorPartsView: IEditorPartsView, groupsView: IEditorGroupsView, groupView: IEditorGroupView, model: IReadonlyEditorGroupModel, instantiationService: IInstantiationService);
    private handleTabBarsStateChange;
    private handleTabBarsLayoutChange;
    private didActiveControlChange;
    private getEditorTabsController;
    openEditor(editor: EditorInput, options: IInternalEditorOpenOptions): boolean;
    openEditors(editors: EditorInput[]): boolean;
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
    getHeight(): number;
    dispose(): void;
}