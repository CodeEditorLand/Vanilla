import { Event } from "vs/base/common/event";
import { Disposable, IDisposable } from "vs/base/common/lifecycle";
import { MarkdownRenderer } from "vs/editor/browser/widget/markdownRenderer/browser/markdownRenderer";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IChatContentPart, IChatContentPartRenderContext } from "vs/workbench/contrib/chat/browser/chatContentParts/chatContentParts";
import { CollapsibleListPool } from "vs/workbench/contrib/chat/browser/chatContentParts/chatReferencesContentPart";
import { IChatProgressRenderableResponseContent } from "vs/workbench/contrib/chat/common/chatModel";
import { IChatTask } from "vs/workbench/contrib/chat/common/chatService";
export declare class ChatTaskContentPart extends Disposable implements IChatContentPart {
    private readonly task;
    readonly domNode: HTMLElement;
    readonly onDidChangeHeight: Event<void>;
    constructor(task: IChatTask, contentReferencesListPool: CollapsibleListPool, renderer: MarkdownRenderer, context: IChatContentPartRenderContext, instantiationService: IInstantiationService);
    hasSameContent(other: IChatProgressRenderableResponseContent): boolean;
    addDisposable(disposable: IDisposable): void;
}
