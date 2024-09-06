import { Disposable } from "vs/base/common/lifecycle";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IWorkbenchContribution } from "vs/workbench/common/contributions";
import { INotebookEditorModelResolverService } from "vs/workbench/contrib/notebook/common/notebookEditorModelResolverService";
import { INotebookService } from "vs/workbench/contrib/notebook/common/notebookService";
import { IEditorResolverService } from "vs/workbench/services/editor/common/editorResolverService";
export declare class ReplDocumentContribution extends Disposable implements IWorkbenchContribution {
    private readonly notebookEditorModelResolverService;
    private readonly instantiationService;
    private readonly configurationService;
    static readonly ID = "workbench.contrib.replDocument";
    constructor(notebookService: INotebookService, editorResolverService: IEditorResolverService, notebookEditorModelResolverService: INotebookEditorModelResolverService, instantiationService: IInstantiationService, configurationService: IConfigurationService);
}
