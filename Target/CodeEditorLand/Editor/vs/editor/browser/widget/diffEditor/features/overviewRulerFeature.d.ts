import { Disposable } from "vs/base/common/lifecycle";
import { IObservable } from "vs/base/common/observable";
import { DiffEditorEditors } from "vs/editor/browser/widget/diffEditor/components/diffEditorEditors";
import { DiffEditorViewModel } from "vs/editor/browser/widget/diffEditor/diffEditorViewModel";
import { EditorLayoutInfo } from "vs/editor/common/config/editorOptions";
import { IThemeService } from "vs/platform/theme/common/themeService";
export declare class OverviewRulerFeature extends Disposable {
    private readonly _editors;
    private readonly _rootElement;
    private readonly _diffModel;
    private readonly _rootWidth;
    private readonly _rootHeight;
    private readonly _modifiedEditorLayoutInfo;
    private readonly _themeService;
    private static readonly ONE_OVERVIEW_WIDTH;
    static readonly ENTIRE_DIFF_OVERVIEW_WIDTH: number;
    readonly width: number;
    constructor(_editors: DiffEditorEditors, _rootElement: HTMLElement, _diffModel: IObservable<DiffEditorViewModel | undefined>, _rootWidth: IObservable<number>, _rootHeight: IObservable<number>, _modifiedEditorLayoutInfo: IObservable<EditorLayoutInfo | null>, _themeService: IThemeService);
}
