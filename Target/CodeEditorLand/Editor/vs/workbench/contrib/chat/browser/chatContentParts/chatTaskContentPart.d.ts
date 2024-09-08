import { Event } from "../../../../../base/common/event.js";
import { Disposable, type IDisposable } from "../../../../../base/common/lifecycle.js";
import type { MarkdownRenderer } from "../../../../../editor/browser/widget/markdownRenderer/browser/markdownRenderer.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import type { IChatProgressRenderableResponseContent } from "../../common/chatModel.js";
import type { IChatTask } from "../../common/chatService.js";
import type { IChatContentPart, IChatContentPartRenderContext } from "./chatContentParts.js";
import { type CollapsibleListPool } from "./chatReferencesContentPart.js";
export declare class ChatTaskContentPart extends Disposable implements IChatContentPart {
    private readonly task;
    readonly domNode: HTMLElement;
    readonly onDidChangeHeight: Event<void>;
    constructor(task: IChatTask, contentReferencesListPool: CollapsibleListPool, renderer: MarkdownRenderer, context: IChatContentPartRenderContext, instantiationService: IInstantiationService);
    hasSameContent(other: IChatProgressRenderableResponseContent): boolean;
    addDisposable(disposable: IDisposable): void;
}
