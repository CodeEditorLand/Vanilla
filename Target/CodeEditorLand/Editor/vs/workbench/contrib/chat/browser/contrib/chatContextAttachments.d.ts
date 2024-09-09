import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IChatWidget } from '../chat.js';
import { IChatWidgetContrib } from '../chatWidget.js';
import { IChatRequestVariableEntry } from '../../common/chatModel.js';
export declare class ChatContextAttachments extends Disposable implements IChatWidgetContrib {
    readonly widget: IChatWidget;
    private _attachedContext;
    static readonly ID = "chatContextAttachments";
    get id(): string;
    constructor(widget: IChatWidget);
    getInputState(): IChatRequestVariableEntry[];
    setInputState(s: any): void;
    getContext(): Set<string>;
    setContext(overwrite: boolean, ...attachments: IChatRequestVariableEntry[]): void;
    private _removeContext;
    private _clearAttachedContext;
}
