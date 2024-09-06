import { CancellationToken } from "vs/base/common/cancellation";
import { Disposable, IDisposable } from "vs/base/common/lifecycle";
import { IActiveCodeEditor } from "vs/editor/browser/editorBrowser";
import { ILanguageConfigurationService } from "vs/editor/common/languages/languageConfigurationRegistry";
import { ILanguageFeaturesService } from "vs/editor/common/services/languageFeatures";
import { StickyModel } from "vs/editor/contrib/stickyScroll/browser/stickyScrollElement";
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
