import { Disposable } from "vs/base/common/lifecycle";
import { IChatWidget } from "vs/workbench/contrib/chat/browser/chat";
import { IChatWidgetContrib } from "vs/workbench/contrib/chat/browser/chatWidget";
import { IChatRequestVariableEntry } from "vs/workbench/contrib/chat/common/chatModel";
export declare class ChatContextAttachments extends Disposable implements IChatWidgetContrib {
    readonly widget: IChatWidget;
    private _attachedContext;
    static readonly ID = "chatContextAttachments";
    get id(): string;
    constructor(widget: IChatWidget);
    getInputState(): IChatRequestVariableEntry[];
    setInputState(s: any): void;
    getContext(): Set<any>;
    setContext(overwrite: boolean, ...attachments: IChatRequestVariableEntry[]): void;
    private _removeContext;
    private _clearAttachedContext;
}
