import { Disposable } from "../../../base/common/lifecycle.js";
import { URI, type UriComponents } from "../../../base/common/uri.js";
import { IFileService } from "../../../platform/files/common/files.js";
import { ILanguagePackService } from "../../../platform/languagePacks/common/languagePacks.js";
import { type IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { type MainThreadLocalizationShape } from "../common/extHost.protocol.js";
export declare class MainThreadLocalization extends Disposable implements MainThreadLocalizationShape {
    private readonly fileService;
    private readonly languagePackService;
    constructor(extHostContext: IExtHostContext, fileService: IFileService, languagePackService: ILanguagePackService);
    $fetchBuiltInBundleUri(id: string, language: string): Promise<URI | undefined>;
    $fetchBundleContents(uriComponents: UriComponents): Promise<string>;
}
