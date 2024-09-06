import { IDiffEditorConstructionOptions } from "../../../../../editor/browser/editorBrowser.js";
import { IEditorOptions } from "../../../../../editor/common/config/editorOptions.js";
/**
 * Do not leave at 12, when at 12 and we have whitespace and only one line,
 * then there's not enough space for the button `Show Whitespace Differences`
 */
export declare const fixedEditorPaddingSingleLineCells: {
    top: number;
    bottom: number;
};
export declare const fixedEditorPadding: {
    top: number;
    bottom: number;
};
export declare const fixedEditorOptions: IEditorOptions;
export declare const fixedDiffEditorOptions: IDiffEditorConstructionOptions;
