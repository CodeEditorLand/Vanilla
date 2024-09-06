import { IChatRequestViewModel, IChatResponseViewModel } from "../../common/chatViewModel.js";
import { ChatViewPane } from "../chatViewPane.js";
export interface IChatViewTitleActionContext {
    chatView: ChatViewPane;
}
export declare function isChatViewTitleActionContext(obj: unknown): obj is IChatViewTitleActionContext;
export declare const CHAT_CATEGORY: import("../../../../../nls.js").ILocalizedString;
export declare const CHAT_OPEN_ACTION_ID = "workbench.action.chat.open";
export interface IChatViewOpenOptions {
    /**
     * The query for quick chat.
     */
    query: string;
    /**
     * Whether the query is partial and will await more input from the user.
     */
    isPartialQuery?: boolean;
    /**
     * Any previous chat requests and responses that should be shown in the chat view.
     */
    previousRequests?: IChatViewOpenRequestEntry[];
}
export interface IChatViewOpenRequestEntry {
    request: string;
    response: string;
}
export declare function registerChatActions(): void;
export declare function stringifyItem(item: IChatRequestViewModel | IChatResponseViewModel, includeName?: boolean): string;
