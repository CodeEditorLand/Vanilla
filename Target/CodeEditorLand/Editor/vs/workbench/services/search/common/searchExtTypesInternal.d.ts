import { FileSearchProviderFolderOptions, FileSearchProviderOptions, TextSearchProviderFolderOptions, TextSearchProviderOptions } from "vs/workbench/services/search/common/searchExtTypes";
interface RipgrepSearchOptionsCommon {
    numThreads?: number;
}
export type TextSearchProviderOptionsRipgrep = Omit<Partial<TextSearchProviderOptions>, "folderOptions"> & {
    folderOptions: TextSearchProviderFolderOptions;
};
export type FileSearchProviderOptionsRipgrep = {
    folderOptions: FileSearchProviderFolderOptions;
} & FileSearchProviderOptions;
export interface RipgrepTextSearchOptions extends TextSearchProviderOptionsRipgrep, RipgrepSearchOptionsCommon {
}
export interface RipgrepFileSearchOptions extends FileSearchProviderOptionsRipgrep, RipgrepSearchOptionsCommon {
}
export {};