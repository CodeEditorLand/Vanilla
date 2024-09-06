import { Disposable } from "vs/base/common/lifecycle";
import { IAccessibleViewContentProvider } from "vs/platform/accessibility/browser/accessibleView";
import { IAccessibleViewImplentation } from "vs/platform/accessibility/browser/accessibleViewRegistry";
import { ServicesAccessor } from "vs/platform/instantiation/common/instantiation";
import { ChatTreeItem, IChatWidget } from "vs/workbench/contrib/chat/browser/chat";
export declare class ChatResponseAccessibleView implements IAccessibleViewImplentation {
    readonly priority = 100;
    readonly name = "panelChat";
    readonly type: any;
    readonly when: any;
    getProvider(accessor: ServicesAccessor): ChatResponseAccessibleProvider | undefined;
}
declare class ChatResponseAccessibleProvider extends Disposable implements IAccessibleViewContentProvider {
    private readonly _widget;
    private readonly _chatInputFocused;
    private _focusedItem;
    constructor(_widget: IChatWidget, item: ChatTreeItem, _chatInputFocused: boolean);
    readonly id: any;
    readonly verbositySettingKey: any;
    readonly options: {
        type: any;
    };
    provideContent(): string;
    private _getContent;
    onClose(): void;
    provideNextContent(): string | undefined;
    providePreviousContent(): string | undefined;
}
export {};
