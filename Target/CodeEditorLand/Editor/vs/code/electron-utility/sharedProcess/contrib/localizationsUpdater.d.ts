import { Disposable } from "../../../../base/common/lifecycle.js";
import type { NativeLanguagePackService } from "../../../../platform/languagePacks/node/languagePacks.js";
export declare class LocalizationsUpdater extends Disposable {
    private readonly localizationsService;
    constructor(localizationsService: NativeLanguagePackService);
    private updateLocalizations;
}
