import { IBoundarySashes } from "vs/base/browser/ui/sash/sash";
import { Disposable } from "vs/base/common/lifecycle";
import { IObservable } from "vs/base/common/observable";
import { URI } from "vs/base/common/uri";
import { DiffEditorEditors } from "vs/editor/browser/widget/diffEditor/components/diffEditorEditors";
import { SashLayout } from "vs/editor/browser/widget/diffEditor/components/diffEditorSash";
import { DiffEditorOptions } from "vs/editor/browser/widget/diffEditor/diffEditorOptions";
import { DiffEditorViewModel } from "vs/editor/browser/widget/diffEditor/diffEditorViewModel";
import { DetailedLineRangeMapping } from "vs/editor/common/diff/rangeMapping";
import { IMenuService } from "vs/platform/actions/common/actions";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
export declare class DiffEditorGutter extends Disposable {
    private readonly _diffModel;
    private readonly _editors;
    private readonly _options;
    private readonly _sashLayout;
    private readonly _boundarySashes;
    private readonly _instantiationService;
    private readonly _contextKeyService;
    private readonly _menuService;
    private readonly _menu;
    private readonly _actions;
    private readonly _hasActions;
    private readonly _showSash;
    readonly width: any;
    private readonly elements;
    constructor(diffEditorRoot: HTMLDivElement, _diffModel: IObservable<DiffEditorViewModel | undefined>, _editors: DiffEditorEditors, _options: DiffEditorOptions, _sashLayout: SashLayout, _boundarySashes: IObservable<IBoundarySashes | undefined, void>, _instantiationService: IInstantiationService, _contextKeyService: IContextKeyService, _menuService: IMenuService);
    computeStagedValue(mapping: DetailedLineRangeMapping): string;
    private readonly _currentDiff;
    private readonly _selectedDiffs;
    layout(left: number): void;
}
export interface DiffEditorSelectionHunkToolbarContext {
    mapping: DetailedLineRangeMapping;
    /**
     * The original text with the selected modified changes applied.
     */
    originalWithModifiedChanges: string;
    modifiedUri: URI;
    originalUri: URI;
}
