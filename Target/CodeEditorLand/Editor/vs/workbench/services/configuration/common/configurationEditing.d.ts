import { ErrorNoTelemetry } from "../../../../base/common/errors.js";
import { URI } from "../../../../base/common/uri.js";
import { ITextModelService } from "../../../../editor/common/services/resolverService.js";
import { IConfigurationUpdateOptions, IConfigurationUpdateOverrides } from "../../../../platform/configuration/common/configuration.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { INotificationService } from "../../../../platform/notification/common/notification.js";
import { IUriIdentityService } from "../../../../platform/uriIdentity/common/uriIdentity.js";
import { IUserDataProfilesService } from "../../../../platform/userDataProfile/common/userDataProfile.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import { IEditorService } from "../../editor/common/editorService.js";
import { IPreferencesService } from "../../preferences/common/preferences.js";
import { ITextFileService } from "../../textfile/common/textfiles.js";
import { IUserDataProfileService } from "../../userDataProfile/common/userDataProfile.js";
import { IWorkbenchConfigurationService } from "./configuration.js";
export declare const enum ConfigurationEditingErrorCode {
    /**
     * Error when trying to write a configuration key that is not registered.
     */
    ERROR_UNKNOWN_KEY = 0,
    /**
     * Error when trying to write an application setting into workspace settings.
     */
    ERROR_INVALID_WORKSPACE_CONFIGURATION_APPLICATION = 1,
    /**
     * Error when trying to write a machne setting into workspace settings.
     */
    ERROR_INVALID_WORKSPACE_CONFIGURATION_MACHINE = 2,
    /**
     * Error when trying to write an invalid folder configuration key to folder settings.
     */
    ERROR_INVALID_FOLDER_CONFIGURATION = 3,
    /**
     * Error when trying to write to user target but not supported for provided key.
     */
    ERROR_INVALID_USER_TARGET = 4,
    /**
     * Error when trying to write to user target but not supported for provided key.
     */
    ERROR_INVALID_WORKSPACE_TARGET = 5,
    /**
     * Error when trying to write a configuration key to folder target
     */
    ERROR_INVALID_FOLDER_TARGET = 6,
    /**
     * Error when trying to write to language specific setting but not supported for preovided key
     */
    ERROR_INVALID_RESOURCE_LANGUAGE_CONFIGURATION = 7,
    /**
     * Error when trying to write to the workspace configuration without having a workspace opened.
     */
    ERROR_NO_WORKSPACE_OPENED = 8,
    /**
     * Error when trying to write and save to the configuration file while it is dirty in the editor.
     */
    ERROR_CONFIGURATION_FILE_DIRTY = 9,
    /**
     * Error when trying to write and save to the configuration file while it is not the latest in the disk.
     */
    ERROR_CONFIGURATION_FILE_MODIFIED_SINCE = 10,
    /**
     * Error when trying to write to a configuration file that contains JSON errors.
     */
    ERROR_INVALID_CONFIGURATION = 11,
    /**
     * Error when trying to write a policy configuration
     */
    ERROR_POLICY_CONFIGURATION = 12,
    /**
     * Internal Error.
     */
    ERROR_INTERNAL = 13
}
export declare class ConfigurationEditingError extends ErrorNoTelemetry {
    code: ConfigurationEditingErrorCode;
    constructor(message: string, code: ConfigurationEditingErrorCode);
}
export interface IConfigurationValue {
    key: string;
    value: any;
}
export interface IConfigurationEditingOptions extends IConfigurationUpdateOptions {
    /**
     * Scope of configuration to be written into.
     */
    scopes?: IConfigurationUpdateOverrides;
}
export declare const enum EditableConfigurationTarget {
    USER_LOCAL = 1,
    USER_REMOTE = 2,
    WORKSPACE = 3,
    WORKSPACE_FOLDER = 4
}
export declare class ConfigurationEditing {
    private readonly remoteSettingsResource;
    private readonly configurationService;
    private readonly contextService;
    private readonly userDataProfileService;
    private readonly userDataProfilesService;
    private readonly fileService;
    private readonly textModelResolverService;
    private readonly textFileService;
    private readonly notificationService;
    private readonly preferencesService;
    private readonly editorService;
    private readonly uriIdentityService;
    _serviceBrand: undefined;
    private queue;
    constructor(remoteSettingsResource: URI | null, configurationService: IWorkbenchConfigurationService, contextService: IWorkspaceContextService, userDataProfileService: IUserDataProfileService, userDataProfilesService: IUserDataProfilesService, fileService: IFileService, textModelResolverService: ITextModelService, textFileService: ITextFileService, notificationService: INotificationService, preferencesService: IPreferencesService, editorService: IEditorService, uriIdentityService: IUriIdentityService);
    writeConfiguration(target: EditableConfigurationTarget, value: IConfigurationValue, options?: IConfigurationEditingOptions): Promise<void>;
    private doWriteConfiguration;
    private updateConfiguration;
    private save;
    private applyEditsToBuffer;
    private getEdits;
    private getFormattingOptions;
    private onError;
    private onInvalidConfigurationError;
    private onConfigurationFileDirtyError;
    private openSettings;
    private openFile;
    private toConfigurationEditingError;
    private toErrorMessage;
    private stringifyTarget;
    private defaultResourceValue;
    private resolveModelReference;
    private hasParseErrors;
    private validate;
    private getConfigurationEditOperation;
    private isWorkspaceConfigurationResource;
    private getConfigurationFileResource;
}
