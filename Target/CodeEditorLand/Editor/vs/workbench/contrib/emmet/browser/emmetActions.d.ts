import { ICodeEditor } from "vs/editor/browser/editorBrowser";
import { EditorAction, IActionOptions, ServicesAccessor } from "vs/editor/browser/editorExtensions";
export interface IGrammarContributions {
    getGrammar(mode: string): string;
}
interface IEmmetActionOptions extends IActionOptions {
    actionName: string;
}
export declare abstract class EmmetEditorAction extends EditorAction {
    protected emmetActionName: string;
    constructor(opts: IEmmetActionOptions);
    private static readonly emmetSupportedModes;
    private _lastGrammarContributions;
    private _lastExtensionService;
    private _withGrammarContributions;
    run(accessor: ServicesAccessor, editor: ICodeEditor): Promise<void>;
    static getLanguage(editor: ICodeEditor, grammars: IGrammarContributions): {
        language: any;
        parentMode: string;
    } | null;
}
export {};
