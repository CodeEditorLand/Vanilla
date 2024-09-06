import { Platform } from "vs/base/common/platform";
import { IFileService } from "vs/platform/files/common/files";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { ILogService } from "vs/platform/log/common/log";
import { IUriIdentityService } from "vs/platform/uriIdentity/common/uriIdentity";
import { IUserDataProfile } from "vs/platform/userDataProfile/common/userDataProfile";
import { ITreeItemCheckboxState } from "vs/workbench/common/views";
import { IProfileResource, IProfileResourceChildTreeItem, IProfileResourceInitializer, IProfileResourceTreeItem, IUserDataProfileService } from "vs/workbench/services/userDataProfile/common/userDataProfile";
interface IKeybindingsResourceContent {
    platform: Platform;
    keybindings: string | null;
}
export declare class KeybindingsResourceInitializer implements IProfileResourceInitializer {
    private readonly userDataProfileService;
    private readonly fileService;
    private readonly logService;
    constructor(userDataProfileService: IUserDataProfileService, fileService: IFileService, logService: ILogService);
    initialize(content: string): Promise<void>;
}
export declare class KeybindingsResource implements IProfileResource {
    private readonly fileService;
    private readonly logService;
    constructor(fileService: IFileService, logService: ILogService);
    getContent(profile: IUserDataProfile): Promise<string>;
    getKeybindingsResourceContent(profile: IUserDataProfile): Promise<IKeybindingsResourceContent>;
    apply(content: string, profile: IUserDataProfile): Promise<void>;
    private getKeybindingsContent;
}
export declare class KeybindingsResourceTreeItem implements IProfileResourceTreeItem {
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
    isFromDefaultProfile(): boolean;
    getChildren(): Promise<IProfileResourceChildTreeItem[]>;
    hasContent(): Promise<boolean>;
    getContent(): Promise<string>;
}
export {};
