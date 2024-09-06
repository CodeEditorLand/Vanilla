import { Disposable, IDisposable } from "vs/base/common/lifecycle";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IChatContentPart, IChatContentPartRenderContext } from "vs/workbench/contrib/chat/browser/chatContentParts/chatContentParts";
import { IChatProgressRenderableResponseContent } from "vs/workbench/contrib/chat/common/chatModel";
import { IChatConfirmation, IChatService } from "vs/workbench/contrib/chat/common/chatService";
export declare class ChatConfirmationContentPart extends Disposable implements IChatContentPart {
    private readonly instantiationService;
    private readonly chatService;
    readonly domNode: HTMLElement;
    private readonly _onDidChangeHeight;
    readonly onDidChangeHeight: any;
    constructor(confirmation: IChatConfirmation, context: IChatContentPartRenderContext, instantiationService: IInstantiationService, chatService: IChatService);
    hasSameContent(other: IChatProgressRenderableResponseContent): boolean;
    addDisposable(disposable: IDisposable): void;
}
