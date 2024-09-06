import { Disposable } from "vs/base/common/lifecycle";
import { ILanguageService } from "vs/editor/common/languages/language";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IExtensionResourceLoaderService } from "vs/platform/extensionResourceLoader/common/extensionResourceLoader";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { ILogService } from "vs/platform/log/common/log";
import { INotificationService } from "vs/platform/notification/common/notification";
import { IProgressService } from "vs/platform/progress/common/progress";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
import { IWorkbenchEnvironmentService } from "vs/workbench/services/environment/common/environmentService";
import { ITextMateTokenizationService } from "vs/workbench/services/textMate/browser/textMateTokenizationFeature";
import { IWorkbenchThemeService } from "vs/workbench/services/themes/common/workbenchThemeService";
import type { IGrammar } from "vscode-textmate";
export declare class TextMateTokenizationFeature extends Disposable implements ITextMateTokenizationService {
    private readonly _languageService;
    private readonly _themeService;
    private readonly _extensionResourceLoaderService;
    private readonly _notificationService;
    private readonly _logService;
    private readonly _configurationService;
    private readonly _progressService;
    private readonly _environmentService;
    private readonly _instantiationService;
    private readonly _telemetryService;
    private static reportTokenizationTimeCounter;
    _serviceBrand: undefined;
    private readonly _styleElement;
    private readonly _createdModes;
    private readonly _encounteredLanguages;
    private _debugMode;
    private _debugModePrintFunc;
    private _grammarDefinitions;
    private _grammarFactory;
    private readonly _tokenizersRegistrations;
    private _currentTheme;
    private _currentTokenColorMap;
    private readonly _threadedBackgroundTokenizerFactory;
    constructor(_languageService: ILanguageService, _themeService: IWorkbenchThemeService, _extensionResourceLoaderService: IExtensionResourceLoaderService, _notificationService: INotificationService, _logService: ILogService, _configurationService: IConfigurationService, _progressService: IProgressService, _environmentService: IWorkbenchEnvironmentService, _instantiationService: IInstantiationService, _telemetryService: ITelemetryService);
    private getAsyncTokenizationEnabled;
    private getAsyncTokenizationVerification;
    private _handleGrammarsExtPoint;
    private _validateGrammarDefinition;
    startDebugMode(printFn: (str: string) => void, onStop: () => void): void;
    private _canCreateGrammarFactory;
    private _getOrCreateGrammarFactory;
    private _createTokenizationSupport;
    private _updateTheme;
    createTokenizer(languageId: string): Promise<IGrammar | null>;
    private _vscodeOniguruma;
    private _getVSCodeOniguruma;
    private _loadVSCodeOnigurumaWASM;
    private _reportTokenizationTime;
}
