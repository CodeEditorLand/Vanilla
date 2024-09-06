import * as DOM from "vs/base/browser/dom";
import { IAction } from "vs/base/common/actions";
import { Event } from "vs/base/common/event";
import { Disposable } from "vs/base/common/lifecycle";
import { IMenuService } from "vs/platform/actions/common/actions";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IContextMenuService } from "vs/platform/contextview/browser/contextView";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IKeybindingService } from "vs/platform/keybinding/common/keybinding";
import { INotebookEditorDelegate } from "vs/workbench/contrib/notebook/browser/notebookBrowser";
import { NotebookOptions } from "vs/workbench/contrib/notebook/browser/notebookOptions";
import { IWorkbenchAssignmentService } from "vs/workbench/services/assignment/common/assignmentService";
import { IEditorService } from "vs/workbench/services/editor/common/editorService";
interface IActionModel {
    action: IAction;
    size: number;
    visible: boolean;
    renderLabel: boolean;
}
export declare enum RenderLabel {
    Always = 0,
    Never = 1,
    Dynamic = 2
}
export type RenderLabelWithFallback = true | false | "always" | "never" | "dynamic";
export declare function convertConfiguration(value: RenderLabelWithFallback): RenderLabel;
export declare class NotebookEditorWorkbenchToolbar extends Disposable {
    readonly notebookEditor: INotebookEditorDelegate;
    readonly contextKeyService: IContextKeyService;
    readonly notebookOptions: NotebookOptions;
    readonly domNode: HTMLElement;
    private readonly instantiationService;
    private readonly configurationService;
    private readonly contextMenuService;
    private readonly menuService;
    private readonly editorService;
    private readonly keybindingService;
    private readonly experimentService;
    private _leftToolbarScrollable;
    private _notebookTopLeftToolbarContainer;
    private _notebookTopRightToolbarContainer;
    private _notebookGlobalActionsMenu;
    private _executeGoToActionsMenu;
    private _notebookLeftToolbar;
    private _primaryActions;
    get primaryActions(): IActionModel[];
    private _secondaryActions;
    get secondaryActions(): IAction[];
    private _notebookRightToolbar;
    private _useGlobalToolbar;
    private _strategy;
    private _renderLabel;
    private _visible;
    set visible(visible: boolean);
    private readonly _onDidChangeVisibility;
    onDidChangeVisibility: Event<boolean>;
    get useGlobalToolbar(): boolean;
    private _dimension;
    private _deferredActionUpdate;
    constructor(notebookEditor: INotebookEditorDelegate, contextKeyService: IContextKeyService, notebookOptions: NotebookOptions, domNode: HTMLElement, instantiationService: IInstantiationService, configurationService: IConfigurationService, contextMenuService: IContextMenuService, menuService: IMenuService, editorService: IEditorService, keybindingService: IKeybindingService, experimentService: IWorkbenchAssignmentService);
    private _buildBody;
    private _updatePerEditorChange;
    private _registerNotebookActionsToolbar;
    private _updateStrategy;
    private _convertConfiguration;
    private _showNotebookActionsinEditorToolbar;
    private _setNotebookActions;
    private _cacheItemSizes;
    private _computeSizes;
    layout(dimension: DOM.Dimension): void;
    dispose(): void;
}
export declare function workbenchCalculateActions(initialPrimaryActions: IActionModel[], initialSecondaryActions: IAction[], leftToolbarContainerMaxWidth: number): {
    primaryActions: IActionModel[];
    secondaryActions: IAction[];
};
export declare function workbenchDynamicCalculateActions(initialPrimaryActions: IActionModel[], initialSecondaryActions: IAction[], leftToolbarContainerMaxWidth: number): {
    primaryActions: IActionModel[];
    secondaryActions: IAction[];
};
export {};
