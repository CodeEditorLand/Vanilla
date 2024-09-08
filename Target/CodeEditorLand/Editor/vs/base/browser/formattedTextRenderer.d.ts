import type { DisposableStore } from "../common/lifecycle.js";
import type { IKeyboardEvent } from "./keyboardEvent.js";
import type { IMouseEvent } from "./mouseEvent.js";
export interface IContentActionHandler {
    callback: (content: string, event: IMouseEvent | IKeyboardEvent) => void;
    readonly disposables: DisposableStore;
}
export interface FormattedTextRenderOptions {
    readonly className?: string;
    readonly inline?: boolean;
    readonly actionHandler?: IContentActionHandler;
    readonly renderCodeSegments?: boolean;
}
export declare function renderText(text: string, options?: FormattedTextRenderOptions): HTMLElement;
export declare function renderFormattedText(formattedText: string, options?: FormattedTextRenderOptions): HTMLElement;
export declare function createElement(options: FormattedTextRenderOptions): HTMLElement;
