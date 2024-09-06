import { VSBuffer } from "vs/base/common/buffer";
import { IReadonlyVSDataTransfer } from "vs/base/common/dataTransfer";
export declare class DataTransferFileCache {
    private requestIdPool;
    private readonly dataTransferFiles;
    add(dataTransfer: IReadonlyVSDataTransfer): {
        id: number;
        dispose: () => void;
    };
    resolveFileData(requestId: number, dataItemId: string): Promise<VSBuffer>;
    dispose(): void;
}
