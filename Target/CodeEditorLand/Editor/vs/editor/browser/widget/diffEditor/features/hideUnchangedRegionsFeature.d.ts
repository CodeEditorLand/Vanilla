import { Disposable, IDisposable } from "vs/base/common/lifecycle";
import { IObservable, IReader } from "vs/base/common/observable";
import { DiffEditorEditors } from "vs/editor/browser/widget/diffEditor/components/diffEditorEditors";
import { DiffEditorOptions } from "vs/editor/browser/widget/diffEditor/diffEditorOptions";
import { DiffEditorViewModel } from "vs/editor/browser/widget/diffEditor/diffEditorViewModel";
import { IObservableViewZone } from "vs/editor/browser/widget/diffEditor/utils";
import { LineRange } from "vs/editor/common/core/lineRange";
import { SymbolKind } from "vs/editor/common/languages";
import { ITextModel } from "vs/editor/common/model";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
/**
 * Make sure to add the view zones to the editor!
 */
export declare class HideUnchangedRegionsFeature extends Disposable {
    private readonly _editors;
    private readonly _diffModel;
    private readonly _options;
    private readonly _instantiationService;
    private static readonly _breadcrumbsSourceFactory;
    static setBreadcrumbsSourceFactory(factory: (textModel: ITextModel, instantiationService: IInstantiationService) => IDiffEditorBreadcrumbsSource): void;
    private readonly _modifiedOutlineSource;
    readonly viewZones: IObservable<{
        origViewZones: IObservableViewZone[];
        modViewZones: IObservableViewZone[];
    }>;
    private _isUpdatingHiddenAreas;
    get isUpdatingHiddenAreas(): boolean;
    constructor(_editors: DiffEditorEditors, _diffModel: IObservable<DiffEditorViewModel | undefined>, _options: DiffEditorOptions, _instantiationService: IInstantiationService);
}
export interface IDiffEditorBreadcrumbsSource extends IDisposable {
    getBreadcrumbItems(startRange: LineRange, reader: IReader): {
        name: string;
        kind: SymbolKind;
        startLineNumber: number;
    }[];
}
