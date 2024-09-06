import { Emitter, Event } from "vs/base/common/event";
import { Disposable } from "vs/base/common/lifecycle";
import { URI } from "vs/base/common/uri";
import { ConfigurationTarget, IConfigurationChangeEvent, IConfigurationData, IConfigurationOverrides, IConfigurationUpdateOptions, IConfigurationUpdateOverrides, IConfigurationValue } from "vs/platform/configuration/common/configuration";
import { ConfigurationModel } from "vs/platform/configuration/common/configurationModels";
import { IFileService } from "vs/platform/files/common/files";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { ILogService } from "vs/platform/log/common/log";
import { IPolicyService } from "vs/platform/policy/common/policy";
import { IUriIdentityService } from "vs/platform/uriIdentity/common/uriIdentity";
import { IUserDataProfilesService } from "vs/platform/userDataProfile/common/userDataProfile";
import { Workspace as BaseWorkspace, IAnyWorkspaceIdentifier, ISingleFolderWorkspaceIdentifier, IWorkspaceContextService, IWorkspaceFolder, IWorkspaceFoldersChangeEvent, IWorkspaceFoldersWillChangeEvent, IWorkspaceIdentifier, WorkbenchState } from "vs/platform/workspace/common/workspace";
import { IWorkspaceFolderCreationData } from "vs/platform/workspaces/common/workspaces";
import { IConfigurationCache, IWorkbenchConfigurationService } from "vs/workbench/services/configuration/common/configuration";
import { IBrowserWorkbenchEnvironmentService } from "vs/workbench/services/environment/browser/environmentService";
import { IRemoteAgentService } from "vs/workbench/services/remote/common/remoteAgentService";
import { IUserDataProfileService } from "vs/workbench/services/userDataProfile/common/userDataProfile";
declare class Workspace extends BaseWorkspace {
    initialized: boolean;
}
export declare class WorkspaceService extends Disposable implements IWorkbenchConfigurationService, IWorkspaceContextService {
    private readonly userDataProfileService;
    private readonly userDataProfilesService;
    private readonly fileService;
    private readonly remoteAgentService;
    private readonly uriIdentityService;
    private readonly logService;
    _serviceBrand: undefined;
    private workspace;
    private initRemoteUserConfigurationBarrier;
    private completeWorkspaceBarrier;
    private readonly configurationCache;
    private _configuration;
    private initialized;
    private readonly defaultConfiguration;
    private readonly policyConfiguration;
    private applicationConfiguration;
    private readonly applicationConfigurationDisposables;
    private readonly localUserConfiguration;
    private readonly remoteUserConfiguration;
    private readonly workspaceConfiguration;
    private cachedFolderConfigs;
    private readonly workspaceEditingQueue;
    private readonly _onDidChangeConfiguration;
    readonly onDidChangeConfiguration: Event<IConfigurationChangeEvent>;
    protected readonly _onWillChangeWorkspaceFolders: Emitter<IWorkspaceFoldersWillChangeEvent>;
    readonly onWillChangeWorkspaceFolders: Event<IWorkspaceFoldersWillChangeEvent>;
    private readonly _onDidChangeWorkspaceFolders;
    readonly onDidChangeWorkspaceFolders: Event<IWorkspaceFoldersChangeEvent>;
    private readonly _onDidChangeWorkspaceName;
    readonly onDidChangeWorkspaceName: Event<void>;
    private readonly _onDidChangeWorkbenchState;
    readonly onDidChangeWorkbenchState: Event<WorkbenchState>;
    private isWorkspaceTrusted;
    private _restrictedSettings;
    get restrictedSettings(): RestrictedSettings;
    private readonly _onDidChangeRestrictedSettings;
    readonly onDidChangeRestrictedSettings: any;
    private readonly configurationRegistry;
    private instantiationService;
    private configurationEditing;
    constructor({ remoteAuthority, configurationCache, }: {
        remoteAuthority?: string;
        configurationCache: IConfigurationCache;
    }, environmentService: IBrowserWorkbenchEnvironmentService, userDataProfileService: IUserDataProfileService, userDataProfilesService: IUserDataProfilesService, fileService: IFileService, remoteAgentService: IRemoteAgentService, uriIdentityService: IUriIdentityService, logService: ILogService, policyService: IPolicyService);
    private createApplicationConfiguration;
    getCompleteWorkspace(): Promise<Workspace>;
    getWorkspace(): Workspace;
    getWorkbenchState(): WorkbenchState;
    getWorkspaceFolder(resource: URI): IWorkspaceFolder | null;
    addFolders(foldersToAdd: IWorkspaceFolderCreationData[], index?: number): Promise<void>;
    removeFolders(foldersToRemove: URI[]): Promise<void>;
    updateFolders(foldersToAdd: IWorkspaceFolderCreationData[], foldersToRemove: URI[], index?: number): Promise<void>;
    isInsideWorkspace(resource: URI): boolean;
    isCurrentWorkspace(workspaceIdOrFolder: IWorkspaceIdentifier | ISingleFolderWorkspaceIdentifier | URI): boolean;
    private doUpdateFolders;
    private setFolders;
    private contains;
    getConfigurationData(): IConfigurationData;
    getValue<T>(): T;
    getValue<T>(section: string): T;
    getValue<T>(overrides: IConfigurationOverrides): T;
    getValue<T>(section: string, overrides: IConfigurationOverrides): T;
    updateValue(key: string, value: any): Promise<void>;
    updateValue(key: string, value: any, overrides: IConfigurationOverrides | IConfigurationUpdateOverrides): Promise<void>;
    updateValue(key: string, value: any, target: ConfigurationTarget): Promise<void>;
    updateValue(key: string, value: any, overrides: IConfigurationOverrides | IConfigurationUpdateOverrides, target: ConfigurationTarget, options?: IConfigurationUpdateOptions): Promise<void>;
    reloadConfiguration(target?: ConfigurationTarget | IWorkspaceFolder): Promise<void>;
    hasCachedConfigurationDefaultsOverrides(): boolean;
    inspect<T>(key: string, overrides?: IConfigurationOverrides): IConfigurationValue<T>;
    keys(): {
        default: string[];
        user: string[];
        workspace: string[];
        workspaceFolder: string[];
    };
    whenRemoteConfigurationLoaded(): Promise<void>;
    /**
     * At present, all workspaces (empty, single-folder, multi-root) in local and remote
     * can be initialized without requiring extension host except following case:
     *
     * A multi root workspace with .code-workspace file that has to be resolved by an extension.
     * Because of readonly `rootPath` property in extension API we have to resolve multi root workspace
     * before extension host starts so that `rootPath` can be set to first folder.
     *
     * This restriction is lifted partially for web in `MainThreadWorkspace`.
     * In web, we start extension host with empty `rootPath` in this case.
     *
     * Related root path issue discussion is being tracked here - https://github.com/microsoft/vscode/issues/69335
     */
    initialize(arg: IAnyWorkspaceIdentifier): Promise<void>;
    updateWorkspaceTrust(trusted: boolean): void;
    acquireInstantiationService(instantiationService: IInstantiationService): void;
    isSettingAppliedForAllProfiles(key: string): boolean;
    private createWorkspace;
    private createMultiFolderWorkspace;
    private createSingleFolderWorkspace;
    private createEmptyWorkspace;
    private checkAndMarkWorkspaceComplete;
    private updateWorkspaceAndInitializeConfiguration;
    private compareFolders;
    private initializeConfiguration;
    private reloadDefaultConfiguration;
    private reloadApplicationConfiguration;
    private reloadUserConfiguration;
    reloadLocalUserConfiguration(donotTrigger?: boolean, settingsConfiguration?: ConfigurationModel): Promise<ConfigurationModel>;
    private reloadRemoteUserConfiguration;
    private reloadWorkspaceConfiguration;
    private reloadWorkspaceFolderConfiguration;
    private loadConfiguration;
    private getWorkspaceConfigurationModel;
    private onUserDataProfileChanged;
    private onDefaultConfigurationChanged;
    private onPolicyConfigurationChanged;
    private onApplicationConfigurationChanged;
    private onLocalUserConfigurationChanged;
    private onRemoteUserConfigurationChanged;
    private onWorkspaceConfigurationChanged;
    private updateRestrictedSettings;
    private updateWorkspaceConfiguration;
    private handleWillChangeWorkspaceFolders;
    private onWorkspaceFolderConfigurationChanged;
    private onFoldersChanged;
    private loadFolderConfigurations;
    private validateWorkspaceFoldersAndReload;
    private toValidWorkspaceFolders;
    private writeConfigurationValue;
    private createConfigurationEditingService;
    private getConfigurationModelForEditableConfigurationTarget;
    getConfigurationModel(target: ConfigurationTarget, resource?: URI | null): ConfigurationModel | undefined;
    private deriveConfigurationTargets;
    private triggerConfigurationChange;
    private toEditableConfigurationTarget;
}
export {};
