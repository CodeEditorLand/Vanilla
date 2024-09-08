import { Disposable, type IDisposable } from "../../../../../base/common/lifecycle.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import type { IChatProgressRenderableResponseContent } from "../../common/chatModel.js";
import { type IChatConfirmation, IChatService } from "../../common/chatService.js";
import type { IChatContentPart, IChatContentPartRenderContext } from "./chatContentParts.js";
export declare class ChatConfirmationContentPart extends Disposable implements IChatContentPart {
    private readonly instantiationService;
    private readonly chatService;
    readonly domNode: HTMLElement;
    private readonly _onDidChangeHeight;
    readonly onDidChangeHeight: import("../../../../../base/common/event.js").Event<void>;
    constructor(confirmation: IChatConfirmation, context: IChatContentPartRenderContext, instantiationService: IInstantiationService, chatService: IChatService);
    hasSameContent(other: IChatProgressRenderableResponseContent): boolean;
    addDisposable(disposable: IDisposable): void;
}
