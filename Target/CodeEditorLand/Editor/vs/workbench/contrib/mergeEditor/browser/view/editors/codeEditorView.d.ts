import { IView } from "vs/base/browser/ui/grid/grid";
import { Disposable, IDisposable } from "vs/base/common/lifecycle";
import { IObservable } from "vs/base/common/observable";
import { IEditorContributionDescription } from "vs/editor/browser/editorExtensions";
import { IEditorOptions } from "vs/editor/common/config/editorOptions";
import { Range } from "vs/editor/common/core/range";
import { MenuId } from "vs/platform/actions/common/actions";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { MergeEditorViewModel } from "vs/workbench/contrib/mergeEditor/browser/view/viewModel";
export declare abstract class CodeEditorView extends Disposable {
    private readonly instantiationService;
    readonly viewModel: IObservable<undefined | MergeEditorViewModel>;
    private readonly configurationService;
    readonly model: any;
    protected readonly htmlElements: any;
    private readonly _onDidViewChange;
    readonly view: IView;
    protected readonly checkboxesVisible: any;
    protected readonly showDeletionMarkers: any;
    protected readonly useSimplifiedDecorations: any;
    readonly editor: any;
    updateOptions(newOptions: Readonly<IEditorOptions>): void;
    readonly isFocused: any;
    readonly cursorPosition: any;
    readonly selection: any;
    readonly cursorLineNumber: any;
    constructor(instantiationService: IInstantiationService, viewModel: IObservable<undefined | MergeEditorViewModel>, configurationService: IConfigurationService);
    protected getEditorContributions(): IEditorContributionDescription[];
}
export declare function createSelectionsAutorun(codeEditorView: CodeEditorView, translateRange: (baseRange: Range, viewModel: MergeEditorViewModel) => Range): IDisposable;
export declare class TitleMenu extends Disposable {
    constructor(menuId: MenuId, targetHtmlElement: HTMLElement, instantiationService: IInstantiationService);
}
