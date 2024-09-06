import { Disposable } from "vs/base/common/lifecycle";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IWorkbenchContribution } from "vs/workbench/common/contributions";
import { INotebookExecutionStateService } from "vs/workbench/contrib/notebook/common/notebookExecutionStateService";
import { INotebookKernelService } from "vs/workbench/contrib/notebook/common/notebookKernelService";
import { INotebookService } from "vs/workbench/contrib/notebook/common/notebookService";
import { IEditorService } from "vs/workbench/services/editor/common/editorService";
export declare class NotebookVariables extends Disposable implements IWorkbenchContribution {
    private readonly configurationService;
    private readonly editorService;
    private readonly notebookExecutionStateService;
    private readonly notebookKernelService;
    private readonly notebookDocumentService;
    private listeners;
    private configListener;
    private initialized;
    private viewEnabled;
    constructor(contextKeyService: IContextKeyService, configurationService: IConfigurationService, editorService: IEditorService, notebookExecutionStateService: INotebookExecutionStateService, notebookKernelService: INotebookKernelService, notebookDocumentService: INotebookService);
    private handleConfigChange;
    private handleInitEvent;
    private hasVariableProvider;
    private initializeView;
    dispose(): void;
}
