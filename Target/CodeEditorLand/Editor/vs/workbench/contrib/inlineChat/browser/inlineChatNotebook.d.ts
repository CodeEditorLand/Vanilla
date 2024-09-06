import { IEditorService } from "../../../services/editor/common/editorService.js";
import { INotebookEditorService } from "../../notebook/browser/services/notebookEditorService.js";
import { IInlineChatSessionService } from "./inlineChatSessionService.js";
export declare class InlineChatNotebookContribution {
    private readonly _store;
    constructor(sessionService: IInlineChatSessionService, editorService: IEditorService, notebookEditorService: INotebookEditorService);
    dispose(): void;
}
