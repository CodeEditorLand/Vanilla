import type { IMarkdownString } from "../../../../../base/common/htmlContent.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import type { MarkdownRenderer } from "../../../../../editor/browser/widget/markdownRenderer/browser/markdownRenderer.js";
import type { IChatProgressRenderableResponseContent } from "../../common/chatModel.js";
import type { IChatContentPart } from "./chatContentParts.js";
export declare class ChatWarningContentPart extends Disposable implements IChatContentPart {
    readonly domNode: HTMLElement;
    constructor(kind: "info" | "warning" | "error", content: IMarkdownString, renderer: MarkdownRenderer);
    hasSameContent(other: IChatProgressRenderableResponseContent): boolean;
}