import { type IObservable } from "../../../../base/common/observable.js";
import { IAccessibilityService } from "../../../../platform/accessibility/common/accessibility.js";
import { type IDiffEditorOptions, type IEditorOptions } from "../../../common/config/editorOptions.js";
import type { DiffEditorViewModel } from "./diffEditorViewModel.js";
export declare class DiffEditorOptions {
    private readonly _accessibilityService;
    private readonly _options;
    get editorOptions(): IObservable<IEditorOptions, {
        changedOptions: IEditorOptions;
    }>;
    private readonly _diffEditorWidth;
    private readonly _screenReaderMode;
    constructor(options: Readonly<IDiffEditorOptions>, _accessibilityService: IAccessibilityService);
    readonly couldShowInlineViewBecauseOfSize: IObservable<boolean, unknown>;
    readonly renderOverviewRuler: IObservable<boolean, unknown>;
    readonly renderSideBySide: IObservable<boolean, unknown>;
    readonly readOnly: IObservable<boolean | undefined, unknown>;
    readonly shouldRenderOldRevertArrows: IObservable<boolean, unknown>;
    readonly shouldRenderGutterMenu: IObservable<boolean, unknown>;
    readonly renderIndicators: IObservable<boolean, unknown>;
    readonly enableSplitViewResizing: IObservable<boolean, unknown>;
    readonly splitViewDefaultRatio: IObservable<number, unknown>;
    readonly ignoreTrimWhitespace: IObservable<boolean, unknown>;
    readonly maxComputationTimeMs: IObservable<number, unknown>;
    readonly showMoves: IObservable<boolean, unknown>;
    readonly isInEmbeddedEditor: IObservable<boolean, unknown>;
    readonly diffWordWrap: IObservable<"on" | "off" | "inherit", unknown>;
    readonly originalEditable: IObservable<boolean, unknown>;
    readonly diffCodeLens: IObservable<boolean, unknown>;
    readonly accessibilityVerbose: IObservable<boolean, unknown>;
    readonly diffAlgorithm: IObservable<"advanced" | "legacy", unknown>;
    readonly showEmptyDecorations: IObservable<boolean, unknown>;
    readonly onlyShowAccessibleDiffViewer: IObservable<boolean, unknown>;
    readonly compactMode: IObservable<boolean, unknown>;
    private readonly trueInlineDiffRenderingEnabled;
    readonly useTrueInlineDiffRendering: IObservable<boolean>;
    readonly hideUnchangedRegions: IObservable<boolean, unknown>;
    readonly hideUnchangedRegionsRevealLineCount: IObservable<number, unknown>;
    readonly hideUnchangedRegionsContextLineCount: IObservable<number, unknown>;
    readonly hideUnchangedRegionsMinimumLineCount: IObservable<number, unknown>;
    updateOptions(changedOptions: IDiffEditorOptions): void;
    setWidth(width: number): void;
    private readonly _model;
    setModel(model: DiffEditorViewModel | undefined): void;
    private readonly shouldRenderInlineViewInSmartMode;
    readonly inlineViewHideOriginalLineNumbers: IObservable<boolean, unknown>;
}
