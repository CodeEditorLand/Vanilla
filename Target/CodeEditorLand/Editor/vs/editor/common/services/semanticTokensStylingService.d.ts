import { Disposable } from "vs/base/common/lifecycle";
import { ILanguageService } from "vs/editor/common/languages/language";
import { DocumentTokensProvider } from "vs/editor/common/services/model";
import { SemanticTokensProviderStyling } from "vs/editor/common/services/semanticTokensProviderStyling";
import { ISemanticTokensStylingService } from "vs/editor/common/services/semanticTokensStyling";
import { ILogService } from "vs/platform/log/common/log";
import { IThemeService } from "vs/platform/theme/common/themeService";
export declare class SemanticTokensStylingService extends Disposable implements ISemanticTokensStylingService {
    private readonly _themeService;
    private readonly _logService;
    private readonly _languageService;
    _serviceBrand: undefined;
    private _caches;
    constructor(_themeService: IThemeService, _logService: ILogService, _languageService: ILanguageService);
    getStyling(provider: DocumentTokensProvider): SemanticTokensProviderStyling;
}
