import { URI } from "vs/base/common/uri";
import { FindMatch } from "vs/editor/common/model";
import { CellWebviewFindMatch, ICellViewModel } from "vs/workbench/contrib/notebook/browser/notebookBrowser";
import { INotebookCellMatchNoModel, INotebookFileMatchNoModel } from "vs/workbench/contrib/search/common/searchNotebookHelpers";
import { IFileMatch, ITextSearchMatch } from "vs/workbench/services/search/common/search";
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
