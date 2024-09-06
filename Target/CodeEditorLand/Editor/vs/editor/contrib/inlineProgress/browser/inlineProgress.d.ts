import { Disposable } from "vs/base/common/lifecycle";
import "vs/css!./inlineProgressWidget";
import { ICodeEditor } from "vs/editor/browser/editorBrowser";
import { IPosition } from "vs/editor/common/core/position";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
interface InlineProgressDelegate {
    cancel(): void;
}
export declare class InlineProgressManager extends Disposable {
    private readonly id;
    private readonly _editor;
    private readonly _instantiationService;
    /** Delay before showing the progress widget */
    private readonly _showDelay;
    private readonly _showPromise;
    private readonly _currentDecorations;
    private readonly _currentWidget;
    private _operationIdPool;
    private _currentOperation?;
    constructor(id: string, _editor: ICodeEditor, _instantiationService: IInstantiationService);
    dispose(): void;
    showWhile<R>(position: IPosition, title: string, promise: Promise<R>, delegate: InlineProgressDelegate, delayOverride?: number): Promise<R>;
    private clear;
}
export {};
