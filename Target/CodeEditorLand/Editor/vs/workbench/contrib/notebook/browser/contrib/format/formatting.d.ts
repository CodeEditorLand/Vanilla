import { Disposable } from "vs/base/common/lifecycle";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IWorkbenchContribution } from "vs/workbench/common/contributions";
import { INotebookExecutionService } from "vs/workbench/contrib/notebook/common/notebookExecutionService";
export declare class CellExecutionParticipantsContribution extends Disposable implements IWorkbenchContribution {
    private readonly instantiationService;
    private readonly notebookExecutionService;
    constructor(instantiationService: IInstantiationService, notebookExecutionService: INotebookExecutionService);
    private registerKernelExecutionParticipants;
}
