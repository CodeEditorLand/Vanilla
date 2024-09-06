import { CancellationToken } from "vs/base/common/cancellation";
import { URI } from "vs/base/common/uri";
export declare const IDownloadService: any;
export interface IDownloadService {
    readonly _serviceBrand: undefined;
    download(uri: URI, to: URI, cancellationToken?: CancellationToken): Promise<void>;
}
