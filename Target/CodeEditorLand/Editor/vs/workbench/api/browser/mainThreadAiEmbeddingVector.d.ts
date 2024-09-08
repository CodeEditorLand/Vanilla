import { Disposable } from "../../../base/common/lifecycle.js";
import { IAiEmbeddingVectorService } from "../../services/aiEmbeddingVector/common/aiEmbeddingVectorService.js";
import { type IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { type MainThreadAiEmbeddingVectorShape } from "../common/extHost.protocol.js";
export declare class MainThreadAiEmbeddingVector extends Disposable implements MainThreadAiEmbeddingVectorShape {
    private readonly _AiEmbeddingVectorService;
    private readonly _proxy;
    private readonly _registrations;
    constructor(context: IExtHostContext, _AiEmbeddingVectorService: IAiEmbeddingVectorService);
    $registerAiEmbeddingVectorProvider(model: string, handle: number): void;
    $unregisterAiEmbeddingVectorProvider(handle: number): void;
}
