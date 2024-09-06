import { IWorkerClient, IWorkerServer } from "vs/base/common/worker/simpleWorker";
export declare abstract class EditorWorkerHost {
    static CHANNEL_NAME: string;
    static getChannel(workerServer: IWorkerServer): EditorWorkerHost;
    static setChannel(workerClient: IWorkerClient<any>, obj: EditorWorkerHost): void;
    abstract $fhr(method: string, args: any[]): Promise<any>;
}
