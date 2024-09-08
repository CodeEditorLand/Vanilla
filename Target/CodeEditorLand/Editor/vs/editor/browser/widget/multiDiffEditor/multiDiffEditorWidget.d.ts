import type { Dimension } from "../../../../base/browser/dom.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import type { IDocumentDiffItem, IMultiDiffEditorModel } from "./model.js";
import { MultiDiffEditorViewModel } from "./multiDiffEditorViewModel.js";
import { type IMultiDiffEditorViewState, type IMultiDiffResourceId } from "./multiDiffEditorWidgetImpl.js";
import "./colors.js";
import { Event } from "../../../../base/common/event.js";
import type { URI } from "../../../../base/common/uri.js";
import type { Range } from "../../../common/core/range.js";
import type { IDiffEditor } from "../../../common/editorCommon.js";
import type { ICodeEditor } from "../../editorBrowser.js";
import type { DiffEditorWidget } from "../diffEditor/diffEditorWidget.js";
import type { IWorkbenchUIElementFactory } from "./workbenchUIElementFactory.js";
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
    readonly onDidChangeActiveControl: Event<void>;
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
