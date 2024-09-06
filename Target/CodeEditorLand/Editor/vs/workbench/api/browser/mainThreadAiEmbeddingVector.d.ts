import { Disposable } from "vs/base/common/lifecycle";
import { MainThreadAiEmbeddingVectorShape } from "vs/workbench/api/common/extHost.protocol";
import { IAiEmbeddingVectorService } from "vs/workbench/services/aiEmbeddingVector/common/aiEmbeddingVectorService";
import { IExtHostContext } from "vs/workbench/services/extensions/common/extHostCustomers";
export declare class MainThreadAiEmbeddingVector extends Disposable implements MainThreadAiEmbeddingVectorShape {
    private readonly _AiEmbeddingVectorService;
    private readonly _proxy;
    private readonly _registrations;
    constructor(context: IExtHostContext, _AiEmbeddingVectorService: IAiEmbeddingVectorService);
    $registerAiEmbeddingVectorProvider(model: string, handle: number): void;
    $unregisterAiEmbeddingVectorProvider(handle: number): void;
}
