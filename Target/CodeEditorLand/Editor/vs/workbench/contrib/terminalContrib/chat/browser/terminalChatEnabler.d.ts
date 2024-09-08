import { IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { IChatAgentService } from "../../../chat/common/chatAgents.js";
export declare class TerminalChatEnabler {
    static Id: string;
    private readonly _ctxHasProvider;
    private readonly _store;
    constructor(contextKeyService: IContextKeyService, chatAgentService: IChatAgentService);
    dispose(): void;
}
