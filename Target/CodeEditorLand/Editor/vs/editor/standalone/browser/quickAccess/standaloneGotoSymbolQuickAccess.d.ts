import "vs/base/browser/ui/codicons/codiconStyles";
import "vs/editor/contrib/symbolIcons/browser/symbolIcons";
import { EditorAction } from "vs/editor/browser/editorExtensions";
import { ICodeEditorService } from "vs/editor/browser/services/codeEditorService";
import { ILanguageFeaturesService } from "vs/editor/common/services/languageFeatures";
import { IOutlineModelService } from "vs/editor/contrib/documentSymbols/browser/outlineModel";
import { AbstractGotoSymbolQuickAccessProvider } from "vs/editor/contrib/quickAccess/browser/gotoSymbolQuickAccess";
import { ServicesAccessor } from "vs/platform/instantiation/common/instantiation";
export declare class StandaloneGotoSymbolQuickAccessProvider extends AbstractGotoSymbolQuickAccessProvider {
    private readonly editorService;
    protected readonly onDidActiveTextEditorControlChange: any;
    constructor(editorService: ICodeEditorService, languageFeaturesService: ILanguageFeaturesService, outlineModelService: IOutlineModelService);
    protected get activeTextEditorControl(): any;
}
export declare class GotoSymbolAction extends EditorAction {
    static readonly ID = "editor.action.quickOutline";
    constructor();
    run(accessor: ServicesAccessor): void;
}
