import { type IAction, type IActionRunner } from "../../../common/actions.js";
import type { ResolvedKeybinding } from "../../../common/keybindings.js";
import type { IContextMenuProvider } from "../../contextmenu.js";
import { ActionViewItem, BaseActionViewItem, type IActionViewItemOptions, type IBaseActionViewItemOptions } from "../actionbar/actionViewItems.js";
import type { IActionViewItemProvider } from "../actionbar/actionbar.js";
import type { AnchorAlignment } from "../contextview/contextview.js";
import { type IActionProvider } from "./dropdown.js";
import "./dropdown.css";
export interface IKeybindingProvider {
    (action: IAction): ResolvedKeybinding | undefined;
}
export interface IAnchorAlignmentProvider {
    (): AnchorAlignment;
}
export interface IDropdownMenuActionViewItemOptions extends IBaseActionViewItemOptions {
    readonly actionViewItemProvider?: IActionViewItemProvider;
    readonly keybindingProvider?: IKeybindingProvider;
    readonly actionRunner?: IActionRunner;
    readonly classNames?: string[] | string;
    readonly anchorAlignmentProvider?: IAnchorAlignmentProvider;
    readonly menuAsChild?: boolean;
    readonly skipTelemetry?: boolean;
}
export declare class DropdownMenuActionViewItem extends BaseActionViewItem {
    private menuActionsOrProvider;
    private dropdownMenu;
    private contextMenuProvider;
    private actionItem;
    private _onDidChangeVisibility;
    readonly onDidChangeVisibility: import("../../../common/event.js").Event<boolean>;
    protected readonly options: IDropdownMenuActionViewItemOptions;
    constructor(action: IAction, menuActionsOrProvider: readonly IAction[] | IActionProvider, contextMenuProvider: IContextMenuProvider, options?: IDropdownMenuActionViewItemOptions);
    render(container: HTMLElement): void;
    protected getTooltip(): string | undefined;
    setActionContext(newContext: unknown): void;
    show(): void;
    protected updateEnabled(): void;
}
export interface IActionWithDropdownActionViewItemOptions extends IActionViewItemOptions {
    readonly menuActionsOrProvider: readonly IAction[] | IActionProvider;
    readonly menuActionClassNames?: string[];
}
export declare class ActionWithDropdownActionViewItem extends ActionViewItem {
    private readonly contextMenuProvider;
    protected dropdownMenuActionViewItem: DropdownMenuActionViewItem | undefined;
    constructor(context: unknown, action: IAction, options: IActionWithDropdownActionViewItemOptions, contextMenuProvider: IContextMenuProvider);
    render(container: HTMLElement): void;
    blur(): void;
    setFocusable(focusable: boolean): void;
}