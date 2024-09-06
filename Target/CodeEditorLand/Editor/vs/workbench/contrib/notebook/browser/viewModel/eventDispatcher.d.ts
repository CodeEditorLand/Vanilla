import { Disposable } from "vs/base/common/lifecycle";
import { NotebookViewEvent } from "vs/workbench/contrib/notebook/browser/notebookViewEvents";
export declare class NotebookEventDispatcher extends Disposable {
    private readonly _onDidChangeLayout;
    readonly onDidChangeLayout: any;
    private readonly _onDidChangeMetadata;
    readonly onDidChangeMetadata: any;
    private readonly _onDidChangeCellState;
    readonly onDidChangeCellState: any;
    emit(events: NotebookViewEvent[]): void;
}
