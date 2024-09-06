import { Dimension } from "vs/base/browser/dom";
import { Disposable } from "vs/base/common/lifecycle";
import { IObservable } from "vs/base/common/observable";
import { URI } from "vs/base/common/uri";
import "vs/css!./style";
import { ICodeEditor } from "vs/editor/browser/editorBrowser";
import { IDocumentDiffItem } from "vs/editor/browser/widget/multiDiffEditor/model";
import { RevealOptions } from "vs/editor/browser/widget/multiDiffEditor/multiDiffEditorWidget";
import { IWorkbenchUIElementFactory } from "vs/editor/browser/widget/multiDiffEditor/workbenchUIElementFactory";
import { IRange } from "vs/editor/common/core/range";
import { ISelection } from "vs/editor/common/core/selection";
import { IDiffEditor } from "vs/editor/common/editorCommon";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { ITextEditorOptions } from "vs/platform/editor/common/editor";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { MultiDiffEditorViewModel } from "./multiDiffEditorViewModel";
export declare class MultiDiffEditorWidgetImpl extends Disposable {
    private readonly _element;
    private readonly _dimension;
    private readonly _viewModel;
    private readonly _workbenchUIElementFactory;
    private readonly _parentContextKeyService;
    private readonly _parentInstantiationService;
    private readonly _scrollableElements;
    private readonly _scrollable;
    private readonly _scrollableElement;
    private readonly _elements;
    private readonly _sizeObserver;
    private readonly _objectPool;
    readonly scrollTop: any;
    readonly scrollLeft: any;
    private readonly _viewItemsInfo;
    private readonly _viewItems;
    private readonly _spaceBetweenPx;
    private readonly _totalHeight;
    readonly activeControl: any;
    private readonly _contextKeyService;
    private readonly _instantiationService;
    constructor(_element: HTMLElement, _dimension: IObservable<Dimension | undefined>, _viewModel: IObservable<MultiDiffEditorViewModel | undefined>, _workbenchUIElementFactory: IWorkbenchUIElementFactory, _parentContextKeyService: IContextKeyService, _parentInstantiationService: IInstantiationService);
    setScrollState(scrollState: {
        top?: number;
        left?: number;
    }): void;
    reveal(resource: IMultiDiffResourceId, options?: RevealOptions): void;
    getViewState(): IMultiDiffEditorViewState;
    /** This accounts for documents that are not loaded yet. */
    private _lastDocStates;
    setViewState(viewState: IMultiDiffEditorViewState): void;
    findDocumentDiffItem(resource: URI): IDocumentDiffItem | undefined;
    tryGetCodeEditor(resource: URI): {
        diffEditor: IDiffEditor;
        editor: ICodeEditor;
    } | undefined;
    private render;
}
export interface IMultiDiffEditorViewState {
    scrollState: {
        top: number;
        left: number;
    };
    docStates?: Record<string, IMultiDiffDocState>;
}
interface IMultiDiffDocState {
    collapsed: boolean;
    selections?: ISelection[];
}
export interface IMultiDiffEditorOptions extends ITextEditorOptions {
    viewState?: IMultiDiffEditorOptionsViewState;
}
export interface IMultiDiffEditorOptionsViewState {
    revealData?: {
        resource: IMultiDiffResourceId;
        range?: IRange;
    };
}
export type IMultiDiffResourceId = {
    original: URI | undefined;
    modified: URI | undefined;
};
export {};
