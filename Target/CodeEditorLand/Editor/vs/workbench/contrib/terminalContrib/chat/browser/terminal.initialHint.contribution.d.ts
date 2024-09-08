import type { ITerminalAddon, Terminal as RawXtermTerminal } from "@xterm/xterm";
import { Event } from "../../../../../base/common/event.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { type ITerminalCapabilityStore } from "../../../../../platform/terminal/common/capabilities/capabilities.js";
import { ITerminalEditorService, ITerminalGroupService, type IDetachedTerminalInstance, type ITerminalContribution, type ITerminalInstance, type IXtermTerminal } from "../../../terminal/browser/terminal.js";
import type { TerminalWidgetManager } from "../../../terminal/browser/widgets/widgetManager.js";
import type { ITerminalProcessInfo, ITerminalProcessManager } from "../../../terminal/common/terminal.js";
import "./media/terminalInitialHint.css";
import { IStorageService } from "../../../../../platform/storage/common/storage.js";
import { IChatAgentService, type IChatAgent } from "../../../chat/common/chatAgents.js";
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
    constructor(_instance: Pick<ITerminalInstance, "capabilities" | "shellLaunchConfig"> | IDetachedTerminalInstance, processManager: ITerminalProcessManager | ITerminalProcessInfo | undefined, widgetManager: TerminalWidgetManager | undefined, _instantiationService: IInstantiationService, _configurationService: IConfigurationService, _terminalGroupService: ITerminalGroupService, _terminalEditorService: ITerminalEditorService, _chatAgentService: IChatAgentService, _storageService: IStorageService);
    xtermOpen(xterm: IXtermTerminal & {
        raw: RawXtermTerminal;
    }): void;
    private _createHint;
}
