import * as DOM from "vs/base/browser/dom";
import { IActionViewItemProvider } from "vs/base/browser/ui/actionbar/actionbar";
import { IActionProvider } from "vs/base/browser/ui/dropdown/dropdown";
import { IMenuEntryActionViewItemOptions, MenuEntryActionViewItem, SubmenuEntryActionViewItem } from "vs/platform/actions/browser/menuEntryActionViewItem";
import { SubmenuItemAction } from "vs/platform/actions/common/actions";
import { IContextMenuService } from "vs/platform/contextview/browser/contextView";
import { IHoverService } from "vs/platform/hover/browser/hover";
import { IKeybindingService } from "vs/platform/keybinding/common/keybinding";
import { IThemeService } from "vs/platform/theme/common/themeService";
export declare class CodiconActionViewItem extends MenuEntryActionViewItem {
    protected updateLabel(): void;
}
export declare class ActionViewWithLabel extends MenuEntryActionViewItem {
    private _actionLabel?;
    render(container: HTMLElement): void;
    protected updateLabel(): void;
}
export declare class UnifiedSubmenuActionView extends SubmenuEntryActionViewItem {
    readonly renderLabel: boolean;
    readonly subActionProvider: IActionProvider;
    readonly subActionViewItemProvider: IActionViewItemProvider | undefined;
    private readonly _hoverService;
    private _actionLabel?;
    private _hover?;
    private _primaryAction;
    constructor(action: SubmenuItemAction, options: IMenuEntryActionViewItemOptions | undefined, renderLabel: boolean, subActionProvider: IActionProvider, subActionViewItemProvider: IActionViewItemProvider | undefined, _keybindingService: IKeybindingService, _contextMenuService: IContextMenuService, _themeService: IThemeService, _hoverService: IHoverService);
    render(container: HTMLElement): void;
    onClick(event: DOM.EventLike, preserveFocus?: boolean): void;
    protected updateLabel(): void;
}
