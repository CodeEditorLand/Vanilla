import { IRequestHandler, IWorkerServer } from "vs/base/common/worker/simpleWorker";
/**
 * Defines the worker entry point. Must be exported and named `create`.
 * @skipMangle
 */
export declare function create(workerServer: IWorkerServer): IRequestHandler;
