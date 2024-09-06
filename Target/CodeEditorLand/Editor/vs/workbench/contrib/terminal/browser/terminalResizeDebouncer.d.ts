import { Disposable } from "vs/base/common/lifecycle";
import type { XtermTerminal } from "vs/workbench/contrib/terminal/browser/xterm/xtermTerminal";
export declare class TerminalResizeDebouncer extends Disposable {
    private readonly _isVisible;
    private readonly _getXterm;
    private readonly _resizeBothCallback;
    private readonly _resizeXCallback;
    private readonly _resizeYCallback;
    private _latestX;
    private _latestY;
    private readonly _resizeXJob;
    private readonly _resizeYJob;
    constructor(_isVisible: () => boolean, _getXterm: () => XtermTerminal | undefined, _resizeBothCallback: (cols: number, rows: number) => void, _resizeXCallback: (cols: number) => void, _resizeYCallback: (rows: number) => void);
    resize(cols: number, rows: number, immediate: boolean): Promise<void>;
    flush(): void;
    private _debounceResizeX;
}
