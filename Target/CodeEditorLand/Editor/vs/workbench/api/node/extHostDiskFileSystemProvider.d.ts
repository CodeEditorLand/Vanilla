import { ILogService } from "vs/platform/log/common/log";
import { IExtHostConsumerFileSystem } from "vs/workbench/api/common/extHostFileSystemConsumer";
export declare class ExtHostDiskFileSystemProvider {
    constructor(extHostConsumerFileSystem: IExtHostConsumerFileSystem, logService: ILogService);
}
