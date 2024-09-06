import { ICodeEditor } from "vs/editor/browser/editorBrowser";
import { EditorOption, FindComputedEditorOptionValueById } from "vs/editor/common/config/editorOptions";
import { FontInfo } from "vs/editor/common/config/fontInfo";
import { ModelLineProjectionData } from "vs/editor/common/modelLineProjectionData";
import { LineTokens } from "vs/editor/common/tokens/lineTokens";
import { InlineDecoration } from "vs/editor/common/viewModel";
export declare function renderLines(source: LineSource, options: RenderOptions, decorations: InlineDecoration[], domNode: HTMLElement): RenderLinesResult;
export declare class LineSource {
    readonly lineTokens: LineTokens[];
    readonly lineBreakData: (ModelLineProjectionData | null)[];
    readonly mightContainNonBasicASCII: boolean;
    readonly mightContainRTL: boolean;
    constructor(lineTokens: LineTokens[], lineBreakData: (ModelLineProjectionData | null)[], mightContainNonBasicASCII: boolean, mightContainRTL: boolean);
}
export declare class RenderOptions {
    readonly tabSize: number;
    readonly fontInfo: FontInfo;
    readonly disableMonospaceOptimizations: boolean;
    readonly typicalHalfwidthCharacterWidth: number;
    readonly scrollBeyondLastColumn: number;
    readonly lineHeight: number;
    readonly lineDecorationsWidth: number;
    readonly stopRenderingLineAfter: number;
    readonly renderWhitespace: FindComputedEditorOptionValueById<EditorOption.renderWhitespace>;
    readonly renderControlCharacters: boolean;
    readonly fontLigatures: FindComputedEditorOptionValueById<EditorOption.fontLigatures>;
    static fromEditor(editor: ICodeEditor): RenderOptions;
    constructor(tabSize: number, fontInfo: FontInfo, disableMonospaceOptimizations: boolean, typicalHalfwidthCharacterWidth: number, scrollBeyondLastColumn: number, lineHeight: number, lineDecorationsWidth: number, stopRenderingLineAfter: number, renderWhitespace: FindComputedEditorOptionValueById<EditorOption.renderWhitespace>, renderControlCharacters: boolean, fontLigatures: FindComputedEditorOptionValueById<EditorOption.fontLigatures>);
}
export interface RenderLinesResult {
    minWidthInPx: number;
    heightInLines: number;
    viewLineCounts: number[];
}
