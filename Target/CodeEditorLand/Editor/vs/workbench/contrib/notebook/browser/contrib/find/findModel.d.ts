import { Disposable } from "vs/base/common/lifecycle";
import { Range } from "vs/editor/common/core/range";
import { FindMatch } from "vs/editor/common/model";
import { PrefixSumComputer } from "vs/editor/common/model/prefixSumComputer";
import { FindReplaceState } from "vs/editor/contrib/find/browser/findState";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { NotebookFindFilters } from "vs/workbench/contrib/notebook/browser/contrib/find/findFilters";
import { CellFindMatchWithIndex, CellWebviewFindMatch, ICellViewModel, INotebookEditor } from "vs/workbench/contrib/notebook/browser/notebookBrowser";
export declare class CellFindMatchModel implements CellFindMatchWithIndex {
    readonly cell: ICellViewModel;
    readonly index: number;
    private _contentMatches;
    private _webviewMatches;
    get length(): number;
    get contentMatches(): FindMatch[];
    get webviewMatches(): CellWebviewFindMatch[];
    constructor(cell: ICellViewModel, index: number, contentMatches: FindMatch[], webviewMatches: CellWebviewFindMatch[]);
    getMatch(index: number): any;
}
export declare class FindModel extends Disposable {
    private readonly _notebookEditor;
    private readonly _state;
    private readonly _configurationService;
    private _findMatches;
    protected _findMatchesStarts: PrefixSumComputer | null;
    private _currentMatch;
    private readonly _throttledDelayer;
    private _computePromise;
    private readonly _modelDisposable;
    private _findMatchDecorationModel;
    get findMatches(): CellFindMatchWithIndex[];
    get currentMatch(): number;
    constructor(_notebookEditor: INotebookEditor, _state: FindReplaceState<NotebookFindFilters>, _configurationService: IConfigurationService);
    private _updateCellStates;
    ensureFindMatches(): void;
    getCurrentMatch(): {
        cell: any;
        match: any;
        isModelMatch: boolean;
    };
    refreshCurrentMatch(focus: {
        cell: ICellViewModel;
        range: Range;
    }): void;
    find(option: {
        previous: boolean;
    } | {
        index: number;
    }): void;
    private revealCellRange;
    private _registerModelListener;
    research(): Promise<any>;
    _research(): Promise<void>;
    private set;
    private _compute;
    private _updateCurrentMatch;
    private _matchesCountBeforeIndex;
    private constructFindMatchesStarts;
    private highlightCurrentFindMatchDecoration;
    clear(): void;
    dispose(): void;
}
