import { Disposable } from "vs/base/common/lifecycle";
import { ILanguageFeatureDebounceService } from "vs/editor/common/services/languageFeatureDebounce";
import { ILanguageFeaturesService } from "vs/editor/common/services/languageFeatures";
import { IModelService } from "vs/editor/common/services/model";
import { ISemanticTokensStylingService } from "vs/editor/common/services/semanticTokensStyling";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IThemeService } from "vs/platform/theme/common/themeService";
export declare class DocumentSemanticTokensFeature extends Disposable {
    private readonly _watchers;
    constructor(semanticTokensStylingService: ISemanticTokensStylingService, modelService: IModelService, themeService: IThemeService, configurationService: IConfigurationService, languageFeatureDebounceService: ILanguageFeatureDebounceService, languageFeaturesService: ILanguageFeaturesService);
    dispose(): void;
}
