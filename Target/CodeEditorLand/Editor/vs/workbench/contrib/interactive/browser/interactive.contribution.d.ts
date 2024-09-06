import { Disposable } from "vs/base/common/lifecycle";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IWorkbenchContribution } from "vs/workbench/common/contributions";
import { IEditorSerializer } from "vs/workbench/common/editor";
import { EditorInput } from "vs/workbench/common/editor/editorInput";
import { InteractiveEditorInput } from "vs/workbench/contrib/interactive/browser/interactiveEditorInput";
import { INotebookService } from "vs/workbench/contrib/notebook/common/notebookService";
import { IEditorResolverService } from "vs/workbench/services/editor/common/editorResolverService";
import { IEditorService } from "vs/workbench/services/editor/common/editorService";
export declare class InteractiveDocumentContribution extends Disposable implements IWorkbenchContribution {
    private readonly instantiationService;
    static readonly ID = "workbench.contrib.interactiveDocument";
    constructor(notebookService: INotebookService, editorResolverService: IEditorResolverService, editorService: IEditorService, instantiationService: IInstantiationService);
}
export declare class InteractiveEditorSerializer implements IEditorSerializer {
    static readonly ID: any;
    canSerialize(editor: EditorInput): editor is InteractiveEditorInput;
    serialize(input: EditorInput): string | undefined;
    deserialize(instantiationService: IInstantiationService, raw: string): any;
}
