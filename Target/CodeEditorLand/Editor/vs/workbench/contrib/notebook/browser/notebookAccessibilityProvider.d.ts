import { IListAccessibilityProvider } from "vs/base/browser/ui/list/listWidget";
import { Disposable } from "vs/base/common/lifecycle";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IKeybindingService } from "vs/platform/keybinding/common/keybinding";
import { CellViewModel, NotebookViewModel } from "vs/workbench/contrib/notebook/browser/viewModel/notebookViewModelImpl";
import { INotebookExecutionStateService } from "vs/workbench/contrib/notebook/common/notebookExecutionStateService";
export declare class NotebookAccessibilityProvider extends Disposable implements IListAccessibilityProvider<CellViewModel> {
    private readonly notebookExecutionStateService;
    private readonly viewModel;
    private readonly keybindingService;
    private readonly configurationService;
    private readonly _onDidAriaLabelChange;
    private readonly onDidAriaLabelChange;
    constructor(notebookExecutionStateService: INotebookExecutionStateService, viewModel: () => NotebookViewModel | undefined, keybindingService: IKeybindingService, configurationService: IConfigurationService);
    getAriaLabel(element: CellViewModel): any;
    private getLabel;
    getWidgetAriaLabel(): any;
    private mergeEvents;
}
