import { Disposable } from "vs/base/common/lifecycle";
import { IFileService } from "vs/platform/files/common/files";
import { IRemoteResourceProvider, IResourceUriProvider } from "vs/workbench/browser/web.api";
export declare class BrowserRemoteResourceLoader extends Disposable {
    private readonly provider;
    constructor(fileService: IFileService, provider: IRemoteResourceProvider);
    getResourceUriProvider(): IResourceUriProvider;
}
