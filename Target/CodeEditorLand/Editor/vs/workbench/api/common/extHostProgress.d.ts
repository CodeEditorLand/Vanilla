import type { ProgressOptions } from "vscode";
import { CancellationToken } from "../../../base/common/cancellation.js";
import type { IExtensionDescription } from "../../../platform/extensions/common/extensions.js";
import { Progress, type IProgressStep } from "../../../platform/progress/common/progress.js";
import type { ExtHostProgressShape, MainThreadProgressShape } from "./extHost.protocol.js";
export declare class ExtHostProgress implements ExtHostProgressShape {
    private _proxy;
    private _handles;
    private _mapHandleToCancellationSource;
    constructor(proxy: MainThreadProgressShape);
    withProgress<R>(extension: IExtensionDescription, options: ProgressOptions, task: (progress: Progress<IProgressStep>, token: CancellationToken) => Thenable<R>): Promise<R>;
    private _withProgress;
    $acceptProgressCanceled(handle: number): void;
}