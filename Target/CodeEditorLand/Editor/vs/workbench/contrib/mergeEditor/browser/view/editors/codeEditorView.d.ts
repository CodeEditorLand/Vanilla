import type { IView } from "../../../../../../base/browser/ui/grid/grid.js";
import { Disposable, type IDisposable } from "../../../../../../base/common/lifecycle.js";
import { type IObservable } from "../../../../../../base/common/observable.js";
import { type IEditorContributionDescription } from "../../../../../../editor/browser/editorExtensions.js";
import { CodeEditorWidget } from "../../../../../../editor/browser/widget/codeEditor/codeEditorWidget.js";
import type { IEditorOptions } from "../../../../../../editor/common/config/editorOptions.js";
import type { Range } from "../../../../../../editor/common/core/range.js";
import { Selection } from "../../../../../../editor/common/core/selection.js";
import type { MenuId } from "../../../../../../platform/actions/common/actions.js";
import type { IConfigurationService } from "../../../../../../platform/configuration/common/configuration.js";
import { IInstantiationService } from "../../../../../../platform/instantiation/common/instantiation.js";
import type { MergeEditorViewModel } from "../viewModel.js";
export declare abstract class CodeEditorView extends Disposable {
    private readonly instantiationService;
    readonly viewModel: IObservable<undefined | MergeEditorViewModel>;
    private readonly configurationService;
    readonly model: IObservable<import("../../model/mergeEditorModel.js").MergeEditorModel | undefined, unknown>;
    protected readonly htmlElements: {
        root: any;
        gutterDiv: any;
        editor: HTMLElementTagNameMap;
        title: any;
        description: any;
        detail: any;
        toolbar: any;
        header: any;
    };
    private readonly _onDidViewChange;
    readonly view: IView;
    protected readonly checkboxesVisible: IObservable<boolean, unknown>;
    protected readonly showDeletionMarkers: IObservable<boolean, unknown>;
    protected readonly useSimplifiedDecorations: IObservable<boolean, unknown>;
    readonly editor: CodeEditorWidget;
    updateOptions(newOptions: Readonly<IEditorOptions>): void;
    readonly isFocused: IObservable<boolean, unknown>;
    readonly cursorPosition: IObservable<import("../../../../../../editor/common/core/position.js").Position | null, unknown>;
    readonly selection: IObservable<Selection[] | null, unknown>;
    readonly cursorLineNumber: IObservable<number | undefined, unknown>;
    constructor(instantiationService: IInstantiationService, viewModel: IObservable<undefined | MergeEditorViewModel>, configurationService: IConfigurationService);
    protected getEditorContributions(): IEditorContributionDescription[];
}
export declare function createSelectionsAutorun(codeEditorView: CodeEditorView, translateRange: (baseRange: Range, viewModel: MergeEditorViewModel) => Range): IDisposable;
export declare class TitleMenu extends Disposable {
    constructor(menuId: MenuId, targetHtmlElement: HTMLElement, instantiationService: IInstantiationService);
}
