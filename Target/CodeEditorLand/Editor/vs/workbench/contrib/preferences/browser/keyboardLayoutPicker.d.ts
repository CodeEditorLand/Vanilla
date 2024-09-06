import { Disposable } from "vs/base/common/lifecycle";
import { IKeyboardLayoutService } from "vs/platform/keyboardLayout/common/keyboardLayout";
import { IWorkbenchContribution } from "vs/workbench/common/contributions";
import { IStatusbarService } from "vs/workbench/services/statusbar/browser/statusbar";
export declare class KeyboardLayoutPickerContribution extends Disposable implements IWorkbenchContribution {
    private readonly keyboardLayoutService;
    private readonly statusbarService;
    static readonly ID = "workbench.contrib.keyboardLayoutPicker";
    private readonly pickerElement;
    constructor(keyboardLayoutService: IKeyboardLayoutService, statusbarService: IStatusbarService);
}
