import { MarkdownString } from "vs/base/common/htmlContent";
import { IKeybindingService } from "vs/platform/keybinding/common/keybinding";
import { IPickerQuickAccessItem } from "vs/platform/quickinput/browser/pickerQuickAccess";
export declare function resolveContentAndKeybindingItems(keybindingService: IKeybindingService, value?: string): {
    content: MarkdownString;
    configureKeybindingItems: IPickerQuickAccessItem[] | undefined;
    configuredKeybindingItems: IPickerQuickAccessItem[] | undefined;
} | undefined;
