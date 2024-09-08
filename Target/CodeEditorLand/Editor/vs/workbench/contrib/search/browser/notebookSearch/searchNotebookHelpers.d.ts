import type { URI } from "../../../../../base/common/uri.js";
import type { FindMatch } from "../../../../../editor/common/model.js";
import { type IFileMatch, type ITextSearchMatch } from "../../../../services/search/common/search.js";
import type { CellWebviewFindMatch, ICellViewModel } from "../../../notebook/browser/notebookBrowser.js";
import { type INotebookCellMatchNoModel, type INotebookFileMatchNoModel } from "../../common/searchNotebookHelpers.js";
export type INotebookCellMatch = INotebookCellMatchWithModel | INotebookCellMatchNoModel;
export type INotebookFileMatch = INotebookFileMatchWithModel | INotebookFileMatchNoModel;
export declare function getIDFromINotebookCellMatch(match: INotebookCellMatch): string;
export interface INotebookFileMatchWithModel extends IFileMatch {
    cellResults: INotebookCellMatchWithModel[];
}
export interface INotebookCellMatchWithModel extends INotebookCellMatchNoModel<URI> {
    cell: ICellViewModel;
}
export declare function isINotebookFileMatchWithModel(object: any): object is INotebookFileMatchWithModel;
export declare function isINotebookCellMatchWithModel(object: any): object is INotebookCellMatchWithModel;
export declare function contentMatchesToTextSearchMatches(contentMatches: FindMatch[], cell: ICellViewModel): ITextSearchMatch[];
export declare function webviewMatchesToTextSearchMatches(webviewMatches: CellWebviewFindMatch[]): ITextSearchMatch[];
