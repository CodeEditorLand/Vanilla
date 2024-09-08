import { type IAction } from "../../../base/common/actions.js";
import { ICommandService } from "../../commands/common/commands.js";
import { type ContextKeyExpression, IContextKeyService } from "../../contextkey/common/contextkey.js";
import { IKeybindingService } from "../../keybinding/common/keybinding.js";
import { IStorageService } from "../../storage/common/storage.js";
import { type IMenu, type IMenuActionOptions, type IMenuCreateOptions, type IMenuService, type MenuId, MenuItemAction, SubmenuItemAction } from "./actions.js";
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
