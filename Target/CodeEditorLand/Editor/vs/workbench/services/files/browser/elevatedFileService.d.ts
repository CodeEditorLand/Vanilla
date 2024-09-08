import type { VSBuffer, VSBufferReadable, VSBufferReadableStream } from "../../../../base/common/buffer.js";
import type { URI } from "../../../../base/common/uri.js";
import type { IFileStatWithMetadata, IWriteFileOptions } from "../../../../platform/files/common/files.js";
import { IElevatedFileService } from "../common/elevatedFileService.js";
export declare class BrowserElevatedFileService implements IElevatedFileService {
    readonly _serviceBrand: undefined;
    isSupported(resource: URI): boolean;
    writeFileElevated(resource: URI, value: VSBuffer | VSBufferReadable | VSBufferReadableStream, options?: IWriteFileOptions): Promise<IFileStatWithMetadata>;
}