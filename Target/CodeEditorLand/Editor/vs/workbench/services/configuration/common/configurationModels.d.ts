import type { ResourceMap } from "../../../../base/common/map.js";
import type { URI } from "../../../../base/common/uri.js";
import { type IConfigurationChange, type IConfigurationModel, type IConfigurationOverrides, type IConfigurationValue } from "../../../../platform/configuration/common/configuration.js";
import { Configuration as BaseConfiguration, ConfigurationModel, ConfigurationModelParser, type ConfigurationParseOptions } from "../../../../platform/configuration/common/configurationModels.js";
import type { ILogService } from "../../../../platform/log/common/log.js";
import type { Workspace } from "../../../../platform/workspace/common/workspace.js";
import type { IStoredWorkspaceFolder } from "../../../../platform/workspaces/common/workspaces.js";
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
