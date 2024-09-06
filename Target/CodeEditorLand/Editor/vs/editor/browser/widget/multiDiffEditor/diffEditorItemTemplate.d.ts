import { Disposable } from "vs/base/common/lifecycle";
import { DocumentDiffItemViewModel } from "vs/editor/browser/widget/multiDiffEditor/multiDiffEditorViewModel";
import { IWorkbenchUIElementFactory } from "vs/editor/browser/widget/multiDiffEditor/workbenchUIElementFactory";
import { OffsetRange } from "vs/editor/common/core/offsetRange";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IObjectData, IPooledObject } from "./objectPool";
export declare class TemplateData implements IObjectData {
    readonly viewModel: DocumentDiffItemViewModel;
    readonly deltaScrollVertical: (delta: number) => void;
    constructor(viewModel: DocumentDiffItemViewModel, deltaScrollVertical: (delta: number) => void);
    getId(): unknown;
}
export declare class DiffEditorItemTemplate extends Disposable implements IPooledObject<TemplateData> {
    private readonly _container;
    private readonly _overflowWidgetsDomNode;
    private readonly _workbenchUIElementFactory;
    private readonly _instantiationService;
    private readonly _viewModel;
    private readonly _collapsed;
    private readonly _editorContentHeight;
    readonly contentHeight: any;
    private readonly _modifiedContentWidth;
    private readonly _modifiedWidth;
    private readonly _originalContentWidth;
    private readonly _originalWidth;
    readonly maxScroll: any;
    private readonly _elements;
    readonly editor: any;
    private readonly isModifedFocused;
    private readonly isOriginalFocused;
    readonly isFocused: any;
    private readonly _resourceLabel;
    private readonly _resourceLabel2;
    private readonly _outerEditorHeight;
    private readonly _contextKeyService;
    constructor(_container: HTMLElement, _overflowWidgetsDomNode: HTMLElement, _workbenchUIElementFactory: IWorkbenchUIElementFactory, _instantiationService: IInstantiationService, _parentContextKeyService: IContextKeyService);
    setScrollLeft(left: number): void;
    private readonly _dataStore;
    private _data;
    setData(data: TemplateData | undefined): void;
    private readonly _headerHeight;
    private _lastScrollTop;
    private _isSettingScrollTop;
    render(verticalRange: OffsetRange, width: number, editorScroll: number, viewPort: OffsetRange): void;
    hide(): void;
}
