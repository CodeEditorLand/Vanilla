import { CancellationToken } from "vs/base/common/cancellation";
import { SerializedError } from "vs/base/common/errors";
import { IDisposable } from "vs/base/common/lifecycle";
import { ExtensionIdentifier, IExtensionDescription } from "vs/platform/extensions/common/extensions";
import { ILogService } from "vs/platform/log/common/log";
import { ExtHostLanguageModelsShape } from "vs/workbench/api/common/extHost.protocol";
import { IExtHostAuthentication } from "vs/workbench/api/common/extHostAuthentication";
import { IExtHostRpcService } from "vs/workbench/api/common/extHostRpcService";
import { IChatMessage, IChatResponseFragment, ILanguageModelChatMetadata } from "vs/workbench/contrib/chat/common/languageModels";
import type * as vscode from "vscode";
export interface IExtHostLanguageModels extends ExtHostLanguageModels {
}
export declare const IExtHostLanguageModels: any;
export declare class ExtHostLanguageModels implements ExtHostLanguageModelsShape {
    private readonly _logService;
    private readonly _extHostAuthentication;
    _serviceBrand: undefined;
    private static _idPool;
    private readonly _proxy;
    private readonly _onDidChangeModelAccess;
    private readonly _onDidChangeProviders;
    readonly onDidChangeProviders: any;
    private readonly _languageModels;
    private readonly _allLanguageModelData;
    private readonly _modelAccessList;
    private readonly _pendingRequest;
    constructor(extHostRpc: IExtHostRpcService, _logService: ILogService, _extHostAuthentication: IExtHostAuthentication);
    dispose(): void;
    registerLanguageModel(extension: IExtensionDescription, identifier: string, provider: vscode.ChatResponseProvider, metadata: vscode.ChatResponseProviderMetadata): IDisposable;
    $startChatRequest(handle: number, requestId: number, from: ExtensionIdentifier, messages: IChatMessage[], options: vscode.LanguageModelChatRequestOptions, token: CancellationToken): Promise<void>;
    $provideTokenLength(handle: number, value: string, token: CancellationToken): Promise<number>;
    $acceptChatModelMetadata(data: {
        added?: {
            identifier: string;
            metadata: ILanguageModelChatMetadata;
        }[] | undefined;
        removed?: string[] | undefined;
    }): void;
    selectLanguageModels(extension: IExtensionDescription, selector: vscode.LanguageModelChatSelector): Promise<vscode.LanguageModelChat[]>;
    private _sendChatRequest;
    private _convertMessages;
    $acceptResponsePart(requestId: number, chunk: IChatResponseFragment): Promise<void>;
    $acceptResponseDone(requestId: number, error: SerializedError | undefined): Promise<void>;
    private _getAuthAccess;
    private _isUsingAuth;
    private _fakeAuthPopulate;
    private _computeTokenLength;
    $updateModelAccesslist(data: {
        from: ExtensionIdentifier;
        to: ExtensionIdentifier;
        enabled: boolean;
    }[]): void;
    private readonly _languageAccessInformationExtensions;
    createLanguageModelAccessInformation(from: Readonly<IExtensionDescription>): vscode.LanguageModelAccessInformation;
}
