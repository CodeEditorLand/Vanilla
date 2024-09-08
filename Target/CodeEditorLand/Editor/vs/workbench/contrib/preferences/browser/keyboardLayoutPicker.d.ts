import { Disposable } from "../../../../base/common/lifecycle.js";
import { IKeyboardLayoutService } from "../../../../platform/keyboardLayout/common/keyboardLayout.js";
import { type IWorkbenchContribution } from "../../../common/contributions.js";
import { IStatusbarService } from "../../../services/statusbar/browser/statusbar.js";
export declare class KeyboardLayoutPickerContribution extends Disposable implements IWorkbenchContribution {
    private readonly keyboardLayoutService;
    private readonly statusbarService;
    static readonly ID = "workbench.contrib.keyboardLayoutPicker";
    private readonly pickerElement;
    constructor(keyboardLayoutService: IKeyboardLayoutService, statusbarService: IStatusbarService);
}
