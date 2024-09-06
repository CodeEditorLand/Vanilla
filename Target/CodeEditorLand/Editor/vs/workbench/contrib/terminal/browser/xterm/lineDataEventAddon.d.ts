import type { ITerminalAddon, Terminal as XTermTerminal } from "@xterm/xterm";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { OperatingSystem } from "../../../../../base/common/platform.js";
/**
 * Provides extensions to the xterm object in a modular, testable way.
 */
export declare class LineDataEventAddon extends Disposable implements ITerminalAddon {
    private readonly _initializationPromise?;
    private _xterm?;
    private _isOsSet;
    private readonly _onLineData;
    readonly onLineData: import("../../../../../base/common/event.js").Event<string>;
    constructor(_initializationPromise?: Promise<void> | undefined);
    activate(xterm: XTermTerminal): Promise<void>;
    setOperatingSystem(os: OperatingSystem): void;
    private _sendLineData;
}
