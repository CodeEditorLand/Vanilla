import type { Terminal as RawXtermTerminal } from "@xterm/xterm";
import { Disposable } from "vs/base/common/lifecycle";
import "vs/css!./media/stickyScroll";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IKeybindingService } from "vs/platform/keybinding/common/keybinding";
import { ITerminalContribution, ITerminalInstance, IXtermTerminal } from "vs/workbench/contrib/terminal/browser/terminal";
import { TerminalWidgetManager } from "vs/workbench/contrib/terminal/browser/widgets/widgetManager";
import { ITerminalProcessInfo, ITerminalProcessManager } from "vs/workbench/contrib/terminal/common/terminal";
export declare class TerminalStickyScrollContribution extends Disposable implements ITerminalContribution {
    private readonly _instance;
    private readonly _configurationService;
    private readonly _contextKeyService;
    private readonly _instantiationService;
    private readonly _keybindingService;
    static readonly ID = "terminal.stickyScroll";
    static get(instance: ITerminalInstance): TerminalStickyScrollContribution | null;
    private _xterm?;
    private readonly _overlay;
    private readonly _enableListeners;
    private readonly _disableListeners;
    constructor(_instance: ITerminalInstance, processManager: ITerminalProcessManager | ITerminalProcessInfo, widgetManager: TerminalWidgetManager, _configurationService: IConfigurationService, _contextKeyService: IContextKeyService, _instantiationService: IInstantiationService, _keybindingService: IKeybindingService);
    xtermReady(xterm: IXtermTerminal & {
        raw: RawXtermTerminal;
    }): void;
    xtermOpen(xterm: IXtermTerminal & {
        raw: RawXtermTerminal;
    }): void;
    hideLock(): void;
    hideUnlock(): void;
    private _refreshState;
    private _tryEnable;
    private _tryDisable;
    private _shouldBeEnabled;
}
