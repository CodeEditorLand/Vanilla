import { IFileService } from "vs/platform/files/common/files";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { ILogService } from "vs/platform/log/common/log";
import { IUriIdentityService } from "vs/platform/uriIdentity/common/uriIdentity";
import { IUserDataProfile } from "vs/platform/userDataProfile/common/userDataProfile";
import { IUserDataSyncUtilService } from "vs/platform/userDataSync/common/userDataSync";
import { ITreeItemCheckboxState } from "vs/workbench/common/views";
import { IProfileResource, IProfileResourceChildTreeItem, IProfileResourceInitializer, IProfileResourceTreeItem, IUserDataProfileService } from "vs/workbench/services/userDataProfile/common/userDataProfile";
interface ISettingsContent {
    settings: string | null;
}
export declare class SettingsResourceInitializer implements IProfileResourceInitializer {
    private readonly userDataProfileService;
    private readonly fileService;
    private readonly logService;
    constructor(userDataProfileService: IUserDataProfileService, fileService: IFileService, logService: ILogService);
    initialize(content: string): Promise<void>;
}
export declare class SettingsResource implements IProfileResource {
    private readonly fileService;
    private readonly userDataSyncUtilService;
    private readonly logService;
    constructor(fileService: IFileService, userDataSyncUtilService: IUserDataSyncUtilService, logService: ILogService);
    getContent(profile: IUserDataProfile): Promise<string>;
    getSettingsContent(profile: IUserDataProfile): Promise<ISettingsContent>;
    apply(content: string, profile: IUserDataProfile): Promise<void>;
    private getIgnoredSettings;
    private getLocalFileContent;
}
export declare class SettingsResourceTreeItem implements IProfileResourceTreeItem {
    private readonly profile;
    private readonly uriIdentityService;
    private readonly instantiationService;
    readonly type: any;
    readonly handle: any;
    readonly label: {
        label: any;
    };
    readonly collapsibleState: any;
    checkbox: ITreeItemCheckboxState | undefined;
    constructor(profile: IUserDataProfile, uriIdentityService: IUriIdentityService, instantiationService: IInstantiationService);
    getChildren(): Promise<IProfileResourceChildTreeItem[]>;
    hasContent(): Promise<boolean>;
    getContent(): Promise<string>;
    isFromDefaultProfile(): boolean;
}
export {};