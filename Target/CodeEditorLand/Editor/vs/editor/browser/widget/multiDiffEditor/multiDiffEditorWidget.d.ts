import { Dimension } from "vs/base/browser/dom";
import { Disposable } from "vs/base/common/lifecycle";
import { IDocumentDiffItem, IMultiDiffEditorModel } from "vs/editor/browser/widget/multiDiffEditor/model";
import { IMultiDiffEditorViewState, IMultiDiffResourceId } from "vs/editor/browser/widget/multiDiffEditor/multiDiffEditorWidgetImpl";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { MultiDiffEditorViewModel } from "./multiDiffEditorViewModel";
import "./colors";
import { URI } from "vs/base/common/uri";
import { ICodeEditor } from "vs/editor/browser/editorBrowser";
import { DiffEditorWidget } from "vs/editor/browser/widget/diffEditor/diffEditorWidget";
import { IWorkbenchUIElementFactory } from "vs/editor/browser/widget/multiDiffEditor/workbenchUIElementFactory";
import { Range } from "vs/editor/common/core/range";
import { IDiffEditor } from "vs/editor/common/editorCommon";
export declare class MultiDiffEditorWidget extends Disposable {
    private readonly _element;
    private readonly _workbenchUIElementFactory;
    private readonly _instantiationService;
    private readonly _dimension;
    private readonly _viewModel;
    private readonly _widgetImpl;
    constructor(_element: HTMLElement, _workbenchUIElementFactory: IWorkbenchUIElementFactory, _instantiationService: IInstantiationService);
    reveal(resource: IMultiDiffResourceId, options?: RevealOptions): void;
    createViewModel(model: IMultiDiffEditorModel): MultiDiffEditorViewModel;
    setViewModel(viewModel: MultiDiffEditorViewModel | undefined): void;
    layout(dimension: Dimension): void;
    private readonly _activeControl;
    getActiveControl(): DiffEditorWidget | undefined;
    readonly onDidChangeActiveControl: any;
    getViewState(): IMultiDiffEditorViewState;
    setViewState(viewState: IMultiDiffEditorViewState): void;
    tryGetCodeEditor(resource: URI): {
        diffEditor: IDiffEditor;
        editor: ICodeEditor;
    } | undefined;
    findDocumentDiffItem(resource: URI): IDocumentDiffItem | undefined;
}
export interface RevealOptions {
    range?: Range;
    highlight: boolean;
}
