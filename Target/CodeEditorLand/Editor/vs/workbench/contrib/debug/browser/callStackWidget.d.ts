import { CancellationToken } from "vs/base/common/cancellation";
import { Disposable, IDisposable } from "vs/base/common/lifecycle";
import { IObservable } from "vs/base/common/observable";
import { ThemeIcon } from "vs/base/common/themables";
import "vs/css!./media/callStackWidget";
import { ICodeEditor } from "vs/editor/browser/editorBrowser";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
export declare class CallStackFrame {
    readonly name: string;
    readonly source?: any;
    readonly line: number;
    readonly column: number;
    constructor(name: string, source?: any, line?: number, column?: number);
}
export declare class SkippedCallFrames {
    readonly label: string;
    readonly load: (token: CancellationToken) => Promise<AnyStackFrame[]>;
    constructor(label: string, load: (token: CancellationToken) => Promise<AnyStackFrame[]>);
}
export declare abstract class CustomStackFrame {
    readonly showHeader: any;
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
    private loadFrame;
    private mapFrames;
}
