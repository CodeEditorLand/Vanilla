import { Disposable } from "vs/base/common/lifecycle";
import { ICodeEditor } from "vs/editor/browser/editorBrowser";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { AnyStackFrame } from "vs/workbench/contrib/debug/browser/callStackWidget";
import { ITestMessageStackFrame } from "vs/workbench/contrib/testing/common/testTypes";
export declare class TestResultStackWidget extends Disposable {
    private readonly container;
    private readonly widget;
    private readonly changeStackFrameEmitter;
    readonly onDidChangeStackFrame: any;
    constructor(container: HTMLElement, containingEditor: ICodeEditor | undefined, instantiationService: IInstantiationService);
    update(messageFrame: AnyStackFrame, stack: ITestMessageStackFrame[]): void;
    layout(height?: number, width?: number): void;
}
