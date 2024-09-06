import { IListAccessibilityProvider } from "../../../../base/browser/ui/list/listWidget.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { INotebookExecutionStateService } from "../common/notebookExecutionStateService.js";
import { CellViewModel, NotebookViewModel } from "./viewModel/notebookViewModelImpl.js";
export declare class NotebookAccessibilityProvider extends Disposable implements IListAccessibilityProvider<CellViewModel> {
    private readonly notebookExecutionStateService;
    private readonly viewModel;
    private readonly keybindingService;
    private readonly configurationService;
    private readonly _onDidAriaLabelChange;
    private readonly onDidAriaLabelChange;
    constructor(notebookExecutionStateService: INotebookExecutionStateService, viewModel: () => NotebookViewModel | undefined, keybindingService: IKeybindingService, configurationService: IConfigurationService);
    getAriaLabel(element: CellViewModel): import("../../../../base/common/observable.js").IObservable<string, unknown>;
    private getLabel;
    getWidgetAriaLabel(): string;
    private mergeEvents;
}
