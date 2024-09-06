import { CancellationToken } from "vs/base/common/cancellation";
import { Event } from "vs/base/common/event";
import { IDisposable } from "vs/base/common/lifecycle";
import { MainThreadEmbeddingsShape } from "vs/workbench/api/common/extHost.protocol";
import { IExtHostContext } from "vs/workbench/services/extensions/common/extHostCustomers";
interface IEmbeddingsProvider {
    provideEmbeddings(input: string[], token: CancellationToken): Promise<{
        values: number[];
    }[]>;
}
declare const IEmbeddingsService: any;
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
