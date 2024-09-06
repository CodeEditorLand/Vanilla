import { AriaRole } from "vs/base/browser/ui/aria/aria";
import { IListAccessibilityProvider } from "vs/base/browser/ui/list/listWidget";
import { IAccessibleViewService } from "vs/platform/accessibility/browser/accessibleView";
import { ChatTreeItem } from "vs/workbench/contrib/chat/browser/chat";
export declare class ChatAccessibilityProvider implements IListAccessibilityProvider<ChatTreeItem> {
    private readonly _accessibleViewService;
    constructor(_accessibleViewService: IAccessibleViewService);
    getWidgetRole(): AriaRole;
    getRole(element: ChatTreeItem): AriaRole | undefined;
    getWidgetAriaLabel(): string;
    getAriaLabel(element: ChatTreeItem): string;
    private _getLabelWithCodeBlockCount;
}
