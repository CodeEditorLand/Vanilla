import { Disposable } from "../../../../base/common/lifecycle.js";
import { AccessibleViewProviderId, AccessibleViewType, type IAccessibleViewContentProvider } from "../../../../platform/accessibility/browser/accessibleView.js";
import type { IAccessibleViewImplentation } from "../../../../platform/accessibility/browser/accessibleViewRegistry.js";
import type { ServicesAccessor } from "../../../../platform/instantiation/common/instantiation.js";
import { AccessibilityVerbositySettingId } from "../../accessibility/browser/accessibilityConfiguration.js";
import { type ChatTreeItem, type IChatWidget } from "./chat.js";
export declare class ChatResponseAccessibleView implements IAccessibleViewImplentation {
    readonly priority = 100;
    readonly name = "panelChat";
    readonly type = AccessibleViewType.View;
    readonly when: import("../../../../platform/contextkey/common/contextkey.js").RawContextKey<boolean>;
    getProvider(accessor: ServicesAccessor): ChatResponseAccessibleProvider | undefined;
}
declare class ChatResponseAccessibleProvider extends Disposable implements IAccessibleViewContentProvider {
    private readonly _widget;
    private readonly _chatInputFocused;
    private _focusedItem;
    constructor(_widget: IChatWidget, item: ChatTreeItem, _chatInputFocused: boolean);
    readonly id = AccessibleViewProviderId.Chat;
    readonly verbositySettingKey = AccessibilityVerbositySettingId.Chat;
    readonly options: {
        type: AccessibleViewType;
    };
    provideContent(): string;
    private _getContent;
    onClose(): void;
    provideNextContent(): string | undefined;
    providePreviousContent(): string | undefined;
}
export {};
