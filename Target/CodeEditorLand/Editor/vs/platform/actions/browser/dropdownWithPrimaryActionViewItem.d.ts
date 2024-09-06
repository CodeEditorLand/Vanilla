import { BaseActionViewItem } from "vs/base/browser/ui/actionbar/actionViewItems";
import { IHoverDelegate } from "vs/base/browser/ui/hover/hoverDelegate";
import { IAction, IActionRunner } from "vs/base/common/actions";
import { Event } from "vs/base/common/event";
import { ResolvedKeybinding } from "vs/base/common/keybindings";
import { IAccessibilityService } from "vs/platform/accessibility/common/accessibility";
import { MenuItemAction } from "vs/platform/actions/common/actions";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IContextMenuService } from "vs/platform/contextview/browser/contextView";
import { IKeybindingService } from "vs/platform/keybinding/common/keybinding";
import { INotificationService } from "vs/platform/notification/common/notification";
import { IThemeService } from "vs/platform/theme/common/themeService";
export interface IDropdownWithPrimaryActionViewItemOptions {
    actionRunner?: IActionRunner;
    getKeyBinding?: (action: IAction) => ResolvedKeybinding | undefined;
    hoverDelegate?: IHoverDelegate;
    menuAsChild?: boolean;
}
export declare class DropdownWithPrimaryActionViewItem extends BaseActionViewItem {
    private readonly _contextMenuProvider;
    private readonly _options;
    private _primaryAction;
    private _dropdown;
    private _container;
    private _dropdownContainer;
    get onDidChangeDropdownVisibility(): Event<boolean>;
    constructor(primaryAction: MenuItemAction, dropdownAction: IAction, dropdownMenuActions: IAction[], className: string, _contextMenuProvider: IContextMenuService, _options: IDropdownWithPrimaryActionViewItemOptions | undefined, _keybindingService: IKeybindingService, _notificationService: INotificationService, _contextKeyService: IContextKeyService, _themeService: IThemeService, _accessibilityService: IAccessibilityService);
    setActionContext(newContext: unknown): void;
    render(container: HTMLElement): void;
    focus(fromRight?: boolean): void;
    blur(): void;
    setFocusable(focusable: boolean): void;
    protected updateEnabled(): void;
    update(dropdownAction: IAction, dropdownMenuActions: IAction[], dropdownIcon?: string): void;
    dispose(): void;
}
