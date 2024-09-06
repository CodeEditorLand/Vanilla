import { IButtonStyles } from "vs/base/browser/ui/button/button";
import { Disposable } from "vs/base/common/lifecycle";
import { ChatAgentLocation, IChatAgentService } from "vs/workbench/contrib/chat/common/chatAgents";
import { IChatFollowup } from "vs/workbench/contrib/chat/common/chatService";
export declare class ChatFollowups<T extends IChatFollowup> extends Disposable {
    private readonly location;
    private readonly options;
    private readonly clickHandler;
    private readonly chatAgentService;
    constructor(container: HTMLElement, followups: T[], location: ChatAgentLocation, options: IButtonStyles | undefined, clickHandler: (followup: T) => void, chatAgentService: IChatAgentService);
    private renderFollowup;
}
