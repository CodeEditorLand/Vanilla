import type { CancellationToken } from "../../../../base/common/cancellation.js";
import type { IDisposable } from "../../../../base/common/lifecycle.js";
import type { ThemeIcon } from "../../../../base/common/themables.js";
import type { URI } from "../../../../base/common/uri.js";
import type { IRange } from "../../../../editor/common/core/range.js";
import type { Location } from "../../../../editor/common/languages.js";
import type { ChatAgentLocation } from "./chatAgents.js";
import type { IChatModel, IChatRequestVariableData, IChatRequestVariableEntry } from "./chatModel.js";
import type { IParsedChatRequest } from "./chatParserTypes.js";
import type { IChatContentReference, IChatProgressMessage } from "./chatService.js";
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
export declare const IChatVariablesService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IChatVariablesService>;
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
