import { ICommandService } from "vs/platform/commands/common/commands";
import { ILogService } from "vs/platform/log/common/log";
import { INotificationService } from "vs/platform/notification/common/notification";
import { IWorkbenchContribution } from "vs/workbench/common/contributions";
import { IChatAgentService } from "vs/workbench/contrib/chat/common/chatAgents";
import { IExtensionsWorkbenchService } from "vs/workbench/contrib/extensions/common/extensions";
export declare class ChatCompatibilityNotifier implements IWorkbenchContribution {
    static readonly ID = "workbench.contrib.chatCompatNotifier";
    constructor(extensionsWorkbenchService: IExtensionsWorkbenchService, notificationService: INotificationService, commandService: ICommandService);
}
export declare class ChatExtensionPointHandler implements IWorkbenchContribution {
    private readonly _chatAgentService;
    private readonly logService;
    static readonly ID = "workbench.contrib.chatExtensionPointHandler";
    private _viewContainer;
    private _participantRegistrationDisposables;
    constructor(_chatAgentService: IChatAgentService, logService: ILogService);
    private handleAndRegisterChatExtensions;
    private registerViewContainer;
    private hasRegisteredDefaultParticipantView;
    private registerDefaultParticipantView;
}
