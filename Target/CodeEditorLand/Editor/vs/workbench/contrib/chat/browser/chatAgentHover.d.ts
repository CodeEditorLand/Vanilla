import { IManagedHoverOptions } from "vs/base/browser/ui/hover/hover";
import { Event } from "vs/base/common/event";
import { Disposable } from "vs/base/common/lifecycle";
import { ICommandService } from "vs/platform/commands/common/commands";
import { IChatAgentData, IChatAgentNameService, IChatAgentService } from "vs/workbench/contrib/chat/common/chatAgents";
import { IExtensionsWorkbenchService } from "vs/workbench/contrib/extensions/common/extensions";
export declare class ChatAgentHover extends Disposable {
    private readonly chatAgentService;
    private readonly extensionService;
    private readonly chatAgentNameService;
    readonly domNode: HTMLElement;
    private readonly icon;
    private readonly name;
    private readonly extensionName;
    private readonly publisherName;
    private readonly description;
    private readonly _onDidChangeContents;
    readonly onDidChangeContents: Event<void>;
    constructor(chatAgentService: IChatAgentService, extensionService: IExtensionsWorkbenchService, chatAgentNameService: IChatAgentNameService);
    setAgent(id: string): void;
}
export declare function getChatAgentHoverOptions(getAgent: () => IChatAgentData | undefined, commandService: ICommandService): IManagedHoverOptions;
