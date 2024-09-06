import { ResourceMap } from "vs/base/common/map";
import { URI } from "vs/base/common/uri";
import { IConfigurationChange, IConfigurationModel, IConfigurationOverrides, IConfigurationValue } from "vs/platform/configuration/common/configuration";
import { Configuration as BaseConfiguration, ConfigurationModel, ConfigurationModelParser, ConfigurationParseOptions } from "vs/platform/configuration/common/configurationModels";
import { ILogService } from "vs/platform/log/common/log";
import { Workspace } from "vs/platform/workspace/common/workspace";
import { IStoredWorkspaceFolder } from "vs/platform/workspaces/common/workspaces";
export declare class WorkspaceConfigurationModelParser extends ConfigurationModelParser {
    private _folders;
    private _transient;
    private _settingsModelParser;
    private _launchModel;
    private _tasksModel;
    constructor(name: string, logService: ILogService);
    get folders(): IStoredWorkspaceFolder[];
    get transient(): boolean;
    get settingsModel(): ConfigurationModel;
    get launchModel(): ConfigurationModel;
    get tasksModel(): ConfigurationModel;
    reparseWorkspaceSettings(configurationParseOptions: ConfigurationParseOptions): void;
    getRestrictedWorkspaceSettings(): string[];
    protected doParseRaw(raw: any, configurationParseOptions?: ConfigurationParseOptions): IConfigurationModel;
    private createConfigurationModelFrom;
}
export declare class StandaloneConfigurationModelParser extends ConfigurationModelParser {
    private readonly scope;
    constructor(name: string, scope: string, logService: ILogService);
    protected doParseRaw(raw: any, configurationParseOptions?: ConfigurationParseOptions): IConfigurationModel;
}
export declare class Configuration extends BaseConfiguration {
    private readonly _workspace;
    constructor(defaults: ConfigurationModel, policy: ConfigurationModel, application: ConfigurationModel, localUser: ConfigurationModel, remoteUser: ConfigurationModel, workspaceConfiguration: ConfigurationModel, folders: ResourceMap<ConfigurationModel>, memoryConfiguration: ConfigurationModel, memoryConfigurationByResource: ResourceMap<ConfigurationModel>, _workspace: Workspace | undefined, logService: ILogService);
    getValue(key: string | undefined, overrides?: IConfigurationOverrides): any;
    inspect<C>(key: string, overrides?: IConfigurationOverrides): IConfigurationValue<C>;
    keys(): {
        default: string[];
        user: string[];
        workspace: string[];
        workspaceFolder: string[];
    };
    compareAndDeleteFolderConfiguration(folder: URI): IConfigurationChange;
    compare(other: Configuration): IConfigurationChange;
}
