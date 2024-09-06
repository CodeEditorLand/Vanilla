import { ILogService } from "../../../platform/log/common/log.js";
import { IExtHostConsumerFileSystem } from "../common/extHostFileSystemConsumer.js";
export declare class ExtHostDiskFileSystemProvider {
    constructor(extHostConsumerFileSystem: IExtHostConsumerFileSystem, logService: ILogService);
}
