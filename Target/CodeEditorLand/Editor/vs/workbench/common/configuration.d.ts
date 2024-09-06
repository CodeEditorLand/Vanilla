import { Disposable } from "vs/base/common/lifecycle";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IUserDataProfilesService } from "vs/platform/userDataProfile/common/userDataProfile";
import { IWorkspaceContextService } from "vs/platform/workspace/common/workspace";
import { IWorkbenchContribution } from "vs/workbench/common/contributions";
import { IRemoteAgentService } from "vs/workbench/services/remote/common/remoteAgentService";
export declare const applicationConfigurationNodeBase: IConfigurationNode;
export declare const workbenchConfigurationNodeBase: IConfigurationNode;
export declare const securityConfigurationNodeBase: IConfigurationNode;
export declare const problemsConfigurationNodeBase: IConfigurationNode;
export declare const windowConfigurationNodeBase: IConfigurationNode;
export declare const Extensions: {
    ConfigurationMigration: string;
};
export type ConfigurationValue = {
    value: any | undefined;
};
export type ConfigurationKeyValuePairs = [string, ConfigurationValue][];
export type ConfigurationMigrationFn = (value: any, valueAccessor: (key: string) => any) => ConfigurationValue | ConfigurationKeyValuePairs | Promise<ConfigurationValue | ConfigurationKeyValuePairs>;
export type ConfigurationMigration = {
    key: string;
    migrateFn: ConfigurationMigrationFn;
};
export interface IConfigurationMigrationRegistry {
    registerConfigurationMigrations(configurationMigrations: ConfigurationMigration[]): void;
}
export declare class ConfigurationMigrationWorkbenchContribution extends Disposable implements IWorkbenchContribution {
    private readonly configurationService;
    private readonly workspaceService;
    static readonly ID = "workbench.contrib.configurationMigration";
    constructor(configurationService: IConfigurationService, workspaceService: IWorkspaceContextService);
    private migrateConfigurations;
    private migrateConfigurationsForFolder;
    private migrateConfigurationsForFolderAndOverride;
    private runMigration;
}
export declare class DynamicWorkbenchSecurityConfiguration extends Disposable implements IWorkbenchContribution {
    private readonly remoteAgentService;
    static readonly ID = "workbench.contrib.dynamicWorkbenchSecurityConfiguration";
    private readonly _ready;
    readonly ready: any;
    constructor(remoteAgentService: IRemoteAgentService);
    private create;
    private doCreate;
}
export declare const CONFIG_NEW_WINDOW_PROFILE = "window.newWindowProfile";
export declare class DynamicWindowConfiguration extends Disposable implements IWorkbenchContribution {
    private readonly userDataProfilesService;
    private readonly configurationService;
    static readonly ID = "workbench.contrib.dynamicWindowConfiguration";
    private configurationNode;
    private newWindowProfile;
    constructor(userDataProfilesService: IUserDataProfilesService, configurationService: IConfigurationService);
    private registerNewWindowProfileConfiguration;
    private setNewWindowProfile;
    private checkAndResetNewWindowProfileConfig;
}
