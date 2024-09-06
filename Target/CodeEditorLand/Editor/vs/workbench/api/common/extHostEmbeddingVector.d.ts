import { IExtensionDescription } from "vs/platform/extensions/common/extensions";
import { ExtHostAiEmbeddingVectorShape, IMainContext } from "vs/workbench/api/common/extHost.protocol";
import { Disposable } from "vs/workbench/api/common/extHostTypes";
import type { CancellationToken, EmbeddingVectorProvider } from "vscode";
export declare class ExtHostAiEmbeddingVector implements ExtHostAiEmbeddingVectorShape {
    private _AiEmbeddingVectorProviders;
    private _nextHandle;
    private readonly _proxy;
    constructor(mainContext: IMainContext);
    $provideAiEmbeddingVector(handle: number, strings: string[], token: CancellationToken): Promise<number[][]>;
    registerEmbeddingVectorProvider(extension: IExtensionDescription, model: string, provider: EmbeddingVectorProvider): Disposable;
}
