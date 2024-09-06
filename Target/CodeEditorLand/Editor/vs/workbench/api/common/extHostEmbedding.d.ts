import { CancellationToken } from "vs/base/common/cancellation";
import { Event } from "vs/base/common/event";
import { IDisposable } from "vs/base/common/lifecycle";
import { IExtensionDescription } from "vs/platform/extensions/common/extensions";
import { ExtHostEmbeddingsShape, IMainContext } from "vs/workbench/api/common/extHost.protocol";
import type * as vscode from "vscode";
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
