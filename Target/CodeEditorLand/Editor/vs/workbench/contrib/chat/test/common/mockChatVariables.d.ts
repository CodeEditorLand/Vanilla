import type { CancellationToken } from "../../../../../base/common/cancellation.js";
import type { IDisposable } from "../../../../../base/common/lifecycle.js";
import type { ChatAgentLocation } from "../../common/chatAgents.js";
import type { IChatModel, IChatRequestVariableData, IChatRequestVariableEntry } from "../../common/chatModel.js";
import type { IParsedChatRequest } from "../../common/chatParserTypes.js";
import type { IChatRequestVariableValue, IChatVariableData, IChatVariableResolver, IChatVariableResolverProgress, IChatVariablesService, IDynamicVariable } from "../../common/chatVariables.js";
export declare class MockChatVariablesService implements IChatVariablesService {
    _serviceBrand: undefined;
    registerVariable(data: IChatVariableData, resolver: IChatVariableResolver): IDisposable;
    getVariable(name: string): IChatVariableData | undefined;
    hasVariable(name: string): boolean;
    getVariables(): Iterable<Readonly<IChatVariableData>>;
    getDynamicVariables(sessionId: string): readonly IDynamicVariable[];
    resolveVariables(prompt: IParsedChatRequest, attachedContextVariables: IChatRequestVariableEntry[] | undefined, model: IChatModel, progress: (part: IChatVariableResolverProgress) => void, token: CancellationToken): Promise<IChatRequestVariableData>;
    attachContext(name: string, value: unknown, location: ChatAgentLocation): void;
    resolveVariable(variableName: string, promptText: string, model: IChatModel, progress: (part: IChatVariableResolverProgress) => void, token: CancellationToken): Promise<IChatRequestVariableValue>;
}
