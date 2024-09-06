import { Disposable } from "vs/base/common/lifecycle";
import { Range } from "vs/editor/common/core/range";
import { CellFindMatchWithIndex, ICellModelDecorations, ICellViewModel, INotebookEditor } from "vs/workbench/contrib/notebook/browser/notebookBrowser";
export declare class FindMatchDecorationModel extends Disposable {
    private readonly _notebookEditor;
    private readonly ownerID;
    private _allMatchesDecorations;
    private _currentMatchCellDecorations;
    private _allMatchesCellDecorations;
    private _currentMatchDecorations;
    constructor(_notebookEditor: INotebookEditor, ownerID: string);
    get currentMatchDecorations(): {
        kind: "input";
        decorations: ICellModelDecorations[];
    } | {
        kind: "output";
        index: number;
    } | null;
    private clearDecorations;
    highlightCurrentFindMatchDecorationInCell(cell: ICellViewModel, cellRange: Range): Promise<number | null>;
    highlightCurrentFindMatchDecorationInWebview(cell: ICellViewModel, index: number): Promise<number | null>;
    clearCurrentFindMatchDecoration(): void;
    setAllFindMatchesDecorations(cellFindMatches: CellFindMatchWithIndex[]): void;
    stopWebviewFind(): void;
    dispose(): void;
}
