import { Emitter } from "../../../../../base/common/event.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { NotebookLayoutChangeEvent, NotebookLayoutInfo } from "../notebookViewEvents.js";
import { IDiffElementLayoutInfo } from "./notebookDiffEditorBrowser.js";
export declare enum NotebookDiffViewEventType {
    LayoutChanged = 1,
    CellLayoutChanged = 2
}
export declare class NotebookDiffLayoutChangedEvent {
    readonly source: NotebookLayoutChangeEvent;
    readonly value: NotebookLayoutInfo;
    readonly type = NotebookDiffViewEventType.LayoutChanged;
    constructor(source: NotebookLayoutChangeEvent, value: NotebookLayoutInfo);
}
export declare class NotebookCellLayoutChangedEvent {
    readonly source: IDiffElementLayoutInfo;
    readonly type = NotebookDiffViewEventType.CellLayoutChanged;
    constructor(source: IDiffElementLayoutInfo);
}
export type NotebookDiffViewEvent = NotebookDiffLayoutChangedEvent | NotebookCellLayoutChangedEvent;
export declare class NotebookDiffEditorEventDispatcher extends Disposable {
    protected readonly _onDidChangeLayout: Emitter<NotebookDiffLayoutChangedEvent>;
    readonly onDidChangeLayout: import("../../../../../base/common/event.js").Event<NotebookDiffLayoutChangedEvent>;
    protected readonly _onDidChangeCellLayout: Emitter<NotebookCellLayoutChangedEvent>;
    readonly onDidChangeCellLayout: import("../../../../../base/common/event.js").Event<NotebookCellLayoutChangedEvent>;
    emit(events: NotebookDiffViewEvent[]): void;
}
