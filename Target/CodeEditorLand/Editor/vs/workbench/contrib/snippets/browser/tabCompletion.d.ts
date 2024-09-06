import { ICodeEditor } from "vs/editor/browser/editorBrowser";
import { IEditorContribution } from "vs/editor/common/editorCommon";
import { ILanguageFeaturesService } from "vs/editor/common/services/languageFeatures";
import { IClipboardService } from "vs/platform/clipboard/common/clipboardService";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { ISnippetsService } from "./snippets";
export declare class TabCompletionController implements IEditorContribution {
    private readonly _editor;
    private readonly _snippetService;
    private readonly _clipboardService;
    private readonly _languageFeaturesService;
    static readonly ID = "editor.tabCompletionController";
    static readonly ContextKey: any;
    static get(editor: ICodeEditor): TabCompletionController | null;
    private readonly _hasSnippets;
    private readonly _configListener;
    private _enabled?;
    private _selectionListener?;
    private _activeSnippets;
    private _completionProvider?;
    constructor(_editor: ICodeEditor, _snippetService: ISnippetsService, _clipboardService: IClipboardService, _languageFeaturesService: ILanguageFeaturesService, contextKeyService: IContextKeyService);
    dispose(): void;
    private _update;
    private _updateSnippets;
    performSnippetCompletions(): Promise<void>;
}
