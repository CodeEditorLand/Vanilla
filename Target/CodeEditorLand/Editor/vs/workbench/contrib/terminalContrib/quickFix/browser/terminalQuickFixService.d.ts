import { type IDisposable } from "../../../../../base/common/lifecycle.js";
import { ILogService } from "../../../../../platform/log/common/log.js";
import type { ITerminalCommandSelector } from "../../../../../platform/terminal/common/terminal.js";
import type { ITerminalQuickFixProvider, ITerminalQuickFixProviderSelector, ITerminalQuickFixService } from "./quickFix.js";
export declare class TerminalQuickFixService implements ITerminalQuickFixService {
    private readonly _logService;
    _serviceBrand: undefined;
    private _selectors;
    private _providers;
    get providers(): Map<string, ITerminalQuickFixProvider>;
    private readonly _onDidRegisterProvider;
    readonly onDidRegisterProvider: import("../../../../../base/common/event.js").Event<ITerminalQuickFixProviderSelector>;
    private readonly _onDidRegisterCommandSelector;
    readonly onDidRegisterCommandSelector: import("../../../../../base/common/event.js").Event<ITerminalCommandSelector>;
    private readonly _onDidUnregisterProvider;
    readonly onDidUnregisterProvider: import("../../../../../base/common/event.js").Event<string>;
    readonly extensionQuickFixes: Promise<Array<ITerminalCommandSelector>>;
    constructor(_logService: ILogService);
    registerCommandSelector(selector: ITerminalCommandSelector): void;
    registerQuickFixProvider(id: string, provider: ITerminalQuickFixProvider): IDisposable;
}
