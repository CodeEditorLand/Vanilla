import { Disposable } from "../../../../../base/common/lifecycle.js";
import { ICommandService } from "../../../../../platform/commands/common/commands.js";
import type { IChatProgressRenderableResponseContent } from "../../common/chatModel.js";
import type { IChatCommandButton } from "../../common/chatService.js";
import type { IChatContentPart, IChatContentPartRenderContext } from "./chatContentParts.js";
export declare class ChatCommandButtonContentPart extends Disposable implements IChatContentPart {
    private readonly commandService;
    readonly domNode: HTMLElement;
    constructor(commandButton: IChatCommandButton, context: IChatContentPartRenderContext, commandService: ICommandService);
    hasSameContent(other: IChatProgressRenderableResponseContent): boolean;
}