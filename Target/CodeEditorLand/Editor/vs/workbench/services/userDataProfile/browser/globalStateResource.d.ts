import { IStringDictionary } from "vs/base/common/collections";
import { URI } from "vs/base/common/uri";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { ILogService } from "vs/platform/log/common/log";
import { IStorageService } from "vs/platform/storage/common/storage";
import { IUriIdentityService } from "vs/platform/uriIdentity/common/uriIdentity";
import { IUserDataProfile } from "vs/platform/userDataProfile/common/userDataProfile";
import { IUserDataProfileStorageService } from "vs/platform/userDataProfile/common/userDataProfileStorageService";
import { ITreeItemCheckboxState } from "vs/workbench/common/views";
import { IProfileResource, IProfileResourceChildTreeItem, IProfileResourceInitializer, IProfileResourceTreeItem } from "vs/workbench/services/userDataProfile/common/userDataProfile";
interface IGlobalState {
    storage: IStringDictionary<string>;
}
export declare class GlobalStateResourceInitializer implements IProfileResourceInitializer {
    private readonly storageService;
    constructor(storageService: IStorageService);
    initialize(content: string): Promise<void>;
}
export declare class GlobalStateResource implements IProfileResource {
    private readonly storageService;
    private readonly userDataProfileStorageService;
    private readonly logService;
    constructor(storageService: IStorageService, userDataProfileStorageService: IUserDataProfileStorageService, logService: ILogService);
    getContent(profile: IUserDataProfile): Promise<string>;
    apply(content: string, profile: IUserDataProfile): Promise<void>;
    getGlobalState(profile: IUserDataProfile): Promise<IGlobalState>;
    private writeGlobalState;
}
export declare abstract class GlobalStateResourceTreeItem implements IProfileResourceTreeItem {
    private readonly resource;
    private readonly uriIdentityService;
    readonly type: any;
    readonly handle: any;
    readonly label: {
        label: any;
    };
    readonly collapsibleState: any;
    checkbox: ITreeItemCheckboxState | undefined;
    constructor(resource: URI, uriIdentityService: IUriIdentityService);
    getChildren(): Promise<IProfileResourceChildTreeItem[]>;
    abstract getContent(): Promise<string>;
    abstract isFromDefaultProfile(): boolean;
}
export declare class GlobalStateResourceExportTreeItem extends GlobalStateResourceTreeItem {
    private readonly profile;
    private readonly instantiationService;
    constructor(profile: IUserDataProfile, resource: URI, uriIdentityService: IUriIdentityService, instantiationService: IInstantiationService);
    hasContent(): Promise<boolean>;
    getContent(): Promise<string>;
    isFromDefaultProfile(): boolean;
}
export declare class GlobalStateResourceImportTreeItem extends GlobalStateResourceTreeItem {
    private readonly content;
    constructor(content: string, resource: URI, uriIdentityService: IUriIdentityService);
    getContent(): Promise<string>;
    isFromDefaultProfile(): boolean;
}
export {};
