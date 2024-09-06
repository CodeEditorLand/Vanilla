import { Disposable } from "vs/base/common/lifecycle";
import { URI, UriComponents } from "vs/base/common/uri";
import { IFileService } from "vs/platform/files/common/files";
import { ILanguagePackService } from "vs/platform/languagePacks/common/languagePacks";
import { MainThreadLocalizationShape } from "vs/workbench/api/common/extHost.protocol";
import { IExtHostContext } from "vs/workbench/services/extensions/common/extHostCustomers";
export declare class MainThreadLocalization extends Disposable implements MainThreadLocalizationShape {
    private readonly fileService;
    private readonly languagePackService;
    constructor(extHostContext: IExtHostContext, fileService: IFileService, languagePackService: ILanguagePackService);
    $fetchBuiltInBundleUri(id: string, language: string): Promise<URI | undefined>;
    $fetchBundleContents(uriComponents: UriComponents): Promise<string>;
}
