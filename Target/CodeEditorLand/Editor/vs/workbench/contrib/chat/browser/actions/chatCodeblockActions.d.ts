import { ICodeBlockActionContext, ICodeCompareBlockActionContext } from "vs/workbench/contrib/chat/browser/codeBlockPart";
import { IChatResponseViewModel } from "vs/workbench/contrib/chat/common/chatViewModel";
export interface IChatCodeBlockActionContext extends ICodeBlockActionContext {
    element: IChatResponseViewModel;
}
export declare function isCodeBlockActionContext(thing: unknown): thing is ICodeBlockActionContext;
export declare function isCodeCompareBlockActionContext(thing: unknown): thing is ICodeCompareBlockActionContext;
export declare function registerChatCodeBlockActions(): void;
export declare function registerChatCodeCompareBlockActions(): void;
