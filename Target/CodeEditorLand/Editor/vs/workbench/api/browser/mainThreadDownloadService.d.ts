import { Disposable } from "../../../base/common/lifecycle.js";
import { type UriComponents } from "../../../base/common/uri.js";
import { IDownloadService } from "../../../platform/download/common/download.js";
import { type IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { type MainThreadDownloadServiceShape } from "../common/extHost.protocol.js";
export declare class MainThreadDownloadService extends Disposable implements MainThreadDownloadServiceShape {
    private readonly downloadService;
    constructor(extHostContext: IExtHostContext, downloadService: IDownloadService);
    $download(uri: UriComponents, to: UriComponents): Promise<void>;
}