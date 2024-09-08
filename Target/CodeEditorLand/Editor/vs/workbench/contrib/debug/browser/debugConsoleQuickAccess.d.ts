import type { CancellationToken } from "../../../../base/common/cancellation.js";
import type { DisposableStore } from "../../../../base/common/lifecycle.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { PickerQuickAccessProvider, type FastAndSlowPicks, type IPickerQuickAccessItem, type Picks } from "../../../../platform/quickinput/browser/pickerQuickAccess.js";
import { IViewsService } from "../../../services/views/common/viewsService.js";
import { IDebugService } from "../common/debug.js";
export declare class DebugConsoleQuickAccess extends PickerQuickAccessProvider<IPickerQuickAccessItem> {
    private readonly _debugService;
    private readonly _viewsService;
    private readonly _commandService;
    constructor(_debugService: IDebugService, _viewsService: IViewsService, _commandService: ICommandService);
    protected _getPicks(filter: string, disposables: DisposableStore, token: CancellationToken): Picks<IPickerQuickAccessItem> | Promise<Picks<IPickerQuickAccessItem>> | FastAndSlowPicks<IPickerQuickAccessItem> | null;
    private _createPick;
}
