import { CancellationToken } from "vs/base/common/cancellation";
import { UriComponents } from "vs/base/common/uri";
import { IURITransformer } from "vs/base/common/uriIpc";
import { ExtHostShareShape, IMainContext, IShareableItemDto } from "vs/workbench/api/common/extHost.protocol";
import type * as vscode from "vscode";
export declare class ExtHostShare implements ExtHostShareShape {
    private readonly uriTransformer;
    private static handlePool;
    private proxy;
    private providers;
    constructor(mainContext: IMainContext, uriTransformer: IURITransformer | undefined);
    $provideShare(handle: number, shareableItem: IShareableItemDto, token: CancellationToken): Promise<UriComponents | string | undefined>;
    registerShareProvider(selector: vscode.DocumentSelector, provider: vscode.ShareProvider): vscode.Disposable;
}
