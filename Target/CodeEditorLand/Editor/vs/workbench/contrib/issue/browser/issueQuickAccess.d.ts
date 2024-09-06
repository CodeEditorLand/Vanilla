import { IMenuService } from "vs/platform/actions/common/actions";
import { ICommandService } from "vs/platform/commands/common/commands";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IProductService } from "vs/platform/product/common/productService";
import { FastAndSlowPicks, IPickerQuickAccessItem, PickerQuickAccessProvider, Picks } from "vs/platform/quickinput/browser/pickerQuickAccess";
import { IExtensionService } from "vs/workbench/services/extensions/common/extensions";
export declare class IssueQuickAccess extends PickerQuickAccessProvider<IPickerQuickAccessItem> {
    private readonly menuService;
    private readonly contextKeyService;
    private readonly commandService;
    private readonly extensionService;
    private readonly productService;
    static PREFIX: string;
    constructor(menuService: IMenuService, contextKeyService: IContextKeyService, commandService: ICommandService, extensionService: IExtensionService, productService: IProductService);
    protected _getPicks(filter: string): Picks<IPickerQuickAccessItem> | FastAndSlowPicks<IPickerQuickAccessItem> | Promise<Picks<IPickerQuickAccessItem> | FastAndSlowPicks<IPickerQuickAccessItem>> | null;
    private _createPick;
}
