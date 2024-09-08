import { Disposable, type IDisposable } from "../../../../base/common/lifecycle.js";
import type { LanguageConfiguration } from "../../../common/languages/languageConfiguration.js";
import { type ILanguageConfigurationService, LanguageConfigurationServiceChangeEvent, ResolvedLanguageConfiguration } from "../../../common/languages/languageConfigurationRegistry.js";
export declare class TestLanguageConfigurationService extends Disposable implements ILanguageConfigurationService {
    _serviceBrand: undefined;
    private readonly _registry;
    private readonly _onDidChange;
    readonly onDidChange: import("../../../../base/common/event.js").Event<LanguageConfigurationServiceChangeEvent>;
    constructor();
    register(languageId: string, configuration: LanguageConfiguration, priority?: number): IDisposable;
    getLanguageConfiguration(languageId: string): ResolvedLanguageConfiguration;
}