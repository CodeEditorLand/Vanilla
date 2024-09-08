import type { CodeWindow } from "../../../../base/browser/window.js";
import { Emitter } from "../../../../base/common/event.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import type { URI } from "../../../../base/common/uri.js";
import { ICodeEditorService } from "../../../../editor/browser/services/codeEditorService.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { type InteractiveWindowCollapseCodeCells, type NotebookCellDefaultCollapseConfig, type NotebookCellInternalMetadata, type ShowCellStatusBarType } from "../common/notebookCommon.js";
import { INotebookExecutionStateService } from "../common/notebookExecutionStateService.js";
export declare const OutputInnerContainerTopPadding = 4;
export interface NotebookDisplayOptions {
    showCellStatusBar: ShowCellStatusBarType;
    cellToolbarLocation: string | {
        [key: string]: string;
    };
    cellToolbarInteraction: string;
    compactView: boolean;
    focusIndicator: "border" | "gutter";
    insertToolbarPosition: "betweenCells" | "notebookToolbar" | "both" | "hidden";
    insertToolbarAlignment: "left" | "center";
    globalToolbar: boolean;
    stickyScrollEnabled: boolean;
    stickyScrollMode: "flat" | "indented";
    consolidatedOutputButton: boolean;
    consolidatedRunButton: boolean;
    showFoldingControls: "always" | "never" | "mouseover";
    dragAndDropEnabled: boolean;
    interactiveWindowCollapseCodeCells: InteractiveWindowCollapseCodeCells;
    outputScrolling: boolean;
    outputWordWrap: boolean;
    outputLineLimit: number;
    outputLinkifyFilePaths: boolean;
    outputMinimalError: boolean;
    fontSize: number;
    outputFontSize: number;
    outputFontFamily: string;
    outputLineHeight: number;
    markupFontSize: number;
    markdownLineHeight: number;
    editorOptionsCustomizations: Partial<{
        "editor.indentSize": "tabSize" | number;
        "editor.tabSize": number;
        "editor.insertSpaces": boolean;
    }> | undefined;
}
export interface NotebookLayoutConfiguration {
    cellRightMargin: number;
    cellRunGutter: number;
    cellTopMargin: number;
    cellBottomMargin: number;
    cellOutputPadding: number;
    codeCellLeftMargin: number;
    markdownCellLeftMargin: number;
    markdownCellGutter: number;
    markdownCellTopMargin: number;
    markdownCellBottomMargin: number;
    markdownPreviewPadding: number;
    markdownFoldHintHeight: number;
    editorToolbarHeight: number;
    editorTopPadding: number;
    editorBottomPadding: number;
    editorBottomPaddingWithoutStatusBar: number;
    collapsedIndicatorHeight: number;
    cellStatusBarHeight: number;
    focusIndicatorLeftMargin: number;
    focusIndicatorGap: number;
}
export interface NotebookOptionsChangeEvent {
    readonly cellStatusBarVisibility?: boolean;
    readonly cellToolbarLocation?: boolean;
    readonly cellToolbarInteraction?: boolean;
    readonly editorTopPadding?: boolean;
    readonly compactView?: boolean;
    readonly focusIndicator?: boolean;
    readonly insertToolbarPosition?: boolean;
    readonly insertToolbarAlignment?: boolean;
    readonly globalToolbar?: boolean;
    readonly stickyScrollEnabled?: boolean;
    readonly stickyScrollMode?: boolean;
    readonly showFoldingControls?: boolean;
    readonly consolidatedOutputButton?: boolean;
    readonly consolidatedRunButton?: boolean;
    readonly dragAndDropEnabled?: boolean;
    readonly fontSize?: boolean;
    readonly outputFontSize?: boolean;
    readonly markupFontSize?: boolean;
    readonly markdownLineHeight?: boolean;
    readonly fontFamily?: boolean;
    readonly outputFontFamily?: boolean;
    readonly editorOptionsCustomizations?: boolean;
    readonly interactiveWindowCollapseCodeCells?: boolean;
    readonly outputLineHeight?: boolean;
    readonly outputWordWrap?: boolean;
    readonly outputScrolling?: boolean;
    readonly outputLinkifyFilePaths?: boolean;
    readonly minimalError?: boolean;
}
export declare class NotebookOptions extends Disposable {
    readonly targetWindow: CodeWindow;
    private isReadonly;
    private readonly overrides;
    private readonly configurationService;
    private readonly notebookExecutionStateService;
    private readonly codeEditorService;
    private _layoutConfiguration;
    protected readonly _onDidChangeOptions: Emitter<NotebookOptionsChangeEvent>;
    readonly onDidChangeOptions: import("../../../../base/common/event.js").Event<NotebookOptionsChangeEvent>;
    private _editorTopPadding;
    constructor(targetWindow: CodeWindow, isReadonly: boolean, overrides: {
        cellToolbarInteraction: string;
        globalToolbar: boolean;
        stickyScrollEnabled: boolean;
        dragAndDropEnabled: boolean;
    } | undefined, configurationService: IConfigurationService, notebookExecutionStateService: INotebookExecutionStateService, codeEditorService: ICodeEditorService);
    updateOptions(isReadonly: boolean): void;
    private _computeEditorTopPadding;
    private _migrateDeprecatedSetting;
    private _computeOutputLineHeight;
    private _updateConfiguration;
    private _computeInsertToolbarPositionOption;
    private _computeInsertToolbarAlignmentOption;
    private _computeShowFoldingControlsOption;
    private _computeFocusIndicatorOption;
    private _computeStickyScrollModeOption;
    getCellCollapseDefault(): NotebookCellDefaultCollapseConfig;
    getLayoutConfiguration(): NotebookLayoutConfiguration & NotebookDisplayOptions;
    getDisplayOptions(): NotebookDisplayOptions;
    getCellEditorContainerLeftMargin(): number;
    computeCollapsedMarkdownCellHeight(viewType: string): number;
    computeBottomToolbarOffset(totalHeight: number, viewType: string): number;
    computeCodeCellEditorWidth(outerWidth: number): number;
    computeMarkdownCellEditorWidth(outerWidth: number): number;
    computeStatusBarHeight(): number;
    private _computeBottomToolbarDimensions;
    computeBottomToolbarDimensions(viewType?: string): {
        bottomToolbarGap: number;
        bottomToolbarHeight: number;
    };
    computeCellToolbarLocation(viewType?: string): "right" | "left" | "hidden";
    computeTopInsertToolbarHeight(viewType?: string): number;
    computeEditorPadding(internalMetadata: NotebookCellInternalMetadata, cellUri: URI): {
        top: number;
        bottom: number;
    };
    computeEditorStatusbarHeight(internalMetadata: NotebookCellInternalMetadata, cellUri: URI): number;
    private statusBarIsVisible;
    computeWebviewOptions(): {
        outputNodePadding: number;
        outputNodeLeftPadding: number;
        previewNodePadding: number;
        markdownLeftMargin: number;
        leftMargin: number;
        rightMargin: number;
        runGutter: number;
        dragAndDropEnabled: boolean;
        fontSize: number;
        outputFontSize: number;
        outputFontFamily: string;
        markupFontSize: number;
        markdownLineHeight: number;
        outputLineHeight: number;
        outputScrolling: boolean;
        outputWordWrap: boolean;
        outputLineLimit: number;
        outputLinkifyFilePaths: boolean;
        minimalError: boolean;
    };
    computeDiffWebviewOptions(): {
        outputNodePadding: number;
        outputNodeLeftPadding: number;
        previewNodePadding: number;
        markdownLeftMargin: number;
        leftMargin: number;
        rightMargin: number;
        runGutter: number;
        dragAndDropEnabled: boolean;
        fontSize: number;
        outputFontSize: number;
        outputFontFamily: string;
        markupFontSize: number;
        markdownLineHeight: number;
        outputLineHeight: number;
        outputScrolling: boolean;
        outputWordWrap: boolean;
        outputLineLimit: number;
        outputLinkifyFilePaths: boolean;
        minimalError: boolean;
    };
    computeIndicatorPosition(totalHeight: number, foldHintHeight: number, viewType?: string): {
        bottomIndicatorTop: number;
        verticalIndicatorHeight: number;
    };
}
