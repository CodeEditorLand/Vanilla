import { type Event } from "../../../../../base/common/event.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import type { ICellRange } from "../../common/notebookRange.js";
export declare class NotebookCellSelectionCollection extends Disposable {
    private readonly _onDidChangeSelection;
    get onDidChangeSelection(): Event<string>;
    private _primary;
    private _selections;
    get selections(): ICellRange[];
    get focus(): ICellRange;
    setState(primary: ICellRange | null, selections: ICellRange[], forceEventEmit: boolean, source: "view" | "model"): void;
    setSelections(selections: ICellRange[], forceEventEmit: boolean, source: "view" | "model"): void;
}
