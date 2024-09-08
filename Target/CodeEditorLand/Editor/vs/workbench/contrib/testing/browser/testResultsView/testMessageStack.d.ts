import { Disposable } from "../../../../../base/common/lifecycle.js";
import type { ICodeEditor } from "../../../../../editor/browser/editorBrowser.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { type AnyStackFrame } from "../../../debug/browser/callStackWidget.js";
import type { ITestMessageStackFrame } from "../../common/testTypes.js";
export declare class TestResultStackWidget extends Disposable {
    private readonly container;
    private readonly widget;
    private readonly changeStackFrameEmitter;
    readonly onDidChangeStackFrame: import("../../../../../base/common/event.js").Event<ITestMessageStackFrame>;
    constructor(container: HTMLElement, containingEditor: ICodeEditor | undefined, instantiationService: IInstantiationService);
    collapseAll(): void;
    update(messageFrame: AnyStackFrame, stack: ITestMessageStackFrame[]): void;
    layout(height?: number, width?: number): void;
}
