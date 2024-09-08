import { MarkdownString } from "../../../../base/common/htmlContent.js";
import type { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import type { IPickerQuickAccessItem } from "../../../../platform/quickinput/browser/pickerQuickAccess.js";
export declare function resolveContentAndKeybindingItems(keybindingService: IKeybindingService, value?: string): {
    content: MarkdownString;
    configureKeybindingItems: IPickerQuickAccessItem[] | undefined;
    configuredKeybindingItems: IPickerQuickAccessItem[] | undefined;
} | undefined;
