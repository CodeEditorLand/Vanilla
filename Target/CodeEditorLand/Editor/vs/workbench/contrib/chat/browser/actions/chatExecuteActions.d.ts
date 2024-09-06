import { ServicesAccessor } from "vs/editor/browser/editorExtensions";
import { Action2 } from "vs/platform/actions/common/actions";
import { IChatWidget } from "vs/workbench/contrib/chat/browser/chat";
export interface IVoiceChatExecuteActionContext {
    readonly disableTimeout?: boolean;
}
export interface IChatExecuteActionContext {
    widget?: IChatWidget;
    inputValue?: string;
    voice?: IVoiceChatExecuteActionContext;
}
export declare class SubmitAction extends Action2 {
    static readonly ID = "workbench.action.chat.submit";
    constructor();
    run(accessor: ServicesAccessor, ...args: any[]): void;
}
export declare class ChatSubmitSecondaryAgentAction extends Action2 {
    static readonly ID = "workbench.action.chat.submitSecondaryAgent";
    constructor();
    run(accessor: ServicesAccessor, ...args: any[]): void;
}
export declare class CancelAction extends Action2 {
    static readonly ID = "workbench.action.chat.cancel";
    constructor();
    run(accessor: ServicesAccessor, ...args: any[]): void;
}
export declare function registerChatExecuteActions(): void;
