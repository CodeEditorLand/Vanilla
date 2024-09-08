import type { CancellationToken } from "../../../base/common/cancellation.js";
import { type Event } from "../../../base/common/event.js";
import { type IDisposable } from "../../../base/common/lifecycle.js";
import { type IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { type MainThreadEmbeddingsShape } from "../common/extHost.protocol.js";
interface IEmbeddingsProvider {
    provideEmbeddings(input: string[], token: CancellationToken): Promise<{
        values: number[];
    }[]>;
}
declare const IEmbeddingsService: import("../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IEmbeddingsService>;
interface IEmbeddingsService {
    _serviceBrand: undefined;
    readonly onDidChange: Event<void>;
    allProviders: Iterable<string>;
    registerProvider(id: string, provider: IEmbeddingsProvider): IDisposable;
    computeEmbeddings(id: string, input: string[], token: CancellationToken): Promise<{
        values: number[];
    }[]>;
}
export declare class MainThreadEmbeddings implements MainThreadEmbeddingsShape {
    private readonly embeddingsService;
    private readonly _store;
    private readonly _providers;
    private readonly _proxy;
    constructor(context: IExtHostContext, embeddingsService: IEmbeddingsService);
    dispose(): void;
    $registerEmbeddingProvider(handle: number, identifier: string): void;
    $unregisterEmbeddingProvider(handle: number): void;
    $computeEmbeddings(embeddingsModel: string, input: string[], token: CancellationToken): Promise<{
        values: number[];
    }[]>;
}
export {};
