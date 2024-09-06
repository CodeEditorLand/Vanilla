import { ResourceSet } from "vs/base/common/map";
import { URI } from "vs/base/common/uri";
import { IFileService } from "vs/platform/files/common/files";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IUriIdentityService } from "vs/platform/uriIdentity/common/uriIdentity";
import { IUserDataProfile } from "vs/platform/userDataProfile/common/userDataProfile";
import { ITreeItemCheckboxState } from "vs/workbench/common/views";
import { IProfileResource, IProfileResourceChildTreeItem, IProfileResourceInitializer, IProfileResourceTreeItem, IUserDataProfileService } from "vs/workbench/services/userDataProfile/common/userDataProfile";
export declare class SnippetsResourceInitializer implements IProfileResourceInitializer {
    private readonly userDataProfileService;
    private readonly fileService;
    private readonly uriIdentityService;
    constructor(userDataProfileService: IUserDataProfileService, fileService: IFileService, uriIdentityService: IUriIdentityService);
    initialize(content: string): Promise<void>;
}
export declare class SnippetsResource implements IProfileResource {
    private readonly fileService;
    private readonly uriIdentityService;
    constructor(fileService: IFileService, uriIdentityService: IUriIdentityService);
    getContent(profile: IUserDataProfile, excluded?: ResourceSet): Promise<string>;
    apply(content: string, profile: IUserDataProfile): Promise<void>;
    private getSnippets;
    getSnippetsResources(profile: IUserDataProfile, excluded?: ResourceSet): Promise<URI[]>;
}
export declare class SnippetsResourceTreeItem implements IProfileResourceTreeItem {
    private readonly profile;
    private readonly instantiationService;
    private readonly uriIdentityService;
    readonly type: any;
    readonly handle: any;
    readonly label: {
        label: any;
    };
    readonly collapsibleState: any;
    checkbox: ITreeItemCheckboxState | undefined;
    private readonly excludedSnippets;
    constructor(profile: IUserDataProfile, instantiationService: IInstantiationService, uriIdentityService: IUriIdentityService);
    getChildren(): Promise<IProfileResourceChildTreeItem[] | undefined>;
    hasContent(): Promise<boolean>;
    getContent(): Promise<string>;
    isFromDefaultProfile(): boolean;
}
