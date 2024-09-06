import { BaseActionViewItem } from "../../../base/browser/ui/actionbar/actionViewItems.js";
import { IHoverDelegate } from "../../../base/browser/ui/hover/hoverDelegate.js";
import { IAction, IActionRunner } from "../../../base/common/actions.js";
import { Event } from "../../../base/common/event.js";
import { ResolvedKeybinding } from "../../../base/common/keybindings.js";
import { IAccessibilityService } from "../../accessibility/common/accessibility.js";
import { IContextKeyService } from "../../contextkey/common/contextkey.js";
import { IContextMenuService } from "../../contextview/browser/contextView.js";
import { IKeybindingService } from "../../keybinding/common/keybinding.js";
import { INotificationService } from "../../notification/common/notification.js";
import { IThemeService } from "../../theme/common/themeService.js";
import { MenuItemAction } from "../common/actions.js";
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
