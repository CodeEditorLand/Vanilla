import type { ITerminalAddon, Terminal as RawXtermTerminal } from "@xterm/xterm";
import { Event } from "vs/base/common/event";
import { Disposable } from "vs/base/common/lifecycle";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { ITerminalCapabilityStore } from "vs/platform/terminal/common/capabilities/capabilities";
import { IDetachedTerminalInstance, ITerminalContribution, ITerminalEditorService, ITerminalGroupService, ITerminalInstance, IXtermTerminal } from "vs/workbench/contrib/terminal/browser/terminal";
import { TerminalWidgetManager } from "vs/workbench/contrib/terminal/browser/widgets/widgetManager";
import { ITerminalProcessInfo, ITerminalProcessManager } from "vs/workbench/contrib/terminal/common/terminal";
import "vs/css!./media/terminalInitialHint";
import { IStorageService } from "vs/platform/storage/common/storage";
import { IChatAgent, IChatAgentService } from "vs/workbench/contrib/chat/common/chatAgents";
export declare class InitialHintAddon extends Disposable implements ITerminalAddon {
    private readonly _capabilities;
    private readonly _onDidChangeAgents;
    private readonly _onDidRequestCreateHint;
    get onDidRequestCreateHint(): Event<void>;
    private readonly _disposables;
    constructor(_capabilities: ITerminalCapabilityStore, _onDidChangeAgents: Event<IChatAgent | undefined>);
    activate(terminal: RawXtermTerminal): void;
}
export declare class TerminalInitialHintContribution extends Disposable implements ITerminalContribution {
    private readonly _instance;
    private readonly _instantiationService;
    private readonly _configurationService;
    private readonly _terminalGroupService;
    private readonly _terminalEditorService;
    private readonly _chatAgentService;
    private readonly _storageService;
    static readonly ID = "terminal.initialHint";
    private _addon;
    private _hintWidget;
    static get(instance: ITerminalInstance | IDetachedTerminalInstance): TerminalInitialHintContribution | null;
    private _decoration;
    private _xterm;
    constructor(_instance: Pick<ITerminalInstance, "capabilities"> | IDetachedTerminalInstance, processManager: ITerminalProcessManager | ITerminalProcessInfo | undefined, widgetManager: TerminalWidgetManager | undefined, _instantiationService: IInstantiationService, _configurationService: IConfigurationService, _terminalGroupService: ITerminalGroupService, _terminalEditorService: ITerminalEditorService, _chatAgentService: IChatAgentService, _storageService: IStorageService);
    xtermOpen(xterm: IXtermTerminal & {
        raw: RawXtermTerminal;
    }): void;
    private _createHint;
}
