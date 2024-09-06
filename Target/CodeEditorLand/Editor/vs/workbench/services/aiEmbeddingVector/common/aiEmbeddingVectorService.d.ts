import { CancellationToken } from "vs/base/common/cancellation";
import { IDisposable } from "vs/base/common/lifecycle";
import { ILogService } from "vs/platform/log/common/log";
export declare const IAiEmbeddingVectorService: any;
export interface IAiEmbeddingVectorService {
    readonly _serviceBrand: undefined;
    isEnabled(): boolean;
    getEmbeddingVector(str: string, token: CancellationToken): Promise<number[]>;
    getEmbeddingVector(strings: string[], token: CancellationToken): Promise<number[][]>;
    registerAiEmbeddingVectorProvider(model: string, provider: IAiEmbeddingVectorProvider): IDisposable;
}
export interface IAiEmbeddingVectorProvider {
    provideAiEmbeddingVector(strings: string[], token: CancellationToken): Promise<number[][]>;
}
export declare class AiEmbeddingVectorService implements IAiEmbeddingVectorService {
    private readonly logService;
    readonly _serviceBrand: undefined;
    static readonly DEFAULT_TIMEOUT: number;
    private readonly _providers;
    constructor(logService: ILogService);
    isEnabled(): boolean;
    registerAiEmbeddingVectorProvider(model: string, provider: IAiEmbeddingVectorProvider): IDisposable;
    getEmbeddingVector(str: string, token: CancellationToken): Promise<number[]>;
    getEmbeddingVector(strings: string[], token: CancellationToken): Promise<number[][]>;
}
