import type * as vscode from "vscode";
import { CancellationToken } from "../../../base/common/cancellation.js";
import { type Event } from "../../../base/common/event.js";
import { type IDisposable } from "../../../base/common/lifecycle.js";
import type { IExtensionDescription } from "../../../platform/extensions/common/extensions.js";
import { type ExtHostEmbeddingsShape, type IMainContext } from "./extHost.protocol.js";
export declare class ExtHostEmbeddings implements ExtHostEmbeddingsShape {
    private readonly _proxy;
    private readonly _provider;
    private readonly _onDidChange;
    readonly onDidChange: Event<void>;
    private _allKnownModels;
    private _handlePool;
    constructor(mainContext: IMainContext);
    registerEmbeddingsProvider(_extension: IExtensionDescription, embeddingsModel: string, provider: vscode.EmbeddingsProvider): IDisposable;
    computeEmbeddings(embeddingsModel: string, input: string, token?: vscode.CancellationToken): Promise<vscode.Embedding>;
    computeEmbeddings(embeddingsModel: string, input: string[], token?: vscode.CancellationToken): Promise<vscode.Embedding[]>;
    $provideEmbeddings(handle: number, input: string[], token: CancellationToken): Promise<{
        values: number[];
    }[]>;
    get embeddingsModels(): string[];
    $acceptEmbeddingModels(models: string[]): void;
}
