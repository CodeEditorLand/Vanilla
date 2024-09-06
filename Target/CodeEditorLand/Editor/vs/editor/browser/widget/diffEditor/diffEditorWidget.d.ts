import { IBoundarySashes } from "vs/base/browser/ui/sash/sash";
import { Event } from "vs/base/common/event";
import { ITransaction } from "vs/base/common/observable";
import "vs/css!./style";
import { IEditorConstructionOptions } from "vs/editor/browser/config/editorConfiguration";
import { ICodeEditor, IDiffEditor, IDiffEditorConstructionOptions } from "vs/editor/browser/editorBrowser";
import { ICodeEditorService } from "vs/editor/browser/services/codeEditorService";
import { CodeEditorWidget, ICodeEditorWidgetOptions } from "vs/editor/browser/widget/codeEditor/codeEditorWidget";
import { RefCounted } from "vs/editor/browser/widget/diffEditor/utils";
import { IDiffEditorOptions } from "vs/editor/common/config/editorOptions";
import { IDimension } from "vs/editor/common/core/dimension";
import { Range } from "vs/editor/common/core/range";
import { IDiffComputationResult, ILineChange } from "vs/editor/common/diff/legacyLinesDiffComputer";
import { LineRangeMapping, RangeMapping } from "vs/editor/common/diff/rangeMapping";
import { IDiffEditorModel, IDiffEditorViewModel, IDiffEditorViewState } from "vs/editor/common/editorCommon";
import { IAccessibilitySignalService } from "vs/platform/accessibilitySignal/browser/accessibilitySignalService";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IEditorProgressService } from "vs/platform/progress/common/progress";
import { DelegatingEditor } from "./delegatingEditorImpl";
export interface IDiffCodeEditorWidgetOptions {
    originalEditor?: ICodeEditorWidgetOptions;
    modifiedEditor?: ICodeEditorWidgetOptions;
}
export declare class DiffEditorWidget extends DelegatingEditor implements IDiffEditor {
    private readonly _domElement;
    private readonly _parentContextKeyService;
    private readonly _parentInstantiationService;
    private readonly _accessibilitySignalService;
    private readonly _editorProgressService;
    static ENTIRE_DIFF_OVERVIEW_WIDTH: any;
    private readonly elements;
    private readonly _diffModelSrc;
    private readonly _diffModel;
    readonly onDidChangeModel: any;
    get onDidContentSizeChange(): any;
    private readonly _contextKeyService;
    private readonly _instantiationService;
    private readonly _rootSizeObserver;
    private readonly _sashLayout;
    private readonly _sash;
    private readonly _boundarySashes;
    private _accessibleDiffViewerShouldBeVisible;
    private _accessibleDiffViewerVisible;
    private readonly _accessibleDiffViewer;
    private readonly _options;
    private readonly _editors;
    private readonly _overviewRulerPart;
    private readonly _movedBlocksLinesPart;
    private readonly _gutter;
    get collapseUnchangedRegions(): any;
    constructor(_domElement: HTMLElement, options: Readonly<IDiffEditorConstructionOptions>, codeEditorWidgetOptions: IDiffCodeEditorWidgetOptions, _parentContextKeyService: IContextKeyService, _parentInstantiationService: IInstantiationService, codeEditorService: ICodeEditorService, _accessibilitySignalService: IAccessibilitySignalService, _editorProgressService: IEditorProgressService);
    getViewWidth(): number;
    getContentHeight(): any;
    protected _createInnerEditor(instantiationService: IInstantiationService, container: HTMLElement, options: Readonly<IEditorConstructionOptions>, editorWidgetOptions: ICodeEditorWidgetOptions): CodeEditorWidget;
    private readonly _layoutInfo;
    private _createDiffEditorContributions;
    protected get _targetEditor(): CodeEditorWidget;
    getEditorType(): string;
    onVisible(): void;
    onHide(): void;
    layout(dimension?: IDimension | undefined): void;
    hasTextFocus(): boolean;
    saveViewState(): IDiffEditorViewState;
    restoreViewState(s: IDiffEditorViewState): void;
    handleInitialized(): void;
    createViewModel(model: IDiffEditorModel): IDiffEditorViewModel;
    getModel(): IDiffEditorModel | null;
    setModel(model: IDiffEditorModel | null | IDiffEditorViewModel): void;
    setDiffModel(viewModel: RefCounted<IDiffEditorViewModel> | null, tx?: ITransaction): void;
    /**
     * @param changedOptions Only has values for top-level options that have actually changed.
     */
    updateOptions(changedOptions: IDiffEditorOptions): void;
    getContainerDomNode(): HTMLElement;
    getOriginalEditor(): ICodeEditor;
    getModifiedEditor(): ICodeEditor;
    setBoundarySashes(sashes: IBoundarySashes): void;
    private readonly _diffValue;
    readonly onDidUpdateDiff: Event<void>;
    get ignoreTrimWhitespace(): boolean;
    get maxComputationTime(): number;
    get renderSideBySide(): boolean;
    /**
     * @deprecated Use `this.getDiffComputationResult().changes2` instead.
     */
    getLineChanges(): ILineChange[] | null;
    getDiffComputationResult(): IDiffComputationResult | null;
    revert(diff: LineRangeMapping): void;
    revertRangeMappings(diffs: RangeMapping[]): void;
    private _goTo;
    goToDiff(target: "previous" | "next"): void;
    revealFirstDiff(): void;
    accessibleDiffViewerNext(): void;
    accessibleDiffViewerPrev(): void;
    waitForDiff(): Promise<void>;
    mapToOtherSide(): {
        destination: CodeEditorWidget;
        destinationSelection: Range | undefined;
    };
    switchSide(): void;
    exitCompareMove(): void;
    collapseAllUnchangedRegions(): void;
    showAllUnchangedRegions(): void;
    private _handleCursorPositionChange;
}
