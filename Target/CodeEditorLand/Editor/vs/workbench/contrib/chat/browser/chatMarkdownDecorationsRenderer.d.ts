import { IDisposable } from "../../../../base/common/lifecycle.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { IHoverService } from "../../../../platform/hover/browser/hover.js";
import { IInstantiationService, ServicesAccessor } from "../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { ILabelService } from "../../../../platform/label/common/label.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { IChatAgentCommand, IChatAgentData, IChatAgentService } from "../common/chatAgents.js";
import { IParsedChatRequest } from "../common/chatParserTypes.js";
import { IChatService } from "../common/chatService.js";
import { IChatVariablesService } from "../common/chatVariables.js";
import { ILanguageModelToolsService } from "../common/languageModelToolsService.js";
import { IChatWidgetService } from "./chat.js";
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
    private readonly themeService;
    constructor(keybindingService: IKeybindingService, labelService: ILabelService, logService: ILogService, chatAgentService: IChatAgentService, instantiationService: IInstantiationService, hoverService: IHoverService, chatService: IChatService, chatWidgetService: IChatWidgetService, commandService: ICommandService, chatVariablesService: IChatVariablesService, toolsService: ILanguageModelToolsService, themeService: IThemeService);
    convertParsedRequestToMarkdown(parsedRequest: IParsedChatRequest): string;
    private genericDecorationToMarkdown;
    walkTreeAndAnnotateReferenceLinks(element: HTMLElement): IDisposable;
    private renderAgentWidget;
    private renderSlashCommandWidget;
    private renderFileWidget;
    private renderResourceWidget;
    private injectKeybindingHint;
}
