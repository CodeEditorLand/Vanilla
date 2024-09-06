import { IDisposable } from "vs/base/common/lifecycle";
import { ICommandService } from "vs/platform/commands/common/commands";
import { IHoverService } from "vs/platform/hover/browser/hover";
import { IInstantiationService, ServicesAccessor } from "vs/platform/instantiation/common/instantiation";
import { IKeybindingService } from "vs/platform/keybinding/common/keybinding";
import { ILabelService } from "vs/platform/label/common/label";
import { ILogService } from "vs/platform/log/common/log";
import { IChatWidgetService } from "vs/workbench/contrib/chat/browser/chat";
import { IChatAgentCommand, IChatAgentData, IChatAgentService } from "vs/workbench/contrib/chat/common/chatAgents";
import { IParsedChatRequest } from "vs/workbench/contrib/chat/common/chatParserTypes";
import { IChatService } from "vs/workbench/contrib/chat/common/chatService";
import { IChatVariablesService } from "vs/workbench/contrib/chat/common/chatVariables";
import { ILanguageModelToolsService } from "vs/workbench/contrib/chat/common/languageModelToolsService";
export declare function agentToMarkdown(agent: IChatAgentData, isClickable: boolean, accessor: ServicesAccessor): string;
export declare function agentSlashCommandToMarkdown(agent: IChatAgentData, command: IChatAgentCommand): string;
export declare class ChatMarkdownDecorationsRenderer {
    private readonly keybindingService;
    private readonly labelService;
    private readonly logService;
    private readonly chatAgentService;
    private readonly instantiationService;
    private readonly hoverService;
    private readonly chatService;
    private readonly chatWidgetService;
    private readonly commandService;
    private readonly chatVariablesService;
    private readonly toolsService;
    constructor(keybindingService: IKeybindingService, labelService: ILabelService, logService: ILogService, chatAgentService: IChatAgentService, instantiationService: IInstantiationService, hoverService: IHoverService, chatService: IChatService, chatWidgetService: IChatWidgetService, commandService: ICommandService, chatVariablesService: IChatVariablesService, toolsService: ILanguageModelToolsService);
    convertParsedRequestToMarkdown(parsedRequest: IParsedChatRequest): string;
    private genericDecorationToMarkdown;
    walkTreeAndAnnotateReferenceLinks(element: HTMLElement): IDisposable;
    private renderAgentWidget;
    private renderSlashCommandWidget;
    private renderFileWidget;
    private renderResourceWidget;
    private injectKeybindingHint;
}