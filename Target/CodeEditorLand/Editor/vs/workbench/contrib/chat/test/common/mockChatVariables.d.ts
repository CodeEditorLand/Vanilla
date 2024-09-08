import { CancellationToken } from '../../../../../base/common/cancellation.js';
import { IDisposable } from '../../../../../base/common/lifecycle.js';
import { ChatAgentLocation } from '../../common/chatAgents.js';
import { IChatModel, IChatRequestVariableData, IChatRequestVariableEntry } from '../../common/chatModel.js';
import { IParsedChatRequest } from '../../common/chatParserTypes.js';
import { IChatRequestVariableValue, IChatVariableData, IChatVariableResolver, IChatVariableResolverProgress, IChatVariablesService, IDynamicVariable } from '../../common/chatVariables.js';
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
