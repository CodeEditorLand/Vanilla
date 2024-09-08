import { Disposable } from "../../../../../base/common/lifecycle.js";
import type { MarkdownRenderer } from "../../../../../editor/browser/widget/markdownRenderer/browser/markdownRenderer.js";
import type { IChatProgressMessage, IChatTask } from "../../common/chatService.js";
import { type IChatRendererContent } from "../../common/chatViewModel.js";
import type { ChatTreeItem } from "../chat.js";
import type { IChatContentPart, IChatContentPartRenderContext } from "./chatContentParts.js";
export declare class ChatProgressContentPart extends Disposable implements IChatContentPart {
    readonly domNode: HTMLElement;
    private readonly showSpinner;
    constructor(progress: IChatProgressMessage | IChatTask, renderer: MarkdownRenderer, context: IChatContentPartRenderContext, forceShowSpinner?: boolean, forceShowMessage?: boolean);
    hasSameContent(other: IChatRendererContent, followingContent: IChatRendererContent[], element: ChatTreeItem): boolean;
}
