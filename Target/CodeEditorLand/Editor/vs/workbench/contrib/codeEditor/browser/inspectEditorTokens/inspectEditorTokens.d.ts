import "./inspectEditorTokens.css";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { type ICodeEditor } from "../../../../../editor/browser/editorBrowser.js";
import type { IEditorContribution } from "../../../../../editor/common/editorCommon.js";
import { ILanguageService } from "../../../../../editor/common/languages/language.js";
import { ILanguageFeaturesService } from "../../../../../editor/common/services/languageFeatures.js";
import { ITreeSitterParserService } from "../../../../../editor/common/services/treeSitterParserService.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { INotificationService } from "../../../../../platform/notification/common/notification.js";
import { ITextMateTokenizationService } from "../../../../services/textMate/browser/textMateTokenizationFeature.js";
import { IWorkbenchThemeService } from "../../../../services/themes/common/workbenchThemeService.js";
export declare class InspectEditorTokensController extends Disposable implements IEditorContribution {
    static readonly ID = "editor.contrib.inspectEditorTokens";
    static get(editor: ICodeEditor): InspectEditorTokensController | null;
    private _editor;
    private _textMateService;
    private _treeSitterService;
    private _themeService;
    private _languageService;
    private _notificationService;
    private _configurationService;
    private _languageFeaturesService;
    private _widget;
    constructor(editor: ICodeEditor, textMateService: ITextMateTokenizationService, treeSitterService: ITreeSitterParserService, languageService: ILanguageService, themeService: IWorkbenchThemeService, notificationService: INotificationService, configurationService: IConfigurationService, languageFeaturesService: ILanguageFeaturesService);
    dispose(): void;
    launch(): void;
    stop(): void;
    toggle(): void;
}
