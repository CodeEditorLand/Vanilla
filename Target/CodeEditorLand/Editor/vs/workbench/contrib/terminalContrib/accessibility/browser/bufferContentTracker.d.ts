import type { Terminal } from "@xterm/xterm";
import { Disposable } from "vs/base/common/lifecycle";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { ITerminalLogService } from "vs/platform/terminal/common/terminal";
import { IXtermTerminal } from "vs/workbench/contrib/terminal/browser/terminal";
export declare class BufferContentTracker extends Disposable {
    private readonly _xterm;
    private readonly _logService;
    private readonly _configurationService;
    /**
     * Marks the last part of the buffer that was cached
     */
    private _lastCachedMarker;
    /**
     * The number of wrapped lines in the viewport when the last cached marker was set
     */
    private _priorEditorViewportLineCount;
    private _lines;
    get lines(): string[];
    bufferToEditorLineMapping: Map<number, number>;
    constructor(_xterm: Pick<IXtermTerminal, "getFont"> & {
        raw: Terminal;
    }, _logService: ITerminalLogService, _configurationService: IConfigurationService);
    reset(): void;
    update(): void;
    private _updateCachedContent;
    private _removeViewportContent;
    private _updateViewportContent;
}
