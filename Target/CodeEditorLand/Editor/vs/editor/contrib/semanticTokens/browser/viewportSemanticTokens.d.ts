import { Disposable } from "vs/base/common/lifecycle";
import { ICodeEditor } from "vs/editor/browser/editorBrowser";
import { IEditorContribution } from "vs/editor/common/editorCommon";
import { ILanguageFeatureDebounceService } from "vs/editor/common/services/languageFeatureDebounce";
import { ILanguageFeaturesService } from "vs/editor/common/services/languageFeatures";
import { ISemanticTokensStylingService } from "vs/editor/common/services/semanticTokensStyling";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IThemeService } from "vs/platform/theme/common/themeService";
export declare class ViewportSemanticTokensContribution extends Disposable implements IEditorContribution {
    private readonly _semanticTokensStylingService;
    private readonly _themeService;
    private readonly _configurationService;
    static readonly ID = "editor.contrib.viewportSemanticTokens";
    static get(editor: ICodeEditor): ViewportSemanticTokensContribution | null;
    private readonly _editor;
    private readonly _provider;
    private readonly _debounceInformation;
    private readonly _tokenizeViewport;
    private _outstandingRequests;
    constructor(editor: ICodeEditor, _semanticTokensStylingService: ISemanticTokensStylingService, _themeService: IThemeService, _configurationService: IConfigurationService, languageFeatureDebounceService: ILanguageFeatureDebounceService, languageFeaturesService: ILanguageFeaturesService);
    private _cancelAll;
    private _removeOutstandingRequest;
    private _tokenizeViewportNow;
    private _requestRange;
}
