import { IDisposable } from "vs/base/common/lifecycle";
import { ILogService } from "vs/platform/log/common/log";
import { ITerminalCommandSelector } from "vs/platform/terminal/common/terminal";
import { ITerminalQuickFixProvider, ITerminalQuickFixService } from "vs/workbench/contrib/terminalContrib/quickFix/browser/quickFix";
export declare class TerminalQuickFixService implements ITerminalQuickFixService {
    private readonly _logService;
    _serviceBrand: undefined;
    private _selectors;
    private _providers;
    get providers(): Map<string, ITerminalQuickFixProvider>;
    private readonly _onDidRegisterProvider;
    readonly onDidRegisterProvider: any;
    private readonly _onDidRegisterCommandSelector;
    readonly onDidRegisterCommandSelector: any;
    private readonly _onDidUnregisterProvider;
    readonly onDidUnregisterProvider: any;
    readonly extensionQuickFixes: Promise<Array<ITerminalCommandSelector>>;
    constructor(_logService: ILogService);
    registerCommandSelector(selector: ITerminalCommandSelector): void;
    registerQuickFixProvider(id: string, provider: ITerminalQuickFixProvider): IDisposable;
}
