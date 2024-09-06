import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IChatAgentService } from "vs/workbench/contrib/chat/common/chatAgents";
export declare class TerminalChatEnabler {
    static Id: string;
    private readonly _ctxHasProvider;
    private readonly _store;
    constructor(contextKeyService: IContextKeyService, chatAgentService: IChatAgentService);
    dispose(): void;
}
