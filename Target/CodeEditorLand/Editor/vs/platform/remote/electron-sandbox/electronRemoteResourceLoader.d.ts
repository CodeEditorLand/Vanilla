import { Disposable } from "vs/base/common/lifecycle";
import { URI } from "vs/base/common/uri";
import { IFileService } from "vs/platform/files/common/files";
import { IMainProcessService } from "vs/platform/ipc/common/mainProcessService";
export declare class ElectronRemoteResourceLoader extends Disposable {
    private readonly windowId;
    private readonly fileService;
    constructor(windowId: number, mainProcessService: IMainProcessService, fileService: IFileService);
    private doRequest;
    getResourceUriProvider(): (uri: URI) => any;
}
