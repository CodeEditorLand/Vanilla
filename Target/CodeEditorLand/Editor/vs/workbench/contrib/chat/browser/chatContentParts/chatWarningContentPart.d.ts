import { IMarkdownString } from "vs/base/common/htmlContent";
import { Disposable } from "vs/base/common/lifecycle";
import { MarkdownRenderer } from "vs/editor/browser/widget/markdownRenderer/browser/markdownRenderer";
import { IChatContentPart } from "vs/workbench/contrib/chat/browser/chatContentParts/chatContentParts";
import { IChatProgressRenderableResponseContent } from "vs/workbench/contrib/chat/common/chatModel";
export declare class ChatWarningContentPart extends Disposable implements IChatContentPart {
    readonly domNode: HTMLElement;
    constructor(kind: "info" | "warning" | "error", content: IMarkdownString, renderer: MarkdownRenderer);
    hasSameContent(other: IChatProgressRenderableResponseContent): boolean;
}
