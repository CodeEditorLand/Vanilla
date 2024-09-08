import { IFileService } from "../../../../platform/files/common/files.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IUriIdentityService } from "../../../../platform/uriIdentity/common/uriIdentity.js";
import { ProfileResourceType, type IUserDataProfile } from "../../../../platform/userDataProfile/common/userDataProfile.js";
import { IUserDataSyncUtilService } from "../../../../platform/userDataSync/common/userDataSync.js";
import { TreeItemCollapsibleState, type ITreeItemCheckboxState } from "../../../common/views.js";
import { IUserDataProfileService, type IProfileResource, type IProfileResourceChildTreeItem, type IProfileResourceInitializer, type IProfileResourceTreeItem } from "../common/userDataProfile.js";
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
    readonly type = ProfileResourceType.Settings;
    readonly handle = ProfileResourceType.Settings;
    readonly label: {
        label: string;
    };
    readonly collapsibleState = TreeItemCollapsibleState.Expanded;
    checkbox: ITreeItemCheckboxState | undefined;
    constructor(profile: IUserDataProfile, uriIdentityService: IUriIdentityService, instantiationService: IInstantiationService);
    getChildren(): Promise<IProfileResourceChildTreeItem[]>;
    hasContent(): Promise<boolean>;
    getContent(): Promise<string>;
    isFromDefaultProfile(): boolean;
}
export {};
