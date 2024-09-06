import { Disposable } from "vs/base/common/lifecycle";
import { IKeybindingService } from "vs/platform/keybinding/common/keybinding";
export declare class ExtensionAccessibilityHelpDialogContribution extends Disposable {
    static ID: string;
    private _viewHelpDialogMap;
    constructor(keybindingService: IKeybindingService);
}
