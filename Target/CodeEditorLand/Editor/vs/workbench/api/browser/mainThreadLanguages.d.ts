import { type UriComponents } from "../../../base/common/uri.js";
import type { IPosition } from "../../../editor/common/core/position.js";
import { type IRange } from "../../../editor/common/core/range.js";
import type { StandardTokenType } from "../../../editor/common/encodedTokenAttributes.js";
import { ILanguageService } from "../../../editor/common/languages/language.js";
import { IModelService } from "../../../editor/common/services/model.js";
import { ITextModelService } from "../../../editor/common/services/resolverService.js";
import { type IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { ILanguageStatusService, type ILanguageStatus } from "../../services/languageStatus/common/languageStatusService.js";
import { type MainThreadLanguagesShape } from "../common/extHost.protocol.js";
export declare class MainThreadLanguages implements MainThreadLanguagesShape {
    private readonly _languageService;
    private readonly _modelService;
    private _resolverService;
    private readonly _languageStatusService;
    private readonly _disposables;
    private readonly _proxy;
    private readonly _status;
    constructor(_extHostContext: IExtHostContext, _languageService: ILanguageService, _modelService: IModelService, _resolverService: ITextModelService, _languageStatusService: ILanguageStatusService);
    dispose(): void;
    $changeLanguage(resource: UriComponents, languageId: string): Promise<void>;
    $tokensAtPosition(resource: UriComponents, position: IPosition): Promise<undefined | {
        type: StandardTokenType;
        range: IRange;
    }>;
    $setLanguageStatus(handle: number, status: ILanguageStatus): void;
    $removeLanguageStatus(handle: number): void;
}
