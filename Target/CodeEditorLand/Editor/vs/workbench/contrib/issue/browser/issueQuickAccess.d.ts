import { IMenuService } from "../../../../platform/actions/common/actions.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { PickerQuickAccessProvider, type FastAndSlowPicks, type IPickerQuickAccessItem, type Picks } from "../../../../platform/quickinput/browser/pickerQuickAccess.js";
import { IExtensionService } from "../../../services/extensions/common/extensions.js";
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
