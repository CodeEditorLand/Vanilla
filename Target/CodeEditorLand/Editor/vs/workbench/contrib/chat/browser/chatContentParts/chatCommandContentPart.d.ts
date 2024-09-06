import { Disposable } from "vs/base/common/lifecycle";
import { ICommandService } from "vs/platform/commands/common/commands";
import { IChatContentPart, IChatContentPartRenderContext } from "vs/workbench/contrib/chat/browser/chatContentParts/chatContentParts";
import { IChatProgressRenderableResponseContent } from "vs/workbench/contrib/chat/common/chatModel";
import { IChatCommandButton } from "vs/workbench/contrib/chat/common/chatService";
export declare class ChatCommandButtonContentPart extends Disposable implements IChatContentPart {
    private readonly commandService;
    readonly domNode: HTMLElement;
    constructor(commandButton: IChatCommandButton, context: IChatContentPartRenderContext, commandService: ICommandService);
    hasSameContent(other: IChatProgressRenderableResponseContent): boolean;
}
