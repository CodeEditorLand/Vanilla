import type { AriaRole } from "../../../../base/browser/ui/aria/aria.js";
import type { IListAccessibilityProvider } from "../../../../base/browser/ui/list/listWidget.js";
import { IAccessibleViewService } from "../../../../platform/accessibility/browser/accessibleView.js";
import type { ChatTreeItem } from "./chat.js";
export declare class ChatAccessibilityProvider implements IListAccessibilityProvider<ChatTreeItem> {
    private readonly _accessibleViewService;
    constructor(_accessibleViewService: IAccessibleViewService);
    getWidgetRole(): AriaRole;
    getRole(element: ChatTreeItem): AriaRole | undefined;
    getWidgetAriaLabel(): string;
    getAriaLabel(element: ChatTreeItem): string;
    private _getLabelWithCodeBlockCount;
}
