import { IAction } from "vs/base/common/actions";
import { Disposable } from "vs/base/common/lifecycle";
import { IObservable } from "vs/base/common/observable";
import "vs/css!./inlineCompletionsHintsWidget";
import { ICodeEditor, IContentWidget, IContentWidgetPosition } from "vs/editor/browser/editorBrowser";
import { Position } from "vs/editor/common/core/position";
import { Command } from "vs/editor/common/languages";
import { InlineCompletionsModel } from "vs/editor/contrib/inlineCompletions/browser/model/inlineCompletionsModel";
import { IMenuWorkbenchToolBarOptions, WorkbenchToolBar } from "vs/platform/actions/browser/toolbar";
import { IMenuService, MenuId } from "vs/platform/actions/common/actions";
import { ICommandService } from "vs/platform/commands/common/commands";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IContextMenuService } from "vs/platform/contextview/browser/contextView";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IKeybindingService } from "vs/platform/keybinding/common/keybinding";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
export declare class InlineCompletionsHintsWidget extends Disposable {
    private readonly editor;
    private readonly model;
    private readonly instantiationService;
    private readonly alwaysShowToolbar;
    private sessionPosition;
    private readonly position;
    constructor(editor: ICodeEditor, model: IObservable<InlineCompletionsModel | undefined>, instantiationService: IInstantiationService);
}
export declare class InlineSuggestionHintsContentWidget extends Disposable implements IContentWidget {
    private readonly editor;
    private readonly withBorder;
    private readonly _position;
    private readonly _currentSuggestionIdx;
    private readonly _suggestionCount;
    private readonly _extraCommands;
    private readonly _commandService;
    private readonly keybindingService;
    private readonly _contextKeyService;
    private readonly _menuService;
    private static _dropDownVisible;
    static get dropDownVisible(): boolean;
    private static id;
    private readonly id;
    readonly allowEditorOverflow = true;
    readonly suppressMouseDown = false;
    private readonly nodes;
    private createCommandAction;
    private readonly previousAction;
    private readonly availableSuggestionCountAction;
    private readonly nextAction;
    private readonly toolBar;
    private readonly inlineCompletionsActionsMenus;
    private readonly clearAvailableSuggestionCountLabelDebounced;
    private readonly disableButtonsDebounced;
    constructor(editor: ICodeEditor, withBorder: boolean, _position: IObservable<Position | null>, _currentSuggestionIdx: IObservable<number>, _suggestionCount: IObservable<number | undefined>, _extraCommands: IObservable<Command[]>, _commandService: ICommandService, instantiationService: IInstantiationService, keybindingService: IKeybindingService, _contextKeyService: IContextKeyService, _menuService: IMenuService);
    getId(): string;
    getDomNode(): HTMLElement;
    getPosition(): IContentWidgetPosition | null;
}
export declare class CustomizedMenuWorkbenchToolBar extends WorkbenchToolBar {
    private readonly menuId;
    private readonly options2;
    private readonly menuService;
    private readonly contextKeyService;
    private readonly menu;
    private additionalActions;
    private prependedPrimaryActions;
    constructor(container: HTMLElement, menuId: MenuId, options2: IMenuWorkbenchToolBarOptions | undefined, menuService: IMenuService, contextKeyService: IContextKeyService, contextMenuService: IContextMenuService, keybindingService: IKeybindingService, commandService: ICommandService, telemetryService: ITelemetryService);
    private updateToolbar;
    setPrependedPrimaryActions(actions: IAction[]): void;
    setAdditionalSecondaryActions(actions: IAction[]): void;
}
