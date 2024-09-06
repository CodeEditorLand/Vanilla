import { ChatAgentLocation, IChatAgentData, IChatAgentService } from "vs/workbench/contrib/chat/common/chatAgents";
import { IParsedChatRequest } from "vs/workbench/contrib/chat/common/chatParserTypes";
import { IChatSlashCommandService } from "vs/workbench/contrib/chat/common/chatSlashCommands";
import { IChatVariablesService } from "vs/workbench/contrib/chat/common/chatVariables";
import { ILanguageModelToolsService } from "vs/workbench/contrib/chat/common/languageModelToolsService";
export interface IChatParserContext {
    /** Used only as a disambiguator, when the query references an agent that has a duplicate with the same name. */
    selectedAgent?: IChatAgentData;
}
export declare class ChatRequestParser {
    private readonly agentService;
    private readonly variableService;
    private readonly slashCommandService;
    private readonly toolsService;
    constructor(agentService: IChatAgentService, variableService: IChatVariablesService, slashCommandService: IChatSlashCommandService, toolsService: ILanguageModelToolsService);
    parseChatRequest(sessionId: string, message: string, location?: ChatAgentLocation, context?: IChatParserContext): IParsedChatRequest;
    private tryToParseAgent;
    private tryToParseVariable;
    private tryToParseSlashCommand;
    private tryToParseDynamicVariable;
}
