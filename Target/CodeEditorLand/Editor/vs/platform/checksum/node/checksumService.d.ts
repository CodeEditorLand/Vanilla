import type { URI } from "../../../base/common/uri.js";
import { IFileService } from "../../files/common/files.js";
import type { IChecksumService } from "../common/checksumService.js";
export declare class ChecksumService implements IChecksumService {
    private readonly fileService;
    readonly _serviceBrand: undefined;
    constructor(fileService: IFileService);
    checksum(resource: URI): Promise<string>;
}
