import { URI } from "vs/base/common/uri";
import { IWorkerClient, IWorkerDescriptor } from "vs/base/common/worker/simpleWorker";
export declare function createBlobWorker(blobUrl: string, options?: WorkerOptions): Worker;
export declare class WorkerDescriptor implements IWorkerDescriptor {
    readonly amdModuleId: string;
    readonly label: string | undefined;
    readonly esmModuleLocation: URI | undefined;
    constructor(amdModuleId: string, label: string | undefined);
}
export declare function createWebWorker<T extends object>(amdModuleId: string, label: string | undefined): IWorkerClient<T>;
export declare function createWebWorker<T extends object>(workerDescriptor: IWorkerDescriptor): IWorkerClient<T>;