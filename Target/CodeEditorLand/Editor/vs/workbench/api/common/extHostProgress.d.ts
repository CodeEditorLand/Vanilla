import { CancellationToken } from "vs/base/common/cancellation";
import { IExtensionDescription } from "vs/platform/extensions/common/extensions";
import { IProgressStep, Progress } from "vs/platform/progress/common/progress";
import { ProgressOptions } from "vscode";
import { ExtHostProgressShape, MainThreadProgressShape } from "./extHost.protocol";
export declare class ExtHostProgress implements ExtHostProgressShape {
    private _proxy;
    private _handles;
    private _mapHandleToCancellationSource;
    constructor(proxy: MainThreadProgressShape);
    withProgress<R>(extension: IExtensionDescription, options: ProgressOptions, task: (progress: Progress<IProgressStep>, token: CancellationToken) => Thenable<R>): Promise<R>;
    private _withProgress;
    $acceptProgressCanceled(handle: number): void;
}
