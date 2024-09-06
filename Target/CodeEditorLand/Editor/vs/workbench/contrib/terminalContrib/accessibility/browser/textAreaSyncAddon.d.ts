import type { ITerminalAddon, Terminal } from "@xterm/xterm";
import { Disposable } from "vs/base/common/lifecycle";
import { IAccessibilityService } from "vs/platform/accessibility/common/accessibility";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { ITerminalCapabilityStore } from "vs/platform/terminal/common/capabilities/capabilities";
import { ITerminalLogService } from "vs/platform/terminal/common/terminal";
export declare class TextAreaSyncAddon extends Disposable implements ITerminalAddon {
    private readonly _capabilities;
    private readonly _accessibilityService;
    private readonly _configurationService;
    private readonly _logService;
    private _terminal;
    private readonly _listeners;
    activate(terminal: Terminal): void;
    constructor(_capabilities: ITerminalCapabilityStore, _accessibilityService: IAccessibilityService, _configurationService: IConfigurationService, _logService: ITerminalLogService);
    private _refreshListeners;
    private _shouldBeActive;
    private _sync;
}
