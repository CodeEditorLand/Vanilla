import { Disposable } from "vs/base/common/lifecycle";
import { IUniversalWatcher, IUniversalWatchRequest } from "vs/platform/files/common/watcher";
export declare class UniversalWatcher extends Disposable implements IUniversalWatcher {
    private readonly recursiveWatcher;
    private readonly nonRecursiveWatcher;
    readonly onDidChangeFile: any;
    readonly onDidError: any;
    private readonly _onDidLogMessage;
    readonly onDidLogMessage: any;
    private requests;
    watch(requests: IUniversalWatchRequest[]): Promise<void>;
    setVerboseLogging(enabled: boolean): Promise<void>;
    stop(): Promise<void>;
}
