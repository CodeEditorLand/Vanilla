import { EditorAction, ServicesAccessor } from "vs/editor/browser/editorExtensions";
import { ICodeEditorService } from "vs/editor/browser/services/codeEditorService";
import { AbstractGotoLineQuickAccessProvider } from "vs/editor/contrib/quickAccess/browser/gotoLineQuickAccess";
export declare class StandaloneGotoLineQuickAccessProvider extends AbstractGotoLineQuickAccessProvider {
    private readonly editorService;
    protected readonly onDidActiveTextEditorControlChange: any;
    constructor(editorService: ICodeEditorService);
    protected get activeTextEditorControl(): any;
}
export declare class GotoLineAction extends EditorAction {
    static readonly ID = "editor.action.gotoLine";
    constructor();
    run(accessor: ServicesAccessor): void;
}
