import type { ITerminalAddon } from "@xterm/headless";
import type { Terminal } from "@xterm/xterm";
import { IAction } from "vs/base/common/actions";
import { Emitter, Event } from "vs/base/common/event";
import { Disposable } from "vs/base/common/lifecycle";
import { URI } from "vs/base/common/uri";
import { IAccessibilitySignalService } from "vs/platform/accessibilitySignal/browser/accessibilitySignalService";
import { IActionWidgetService } from "vs/platform/actionWidget/browser/actionWidget";
import { ICommandService } from "vs/platform/commands/common/commands";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { ILabelService } from "vs/platform/label/common/label";
import { IOpenerService } from "vs/platform/opener/common/opener";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
import { ITerminalCapabilityStore, ITerminalCommand } from "vs/platform/terminal/common/capabilities/capabilities";
import { ITerminalCommandSelector } from "vs/platform/terminal/common/terminal";
import { ITerminalQuickFix, ITerminalQuickFixOptions, ITerminalQuickFixResolvedExtensionOptions, ITerminalQuickFixService, TerminalQuickFixType } from "vs/workbench/contrib/terminalContrib/quickFix/browser/quickFix";
import { IExtensionService } from "vs/workbench/services/extensions/common/extensions";
export interface ITerminalQuickFixAddon {
    showMenu(): void;
    onDidRequestRerunCommand: Event<{
        command: string;
        shouldExecute?: boolean;
    }>;
    /**
     * Registers a listener on onCommandFinished scoped to a particular command or regular
     * expression and provides a callback to be executed for commands that match.
     */
    registerCommandFinishedListener(options: ITerminalQuickFixOptions): void;
}
export declare class TerminalQuickFixAddon extends Disposable implements ITerminalAddon, ITerminalQuickFixAddon {
    private readonly _aliases;
    private readonly _capabilities;
    private readonly _quickFixService;
    private readonly _commandService;
    private readonly _configurationService;
    private readonly _accessibilitySignalService;
    private readonly _openerService;
    private readonly _telemetryService;
    private readonly _extensionService;
    private readonly _actionWidgetService;
    private readonly _labelService;
    private readonly _onDidRequestRerunCommand;
    readonly onDidRequestRerunCommand: any;
    private _terminal;
    private _commandListeners;
    private _quickFixes;
    private _decoration;
    private _currentRenderContext;
    private _lastQuickFixId;
    private _registeredSelectors;
    constructor(_aliases: string[][] | undefined, _capabilities: ITerminalCapabilityStore, _quickFixService: ITerminalQuickFixService, _commandService: ICommandService, _configurationService: IConfigurationService, _accessibilitySignalService: IAccessibilitySignalService, _openerService: IOpenerService, _telemetryService: ITelemetryService, _extensionService: IExtensionService, _actionWidgetService: IActionWidgetService, _labelService: ILabelService);
    activate(terminal: Terminal): void;
    showMenu(): void;
    registerCommandSelector(selector: ITerminalCommandSelector): void;
    registerCommandFinishedListener(options: ITerminalQuickFixOptions | ITerminalQuickFixResolvedExtensionOptions): void;
    private _registerCommandHandlers;
    /**
     * Resolves quick fixes, if any, based on the
     * @param command & its output
     */
    private _resolveQuickFixes;
    private _disposeQuickFix;
    /**
     * Registers a decoration with the quick fixes
     */
    private _registerQuickFixDecoration;
}
export interface ITerminalAction extends IAction {
    type: TerminalQuickFixType;
    kind?: "fix" | "explain";
    source: string;
    uri?: URI;
    command?: string;
    shouldExecute?: boolean;
}
export declare function getQuickFixesForCommand(aliases: string[][] | undefined, terminal: Terminal, terminalCommand: ITerminalCommand, quickFixOptions: Map<string, ITerminalQuickFixOptions[]>, commandService: ICommandService, openerService: IOpenerService, labelService: ILabelService, onDidRequestRerunCommand?: Emitter<{
    command: string;
    shouldExecute?: boolean;
}>, getResolvedFixes?: (selector: ITerminalQuickFixOptions, lines?: string[]) => Promise<ITerminalQuickFix | ITerminalQuickFix[] | undefined>): Promise<ITerminalAction[] | undefined>;
