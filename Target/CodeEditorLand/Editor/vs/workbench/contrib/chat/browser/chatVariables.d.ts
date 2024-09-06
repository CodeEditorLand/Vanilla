import { CancellationToken } from "vs/base/common/cancellation";
import { Iterable } from "vs/base/common/iterator";
import { IDisposable } from "vs/base/common/lifecycle";
import { URI } from "vs/base/common/uri";
import { Location } from "vs/editor/common/languages";
import { IChatWidgetService } from "vs/workbench/contrib/chat/browser/chat";
import { ChatAgentLocation } from "vs/workbench/contrib/chat/common/chatAgents";
import { IChatModel, IChatRequestVariableData, IChatRequestVariableEntry } from "vs/workbench/contrib/chat/common/chatModel";
import { IParsedChatRequest } from "vs/workbench/contrib/chat/common/chatParserTypes";
import { IChatRequestVariableValue, IChatVariableData, IChatVariableResolver, IChatVariableResolverProgress, IChatVariablesService, IDynamicVariable } from "vs/workbench/contrib/chat/common/chatVariables";
import { ILanguageModelToolsService } from "vs/workbench/contrib/chat/common/languageModelToolsService";
import { IViewsService } from "vs/workbench/services/views/common/viewsService";
export declare class ChatVariablesService implements IChatVariablesService {
    private readonly chatWidgetService;
    private readonly viewsService;
    private readonly toolsService;
    _serviceBrand: undefined;
    private _resolver;
    constructor(chatWidgetService: IChatWidgetService, viewsService: IViewsService, toolsService: ILanguageModelToolsService);
    resolveVariables(prompt: IParsedChatRequest, attachedContextVariables: IChatRequestVariableEntry[] | undefined, model: IChatModel, progress: (part: IChatVariableResolverProgress) => void, token: CancellationToken): Promise<IChatRequestVariableData>;
    resolveVariable(variableName: string, promptText: string, model: IChatModel, progress: (part: IChatVariableResolverProgress) => void, token: CancellationToken): Promise<IChatRequestVariableValue | undefined>;
    hasVariable(name: string): boolean;
    getVariable(name: string): IChatVariableData | undefined;
    getVariables(location: ChatAgentLocation): Iterable<Readonly<IChatVariableData>>;
    getDynamicVariables(sessionId: string): ReadonlyArray<IDynamicVariable>;
    registerVariable(data: IChatVariableData, resolver: IChatVariableResolver): IDisposable;
    attachContext(name: string, value: string | URI | Location, location: ChatAgentLocation): Promise<void>;
}
