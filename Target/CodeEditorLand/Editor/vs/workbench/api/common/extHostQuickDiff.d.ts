import { CancellationToken } from "vs/base/common/cancellation";
import { UriComponents } from "vs/base/common/uri";
import { IURITransformer } from "vs/base/common/uriIpc";
import { ExtHostQuickDiffShape, IMainContext } from "vs/workbench/api/common/extHost.protocol";
import type * as vscode from "vscode";
export declare class ExtHostQuickDiff implements ExtHostQuickDiffShape {
    private readonly uriTransformer;
    private static handlePool;
    private proxy;
    private providers;
    constructor(mainContext: IMainContext, uriTransformer: IURITransformer | undefined);
    $provideOriginalResource(handle: number, uriComponents: UriComponents, token: CancellationToken): Promise<UriComponents | null>;
    registerQuickDiffProvider(selector: vscode.DocumentSelector, quickDiffProvider: vscode.QuickDiffProvider, label: string, rootUri?: vscode.Uri): vscode.Disposable;
}
