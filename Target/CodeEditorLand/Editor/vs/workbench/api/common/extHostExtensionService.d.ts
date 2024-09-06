import { VSBuffer } from "vs/base/common/buffer";
import { Event } from "vs/base/common/event";
import { Disposable } from "vs/base/common/lifecycle";
import { TernarySearchTree } from "vs/base/common/ternarySearchTree";
import { URI, UriComponents } from "vs/base/common/uri";
import { ExtensionIdentifier, IExtensionDescription } from "vs/platform/extensions/common/extensions";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { ILogService } from "vs/platform/log/common/log";
import { IRemoteConnectionData } from "vs/platform/remote/common/remoteAuthorityResolver";
import { ExtHostExtensionServiceShape, MainThreadExtensionServiceShape, MainThreadTelemetryShape, MainThreadWorkspaceShape } from "vs/workbench/api/common/extHost.protocol";
import { ExtHostConfiguration, IExtHostConfiguration } from "vs/workbench/api/common/extHostConfiguration";
import { ExtensionActivationTimesBuilder, IExtensionAPI } from "vs/workbench/api/common/extHostExtensionActivator";
import { IExtHostInitDataService } from "vs/workbench/api/common/extHostInitDataService";
import { IExtHostLanguageModels } from "vs/workbench/api/common/extHostLanguageModels";
import { IExtHostLocalizationService } from "vs/workbench/api/common/extHostLocalizationService";
import { IExtHostManagedSockets } from "vs/workbench/api/common/extHostManagedSockets";
import { IExtHostRpcService } from "vs/workbench/api/common/extHostRpcService";
import { IExtensionStoragePaths } from "vs/workbench/api/common/extHostStoragePaths";
import { IExtHostTerminalService } from "vs/workbench/api/common/extHostTerminalService";
import { IExtHostTunnelService } from "vs/workbench/api/common/extHostTunnelService";
import { ExtensionKind, ExtensionRuntime } from "vs/workbench/api/common/extHostTypes";
import { ExtHostWorkspace, IExtHostWorkspace } from "vs/workbench/api/common/extHostWorkspace";
import { ExtensionDescriptionRegistry } from "vs/workbench/services/extensions/common/extensionDescriptionRegistry";
import { IExtensionDescriptionDelta, IExtensionHostInitData } from "vs/workbench/services/extensions/common/extensionHostProtocol";
import { IResolveAuthorityResult } from "vs/workbench/services/extensions/common/extensionHostProxy";
import { ActivationKind, ExtensionActivationReason } from "vs/workbench/services/extensions/common/extensions";
import { Dto } from "vs/workbench/services/extensions/common/proxyIdentifier";
import type * as vscode from "vscode";
export declare const IHostUtils: any;
export interface IHostUtils {
    readonly _serviceBrand: undefined;
    readonly pid: number | undefined;
    exit(code: number): void;
    fsExists?(path: string): Promise<boolean>;
    fsRealpath?(path: string): Promise<string>;
}
export declare abstract class AbstractExtHostExtensionService extends Disposable implements ExtHostExtensionServiceShape {
    private readonly _extHostManagedSockets;
    private readonly _extHostLanguageModels;
    readonly _serviceBrand: undefined;
    abstract readonly extensionRuntime: ExtensionRuntime;
    private readonly _onDidChangeRemoteConnectionData;
    readonly onDidChangeRemoteConnectionData: any;
    protected readonly _hostUtils: IHostUtils;
    protected readonly _initData: IExtensionHostInitData;
    protected readonly _extHostContext: IExtHostRpcService;
    protected readonly _instaService: IInstantiationService;
    protected readonly _extHostWorkspace: ExtHostWorkspace;
    protected readonly _extHostConfiguration: ExtHostConfiguration;
    protected readonly _logService: ILogService;
    protected readonly _extHostTunnelService: IExtHostTunnelService;
    protected readonly _extHostTerminalService: IExtHostTerminalService;
    protected readonly _extHostLocalizationService: IExtHostLocalizationService;
    protected readonly _mainThreadWorkspaceProxy: MainThreadWorkspaceShape;
    protected readonly _mainThreadTelemetryProxy: MainThreadTelemetryShape;
    protected readonly _mainThreadExtensionsProxy: MainThreadExtensionServiceShape;
    private readonly _almostReadyToRunExtensions;
    private readonly _readyToStartExtensionHost;
    private readonly _readyToRunExtensions;
    private readonly _eagerExtensionsActivated;
    private readonly _activationEventsReader;
    protected readonly _myRegistry: ExtensionDescriptionRegistry;
    protected readonly _globalRegistry: ExtensionDescriptionRegistry;
    private readonly _storage;
    private readonly _secretState;
    private readonly _storagePath;
    private readonly _activator;
    private _extensionPathIndex;
    private _realPathCache;
    private readonly _resolvers;
    private _started;
    private _isTerminating;
    private _remoteConnectionData;
    constructor(instaService: IInstantiationService, hostUtils: IHostUtils, extHostContext: IExtHostRpcService, extHostWorkspace: IExtHostWorkspace, extHostConfiguration: IExtHostConfiguration, logService: ILogService, initData: IExtHostInitDataService, storagePath: IExtensionStoragePaths, extHostTunnelService: IExtHostTunnelService, extHostTerminalService: IExtHostTerminalService, extHostLocalizationService: IExtHostLocalizationService, _extHostManagedSockets: IExtHostManagedSockets, _extHostLanguageModels: IExtHostLanguageModels);
    getRemoteConnectionData(): IRemoteConnectionData | null;
    initialize(): Promise<void>;
    private _deactivateAll;
    terminate(reason: string, code?: number): void;
    isActivated(extensionId: ExtensionIdentifier): boolean;
    getExtension(extensionId: string): Promise<IExtensionDescription | undefined>;
    private _activateByEvent;
    private _activateById;
    activateByIdWithErrors(extensionId: ExtensionIdentifier, reason: ExtensionActivationReason): Promise<void>;
    getExtensionRegistry(): Promise<ExtensionDescriptionRegistry>;
    getExtensionExports(extensionId: ExtensionIdentifier): IExtensionAPI | null | undefined;
    /**
     * Applies realpath to file-uris and returns all others uris unmodified.
     * The real path is cached for the lifetime of the extension host.
     */
    private _realPathExtensionUri;
    getExtensionPathIndex(): Promise<ExtensionPaths>;
    /**
     * create trie to enable fast 'filename -> extension id' look up
     */
    private _createExtensionPathIndex;
    private _deactivate;
    private _activateExtension;
    private _logExtensionActivationTimes;
    private _doActivateExtension;
    private _loadExtensionContext;
    private static _callActivate;
    private static _callActivateOptional;
    private _activateOneStartupFinished;
    private _activateAllStartupFinishedDeferred;
    private _activateAllStartupFinished;
    private _handleEagerExtensions;
    private _handleWorkspaceContainsEagerExtensions;
    private _handleWorkspaceContainsEagerExtension;
    private _handleRemoteResolverEagerExtensions;
    $extensionTestsExecute(): Promise<number>;
    private _doHandleExtensionTests;
    private _startExtensionHost;
    registerRemoteAuthorityResolver(authorityPrefix: string, resolver: vscode.RemoteAuthorityResolver): vscode.Disposable;
    getRemoteExecServer(remoteAuthority: string): Promise<vscode.ExecServer | undefined>;
    private _activateAndGetResolver;
    $resolveAuthority(remoteAuthorityChain: string, resolveAttempt: number): Promise<Dto<IResolveAuthorityResult>>;
    $getCanonicalURI(remoteAuthority: string, uriComponents: UriComponents): Promise<UriComponents | null>;
    $startExtensionHost(extensionsDelta: IExtensionDescriptionDelta): Promise<void>;
    $activateByEvent(activationEvent: string, activationKind: ActivationKind): Promise<void>;
    $activate(extensionId: ExtensionIdentifier, reason: ExtensionActivationReason): Promise<boolean>;
    $deltaExtensions(extensionsDelta: IExtensionDescriptionDelta): Promise<void>;
    $test_latency(n: number): Promise<number>;
    $test_up(b: VSBuffer): Promise<number>;
    $test_down(size: number): Promise<VSBuffer>;
    $updateRemoteConnectionData(connectionData: IRemoteConnectionData): Promise<void>;
    protected abstract _beforeAlmostReadyToRunExtensions(): Promise<void>;
    protected abstract _getEntryPoint(extensionDescription: IExtensionDescription): string | undefined;
    protected abstract _loadCommonJSModule<T extends object | undefined>(extensionId: IExtensionDescription | null, module: URI, activationTimesBuilder: ExtensionActivationTimesBuilder): Promise<T>;
    abstract $setRemoteEnvironment(env: {
        [key: string]: string | null;
    }): Promise<void>;
}
export declare const IExtHostExtensionService: any;
export interface IExtHostExtensionService extends AbstractExtHostExtensionService {
    readonly _serviceBrand: undefined;
    initialize(): Promise<void>;
    terminate(reason: string): void;
    getExtension(extensionId: string): Promise<IExtensionDescription | undefined>;
    isActivated(extensionId: ExtensionIdentifier): boolean;
    activateByIdWithErrors(extensionId: ExtensionIdentifier, reason: ExtensionActivationReason): Promise<void>;
    getExtensionExports(extensionId: ExtensionIdentifier): IExtensionAPI | null | undefined;
    getExtensionRegistry(): Promise<ExtensionDescriptionRegistry>;
    getExtensionPathIndex(): Promise<ExtensionPaths>;
    registerRemoteAuthorityResolver(authorityPrefix: string, resolver: vscode.RemoteAuthorityResolver): vscode.Disposable;
    getRemoteExecServer(authority: string): Promise<vscode.ExecServer | undefined>;
    onDidChangeRemoteConnectionData: Event<void>;
    getRemoteConnectionData(): IRemoteConnectionData | null;
}
export declare class Extension<T extends object | null | undefined> implements vscode.Extension<T> {
    #private;
    readonly id: string;
    readonly extensionUri: URI;
    readonly extensionPath: string;
    readonly packageJSON: IExtensionDescription;
    readonly extensionKind: vscode.ExtensionKind;
    readonly isFromDifferentExtensionHost: boolean;
    constructor(extensionService: IExtHostExtensionService, originExtensionId: ExtensionIdentifier, description: IExtensionDescription, kind: ExtensionKind, isFromDifferentExtensionHost: boolean);
    get isActive(): boolean;
    get exports(): T;
    activate(): Promise<T>;
}
export declare class ExtensionPaths {
    private _searchTree;
    constructor(_searchTree: TernarySearchTree<URI, IExtensionDescription>);
    setSearchTree(searchTree: TernarySearchTree<URI, IExtensionDescription>): void;
    findSubstr(key: URI): IExtensionDescription | undefined;
    forEach(callback: (value: IExtensionDescription, index: URI) => any): void;
}
