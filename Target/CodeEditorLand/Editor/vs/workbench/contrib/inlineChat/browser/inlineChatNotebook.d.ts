import { INotebookEditorService } from "vs/workbench/contrib/notebook/browser/services/notebookEditorService";
import { IEditorService } from "vs/workbench/services/editor/common/editorService";
import { IInlineChatSessionService } from "./inlineChatSessionService";
export declare class InlineChatNotebookContribution {
    private readonly _store;
    constructor(sessionService: IInlineChatSessionService, editorService: IEditorService, notebookEditorService: INotebookEditorService);
    dispose(): void;
}
