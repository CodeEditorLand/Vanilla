import type { CancellationToken } from "../../../../base/common/cancellation.js";
import { Disposable, type IDisposable } from "../../../../base/common/lifecycle.js";
import type { IActiveCodeEditor } from "../../../browser/editorBrowser.js";
import { ILanguageConfigurationService } from "../../../common/languages/languageConfigurationRegistry.js";
import { ILanguageFeaturesService } from "../../../common/services/languageFeatures.js";
import { StickyModel } from "./stickyScrollElement.js";
export interface IStickyModelProvider extends IDisposable {
    /**
     * Method which updates the sticky model
     * @param token cancellation token
     * @returns the sticky model
     */
    update(token: CancellationToken): Promise<StickyModel | null>;
}
export declare class StickyModelProvider extends Disposable implements IStickyModelProvider {
    private readonly _editor;
    private _modelProviders;
    private _modelPromise;
    private _updateScheduler;
    private readonly _updateOperation;
    constructor(_editor: IActiveCodeEditor, onProviderUpdate: () => void, _languageConfigurationService: ILanguageConfigurationService, _languageFeaturesService: ILanguageFeaturesService);
    dispose(): void;
    private _cancelModelPromise;
    update(token: CancellationToken): Promise<StickyModel | null>;
}
