import { IChatVariablesService, type IChatVariableData } from "../../contrib/chat/common/chatVariables.js";
import { type IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { type IChatVariableResolverProgressDto, type MainThreadChatVariablesShape } from "../common/extHost.protocol.js";
export declare class MainThreadChatVariables implements MainThreadChatVariablesShape {
    private readonly _chatVariablesService;
    private readonly _proxy;
    private readonly _variables;
    private readonly _pendingProgress;
    constructor(extHostContext: IExtHostContext, _chatVariablesService: IChatVariablesService);
    dispose(): void;
    $registerVariable(handle: number, data: IChatVariableData): void;
    $handleProgressChunk(requestId: string, progress: IChatVariableResolverProgressDto): Promise<number | void>;
    $unregisterVariable(handle: number): void;
}
