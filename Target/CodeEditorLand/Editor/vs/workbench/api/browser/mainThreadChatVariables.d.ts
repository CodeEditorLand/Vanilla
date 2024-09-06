import { IChatVariableResolverProgressDto, MainThreadChatVariablesShape } from "vs/workbench/api/common/extHost.protocol";
import { IChatVariableData, IChatVariablesService } from "vs/workbench/contrib/chat/common/chatVariables";
import { IExtHostContext } from "vs/workbench/services/extensions/common/extHostCustomers";
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
