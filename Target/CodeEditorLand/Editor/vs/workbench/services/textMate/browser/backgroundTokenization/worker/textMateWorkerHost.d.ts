import { UriComponents } from "vs/base/common/uri";
import { IWorkerClient, IWorkerServer } from "vs/base/common/worker/simpleWorker";
import { StateDeltas } from "vs/workbench/services/textMate/browser/backgroundTokenization/worker/textMateTokenizationWorker.worker";
export declare abstract class TextMateWorkerHost {
    static CHANNEL_NAME: string;
    static getChannel(workerServer: IWorkerServer): TextMateWorkerHost;
    static setChannel(workerClient: IWorkerClient<any>, obj: TextMateWorkerHost): void;
    abstract $readFile(_resource: UriComponents): Promise<string>;
    abstract $setTokensAndStates(controllerId: number, versionId: number, tokens: Uint8Array, lineEndStateDeltas: StateDeltas[]): Promise<void>;
    abstract $reportTokenizationTime(timeMs: number, languageId: string, sourceExtensionId: string | undefined, lineLength: number, isRandomSample: boolean): void;
}
