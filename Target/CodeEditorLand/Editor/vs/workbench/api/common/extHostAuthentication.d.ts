import { Event } from "vs/base/common/event";
import { IExtensionDescription } from "vs/platform/extensions/common/extensions";
import { ExtHostAuthenticationShape } from "vs/workbench/api/common/extHost.protocol";
import { IExtHostRpcService } from "vs/workbench/api/common/extHostRpcService";
import type * as vscode from "vscode";
export interface IExtHostAuthentication extends ExtHostAuthentication {
}
export declare const IExtHostAuthentication: any;
export declare class ExtHostAuthentication implements ExtHostAuthenticationShape {
    _serviceBrand: undefined;
    private _proxy;
    private _authenticationProviders;
    private _onDidChangeSessions;
    readonly onDidChangeSessions: Event<vscode.AuthenticationSessionsChangeEvent>;
    private _getSessionTaskSingler;
    constructor(extHostRpc: IExtHostRpcService);
    getSession(requestingExtension: IExtensionDescription, providerId: string, scopes: readonly string[], options: vscode.AuthenticationGetSessionOptions & ({
        createIfNone: true;
    } | {
        forceNewSession: true;
    } | {
        forceNewSession: vscode.AuthenticationForceNewSessionOptions;
    })): Promise<vscode.AuthenticationSession>;
    getSession(requestingExtension: IExtensionDescription, providerId: string, scopes: readonly string[], options: vscode.AuthenticationGetSessionOptions & {
        forceNewSession: true;
    }): Promise<vscode.AuthenticationSession>;
    getSession(requestingExtension: IExtensionDescription, providerId: string, scopes: readonly string[], options: vscode.AuthenticationGetSessionOptions & {
        forceNewSession: vscode.AuthenticationForceNewSessionOptions;
    }): Promise<vscode.AuthenticationSession>;
    getSession(requestingExtension: IExtensionDescription, providerId: string, scopes: readonly string[], options: vscode.AuthenticationGetSessionOptions): Promise<vscode.AuthenticationSession | undefined>;
    getAccounts(providerId: string): Promise<any>;
    removeSession(providerId: string, sessionId: string): Promise<void>;
    registerAuthenticationProvider(id: string, label: string, provider: vscode.AuthenticationProvider, options?: vscode.AuthenticationProviderOptions): vscode.Disposable;
    $createSession(providerId: string, scopes: string[], options: vscode.AuthenticationProviderSessionOptions): Promise<vscode.AuthenticationSession>;
    $removeSession(providerId: string, sessionId: string): Promise<void>;
    $getSessions(providerId: string, scopes: ReadonlyArray<string> | undefined, options: vscode.AuthenticationProviderSessionOptions): Promise<ReadonlyArray<vscode.AuthenticationSession>>;
    $onDidChangeAuthenticationSessions(id: string, label: string): Promise<void>;
}
