import { IAction } from "vs/base/common/actions";
import { IMenu, IMenuActionOptions, IMenuCreateOptions, IMenuService, MenuId, MenuItemAction, SubmenuItemAction } from "vs/platform/actions/common/actions";
import { ICommandService } from "vs/platform/commands/common/commands";
import { ContextKeyExpression, IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IKeybindingService } from "vs/platform/keybinding/common/keybinding";
import { IStorageService } from "vs/platform/storage/common/storage";
export declare class MenuService implements IMenuService {
    private readonly _commandService;
    private readonly _keybindingService;
    readonly _serviceBrand: undefined;
    private readonly _hiddenStates;
    constructor(_commandService: ICommandService, _keybindingService: IKeybindingService, storageService: IStorageService);
    createMenu(id: MenuId, contextKeyService: IContextKeyService, options?: IMenuCreateOptions): IMenu;
    getMenuActions(id: MenuId, contextKeyService: IContextKeyService, options?: IMenuActionOptions): [string, Array<MenuItemAction | SubmenuItemAction>][];
    getMenuContexts(id: MenuId): ReadonlySet<string>;
    resetHiddenStates(ids?: MenuId[]): void;
}
export declare function createConfigureKeybindingAction(commandService: ICommandService, keybindingService: IKeybindingService, commandId: string, when?: ContextKeyExpression | undefined, enabled?: boolean): IAction;
