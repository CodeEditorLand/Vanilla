import { CancellationToken } from "vs/base/common/cancellation";
import { Event } from "vs/base/common/event";
import { IDisposable } from "vs/base/common/lifecycle";
import { URI } from "vs/base/common/uri";
import { IProductService } from "vs/platform/product/common/productService";
import { IUserDataProfile, IUserDataProfileOptions, IUserDataProfileUpdateOptions, ProfileResourceType, ProfileResourceTypeFlags } from "vs/platform/userDataProfile/common/userDataProfile";
import { ITreeItem, ITreeItemLabel } from "vs/workbench/common/views";
export interface DidChangeUserDataProfileEvent {
    readonly previous: IUserDataProfile;
    readonly profile: IUserDataProfile;
    join(promise: Promise<void>): void;
}
export declare const IUserDataProfileService: any;
export interface IUserDataProfileService {
    readonly _serviceBrand: undefined;
    readonly currentProfile: IUserDataProfile;
    readonly onDidChangeCurrentProfile: Event<DidChangeUserDataProfileEvent>;
    updateCurrentProfile(currentProfile: IUserDataProfile): Promise<void>;
    getShortName(profile: IUserDataProfile): string;
}
export interface IProfileTemplateInfo {
    readonly name: string;
    readonly url: string;
}
export declare const IUserDataProfileManagementService: any;
export interface IUserDataProfileManagementService {
    readonly _serviceBrand: undefined;
    createProfile(name: string, options?: IUserDataProfileOptions): Promise<IUserDataProfile>;
    createAndEnterProfile(name: string, options?: IUserDataProfileOptions): Promise<IUserDataProfile>;
    createAndEnterTransientProfile(): Promise<IUserDataProfile>;
    removeProfile(profile: IUserDataProfile): Promise<void>;
    updateProfile(profile: IUserDataProfile, updateOptions: IUserDataProfileUpdateOptions): Promise<IUserDataProfile>;
    switchProfile(profile: IUserDataProfile): Promise<void>;
    getBuiltinProfileTemplates(): Promise<IProfileTemplateInfo[]>;
}
export interface IUserDataProfileTemplate {
    readonly name: string;
    readonly icon?: string;
    readonly settings?: string;
    readonly keybindings?: string;
    readonly tasks?: string;
    readonly snippets?: string;
    readonly globalState?: string;
    readonly extensions?: string;
}
export declare function isUserDataProfileTemplate(thing: unknown): thing is IUserDataProfileTemplate;
export declare const PROFILE_URL_AUTHORITY = "profile";
export declare function toUserDataProfileUri(path: string, productService: IProductService): URI;
export declare const PROFILE_URL_AUTHORITY_PREFIX = "profile-";
export declare function isProfileURL(uri: URI): boolean;
export interface IUserDataProfileCreateOptions extends IUserDataProfileOptions {
    readonly name?: string;
    readonly resourceTypeFlags?: ProfileResourceTypeFlags;
}
export interface IProfileImportOptions extends IUserDataProfileCreateOptions {
    readonly name?: string;
    readonly icon?: string;
    readonly mode?: "apply";
}
export declare const IUserDataProfileImportExportService: any;
export interface IUserDataProfileImportExportService {
    readonly _serviceBrand: undefined;
    registerProfileContentHandler(id: string, profileContentHandler: IUserDataProfileContentHandler): IDisposable;
    unregisterProfileContentHandler(id: string): void;
    resolveProfileTemplate(uri: URI): Promise<IUserDataProfileTemplate | null>;
    exportProfile(profile: IUserDataProfile): Promise<void>;
    createFromProfile(from: IUserDataProfile, options: IUserDataProfileCreateOptions, token: CancellationToken): Promise<IUserDataProfile | undefined>;
    createProfileFromTemplate(profileTemplate: IUserDataProfileTemplate, options: IUserDataProfileCreateOptions, token: CancellationToken): Promise<IUserDataProfile | undefined>;
    createTroubleshootProfile(): Promise<void>;
}
export interface IProfileResourceInitializer {
    initialize(content: string): Promise<void>;
}
export interface IProfileResource {
    getContent(profile: IUserDataProfile): Promise<string>;
    apply(content: string, profile: IUserDataProfile): Promise<void>;
}
export interface IProfileResourceTreeItem extends ITreeItem {
    readonly type: ProfileResourceType;
    readonly label: ITreeItemLabel;
    isFromDefaultProfile(): boolean;
    getChildren(): Promise<IProfileResourceChildTreeItem[] | undefined>;
    getContent(): Promise<string>;
}
export interface IProfileResourceChildTreeItem extends ITreeItem {
    parent: IProfileResourceTreeItem;
}
export interface ISaveProfileResult {
    readonly id: string;
    readonly link: URI;
}
export interface IUserDataProfileContentHandler {
    readonly name: string;
    readonly description?: string;
    readonly extensionId?: string;
    saveProfile(name: string, content: string, token: CancellationToken): Promise<ISaveProfileResult | null>;
    readProfile(idOrUri: string | URI, token: CancellationToken): Promise<string | null>;
}
export declare const defaultUserDataProfileIcon: any;
export declare const PROFILES_TITLE: any;
export declare const PROFILES_CATEGORY: any;
export declare const PROFILE_EXTENSION = "code-profile";
export declare const PROFILE_FILTER: {
    name: any;
    extensions: string[];
}[];
export declare const PROFILES_ENABLEMENT_CONTEXT: any;
export declare const CURRENT_PROFILE_CONTEXT: any;
export declare const IS_CURRENT_PROFILE_TRANSIENT_CONTEXT: any;
export declare const HAS_PROFILES_CONTEXT: any;
