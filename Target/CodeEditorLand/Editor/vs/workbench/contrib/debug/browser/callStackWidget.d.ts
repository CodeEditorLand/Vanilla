import { type CancellationToken } from "../../../../base/common/cancellation.js";
import { Disposable, type IDisposable } from "../../../../base/common/lifecycle.js";
import { type IObservable, type ISettableObservable } from "../../../../base/common/observable.js";
import type { ThemeIcon } from "../../../../base/common/themables.js";
import type { URI } from "../../../../base/common/uri.js";
import "./media/callStackWidget.css";
import type { ICodeEditor } from "../../../../editor/browser/editorBrowser.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
export declare class CallStackFrame {
    readonly name: string;
    readonly source?: URI | undefined;
    readonly line: number;
    readonly column: number;
    constructor(name: string, source?: URI | undefined, line?: number, column?: number);
}
export declare class SkippedCallFrames {
    readonly label: string;
    readonly load: (token: CancellationToken) => Promise<AnyStackFrame[]>;
    constructor(label: string, load: (token: CancellationToken) => Promise<AnyStackFrame[]>);
}
export declare abstract class CustomStackFrame {
    readonly showHeader: ISettableObservable<boolean, void>;
    abstract readonly height: IObservable<number>;
    abstract readonly label: string;
    icon?: ThemeIcon;
    abstract render(container: HTMLElement): IDisposable;
    renderActions?(container: HTMLElement): IDisposable;
}
export type AnyStackFrame = SkippedCallFrames | CallStackFrame | CustomStackFrame;
/**
 * A reusable widget that displays a call stack as a series of editors. Note
 * that this both used in debug's exception widget as well as in the testing
 * call stack view.
 */
export declare class CallStackWidget extends Disposable {
    private readonly list;
    private readonly layoutEmitter;
    private readonly currentFramesDs;
    private cts?;
    constructor(container: HTMLElement, containingEditor: ICodeEditor | undefined, instantiationService: IInstantiationService);
    /** Replaces the call frames display in the view. */
    setFrames(frames: AnyStackFrame[]): void;
    layout(height?: number, width?: number): void;
    collapseAll(): void;
    private loadFrame;
    private mapFrames;
}
