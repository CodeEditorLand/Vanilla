import { CancellationToken } from "vs/base/common/cancellation";
import { IDisposable } from "vs/base/common/lifecycle";
import { ThemeIcon } from "vs/base/common/themables";
import { URI } from "vs/base/common/uri";
import { IRange } from "vs/editor/common/core/range";
import { Location } from "vs/editor/common/languages";
import { ChatAgentLocation } from "vs/workbench/contrib/chat/common/chatAgents";
import { IChatModel, IChatRequestVariableData, IChatRequestVariableEntry } from "vs/workbench/contrib/chat/common/chatModel";
import { IParsedChatRequest } from "vs/workbench/contrib/chat/common/chatParserTypes";
import { IChatContentReference, IChatProgressMessage } from "vs/workbench/contrib/chat/common/chatService";
export interface IChatVariableData {
    id: string;
    name: string;
    icon?: ThemeIcon;
    fullName?: string;
    description: string;
    modelDescription?: string;
    isSlow?: boolean;
    canTakeArgument?: boolean;
}
export type IChatRequestVariableValue = string | URI | Location | unknown;
export type IChatVariableResolverProgress = IChatContentReference | IChatProgressMessage;
export interface IChatVariableResolver {
    (messageText: string, arg: string | undefined, model: IChatModel, progress: (part: IChatVariableResolverProgress) => void, token: CancellationToken): Promise<IChatRequestVariableValue | undefined>;
}
export declare const IChatVariablesService: any;
export interface IChatVariablesService {
    _serviceBrand: undefined;
    registerVariable(data: IChatVariableData, resolver: IChatVariableResolver): IDisposable;
    hasVariable(name: string): boolean;
    getVariable(name: string): IChatVariableData | undefined;
    getVariables(location: ChatAgentLocation): Iterable<Readonly<IChatVariableData>>;
    getDynamicVariables(sessionId: string): ReadonlyArray<IDynamicVariable>;
    attachContext(name: string, value: string | URI | Location | unknown, location: ChatAgentLocation): void;
    /**
     * Resolves all variables that occur in `prompt`
     */
    resolveVariables(prompt: IParsedChatRequest, attachedContextVariables: IChatRequestVariableEntry[] | undefined, model: IChatModel, progress: (part: IChatVariableResolverProgress) => void, token: CancellationToken): Promise<IChatRequestVariableData>;
    resolveVariable(variableName: string, promptText: string, model: IChatModel, progress: (part: IChatVariableResolverProgress) => void, token: CancellationToken): Promise<IChatRequestVariableValue | undefined>;
}
export interface IDynamicVariable {
    range: IRange;
    id: string;
    fullName?: string;
    icon?: ThemeIcon;
    prefix?: string;
    modelDescription?: string;
    data: IChatRequestVariableValue;
}
