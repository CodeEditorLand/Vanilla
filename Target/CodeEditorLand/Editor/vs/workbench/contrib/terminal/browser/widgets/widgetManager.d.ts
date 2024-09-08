import type { IDisposable } from "../../../../../base/common/lifecycle.js";
import type { ITerminalWidget } from "./widgets.js";
export declare class TerminalWidgetManager implements IDisposable {
    private _container;
    private _attached;
    attachToElement(terminalWrapper: HTMLElement): void;
    dispose(): void;
    attachWidget(widget: ITerminalWidget): IDisposable | undefined;
}
