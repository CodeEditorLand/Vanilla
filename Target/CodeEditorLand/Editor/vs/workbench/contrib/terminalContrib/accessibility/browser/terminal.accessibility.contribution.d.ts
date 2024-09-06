import type { Terminal } from "@xterm/xterm";
import { Disposable } from "vs/base/common/lifecycle";
import { IAccessibleViewService, NavigationType } from "vs/platform/accessibility/browser/accessibleView";
import { IAccessibilitySignalService } from "vs/platform/accessibilitySignal/browser/accessibilitySignalService";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { ITerminalContribution, ITerminalInstance, ITerminalService, IXtermTerminal } from "vs/workbench/contrib/terminal/browser/terminal";
import { TerminalWidgetManager } from "vs/workbench/contrib/terminal/browser/widgets/widgetManager";
import { ITerminalProcessManager } from "vs/workbench/contrib/terminal/common/terminal";
export declare class TerminalAccessibleViewContribution extends Disposable implements ITerminalContribution {
    private readonly _instance;
    private readonly _accessibleViewService;
    private readonly _instantiationService;
    private readonly _terminalService;
    private readonly _configurationService;
    private readonly _contextKeyService;
    private readonly _accessibilitySignalService;
    static readonly ID = "terminal.accessibleBufferProvider";
    static get(instance: ITerminalInstance): TerminalAccessibleViewContribution | null;
    private _bufferTracker;
    private _bufferProvider;
    private _xterm;
    private readonly _onDidRunCommand;
    constructor(_instance: ITerminalInstance, processManager: ITerminalProcessManager, widgetManager: TerminalWidgetManager, _accessibleViewService: IAccessibleViewService, _instantiationService: IInstantiationService, _terminalService: ITerminalService, _configurationService: IConfigurationService, _contextKeyService: IContextKeyService, _accessibilitySignalService: IAccessibilitySignalService);
    xtermReady(xterm: IXtermTerminal & {
        raw: Terminal;
    }): void;
    private _updateCommandExecutedListener;
    private _isTerminalAccessibleViewOpen;
    show(): void;
    navigateToCommand(type: NavigationType): void;
    private _getCommandsWithEditorLine;
    private _getEditorLineForCommand;
}
export declare class TerminalAccessibilityHelpContribution extends Disposable {
    static ID: "terminalAccessibilityHelpContribution";
    constructor();
}
