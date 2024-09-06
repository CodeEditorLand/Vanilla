import { Disposable } from "vs/base/common/lifecycle";
import { MarkdownRenderer } from "vs/editor/browser/widget/markdownRenderer/browser/markdownRenderer";
import { ChatTreeItem } from "vs/workbench/contrib/chat/browser/chat";
import { IChatContentPart, IChatContentPartRenderContext } from "vs/workbench/contrib/chat/browser/chatContentParts/chatContentParts";
import { IChatProgressMessage, IChatTask } from "vs/workbench/contrib/chat/common/chatService";
import { IChatRendererContent } from "vs/workbench/contrib/chat/common/chatViewModel";
export declare class ChatProgressContentPart extends Disposable implements IChatContentPart {
    readonly domNode: HTMLElement;
    private readonly showSpinner;
    constructor(progress: IChatProgressMessage | IChatTask, renderer: MarkdownRenderer, context: IChatContentPartRenderContext, forceShowSpinner?: boolean, forceShowMessage?: boolean);
    hasSameContent(other: IChatRendererContent, followingContent: IChatRendererContent[], element: ChatTreeItem): boolean;
}
