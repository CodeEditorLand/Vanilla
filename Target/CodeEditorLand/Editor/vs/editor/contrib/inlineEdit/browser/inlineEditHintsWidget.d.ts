import { IAction } from "vs/base/common/actions";
import { Disposable } from "vs/base/common/lifecycle";
import { IObservable } from "vs/base/common/observable";
import "vs/css!./inlineEditHintsWidget";
import { ICodeEditor, IContentWidget, IContentWidgetPosition } from "vs/editor/browser/editorBrowser";
import { Position } from "vs/editor/common/core/position";
import { GhostTextWidget } from "vs/editor/contrib/inlineEdit/browser/ghostTextWidget";
import { IMenuWorkbenchToolBarOptions, WorkbenchToolBar } from "vs/platform/actions/browser/toolbar";
import { IMenuService, MenuId } from "vs/platform/actions/common/actions";
import { ICommandService } from "vs/platform/commands/common/commands";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IContextMenuService } from "vs/platform/contextview/browser/contextView";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IKeybindingService } from "vs/platform/keybinding/common/keybinding";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
export declare class InlineEditHintsWidget extends Disposable {
    private readonly editor;
    private readonly model;
    private readonly instantiationService;
    private readonly alwaysShowToolbar;
    private sessionPosition;
    private readonly position;
    constructor(editor: ICodeEditor, model: IObservable<GhostTextWidget | undefined>, instantiationService: IInstantiationService);
}
export declare class InlineEditHintsContentWidget extends Disposable implements IContentWidget {
    private readonly editor;
    private readonly withBorder;
    private readonly _position;
    private readonly _contextKeyService;
    private readonly _menuService;
    private static _dropDownVisible;
    static get dropDownVisible(): boolean;
    private static id;
    private readonly id;
    readonly allowEditorOverflow = true;
    readonly suppressMouseDown = false;
    private readonly nodes;
    private readonly toolBar;
    private readonly inlineCompletionsActionsMenus;
    constructor(editor: ICodeEditor, withBorder: boolean, _position: IObservable<Position | null>, instantiationService: IInstantiationService, _contextKeyService: IContextKeyService, _menuService: IMenuService);
    getId(): string;
    getDomNode(): HTMLElement;
    getPosition(): IContentWidgetPosition | null;
}
export declare class CustomizedMenuWorkbenchToolBar extends WorkbenchToolBar {
    private readonly editor;
    private readonly menuId;
    private readonly options2;
    private readonly menuService;
    private readonly contextKeyService;
    private readonly menu;
    private additionalActions;
    private prependedPrimaryActions;
    constructor(container: HTMLElement, editor: ICodeEditor, menuId: MenuId, options2: IMenuWorkbenchToolBarOptions | undefined, menuService: IMenuService, contextKeyService: IContextKeyService, contextMenuService: IContextMenuService, keybindingService: IKeybindingService, commandService: ICommandService, telemetryService: ITelemetryService);
    private updateToolbar;
    setPrependedPrimaryActions(actions: IAction[]): void;
    setAdditionalSecondaryActions(actions: IAction[]): void;
}
