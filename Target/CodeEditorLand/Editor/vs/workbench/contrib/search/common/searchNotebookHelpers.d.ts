import { URI, UriComponents } from "vs/base/common/uri";
import { FindMatch, IReadonlyTextBuffer } from "vs/editor/common/model";
import { IFileMatch, ITextSearchMatch } from "vs/workbench/services/search/common/search";
export type IRawClosedNotebookFileMatch = INotebookFileMatchNoModel<UriComponents>;
export interface INotebookFileMatchNoModel<U extends UriComponents = URI> extends IFileMatch<U> {
    cellResults: INotebookCellMatchNoModel<U>[];
}
export interface INotebookCellMatchNoModel<U extends UriComponents = URI> {
    index: number;
    contentResults: ITextSearchMatch<U>[];
    webviewResults: ITextSearchMatch<U>[];
}
export declare function isINotebookFileMatchNoModel(object: IFileMatch): object is INotebookFileMatchNoModel;
export declare const rawCellPrefix = "rawCell#";
export declare function genericCellMatchesToTextSearchMatches(contentMatches: FindMatch[], buffer: IReadonlyTextBuffer): any[];
