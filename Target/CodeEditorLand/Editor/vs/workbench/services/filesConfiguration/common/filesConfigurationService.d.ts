import { Event } from "vs/base/common/event";
import { IMarkdownString } from "vs/base/common/htmlContent";
import { Disposable, IDisposable } from "vs/base/common/lifecycle";
import { URI } from "vs/base/common/uri";
import { ITextResourceConfigurationService } from "vs/editor/common/services/textResourceConfiguration";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IEnvironmentService } from "vs/platform/environment/common/environment";
import { IBaseFileStat, IFilesConfiguration, IFileService } from "vs/platform/files/common/files";
import { IMarkerService } from "vs/platform/markers/common/markers";
import { IUriIdentityService } from "vs/platform/uriIdentity/common/uriIdentity";
import { IWorkspaceContextService } from "vs/platform/workspace/common/workspace";
import { SaveReason } from "vs/workbench/common/editor";
import { EditorInput } from "vs/workbench/common/editor/editorInput";
export declare const AutoSaveAfterShortDelayContext: any;
export interface IAutoSaveConfiguration {
    autoSave?: "afterDelay" | "onFocusChange" | "onWindowChange";
    autoSaveDelay?: number;
    autoSaveWorkspaceFilesOnly?: boolean;
    autoSaveWhenNoErrors?: boolean;
}
interface ICachedAutoSaveConfiguration extends IAutoSaveConfiguration {
    isOutOfWorkspace?: boolean;
    isShortAutoSaveDelay?: boolean;
}
export declare const enum AutoSaveMode {
    OFF = 0,
    AFTER_SHORT_DELAY = 1,
    AFTER_LONG_DELAY = 2,
    ON_FOCUS_CHANGE = 3,
    ON_WINDOW_CHANGE = 4
}
export declare const enum AutoSaveDisabledReason {
    SETTINGS = 1,
    OUT_OF_WORKSPACE = 2,
    ERRORS = 3,
    DISABLED = 4
}
export type IAutoSaveMode = IEnabledAutoSaveMode | IDisabledAutoSaveMode;
export interface IEnabledAutoSaveMode {
    readonly mode: AutoSaveMode.AFTER_SHORT_DELAY | AutoSaveMode.AFTER_LONG_DELAY | AutoSaveMode.ON_FOCUS_CHANGE | AutoSaveMode.ON_WINDOW_CHANGE;
}
export interface IDisabledAutoSaveMode {
    readonly mode: AutoSaveMode.OFF;
    readonly reason: AutoSaveDisabledReason;
}
export declare const IFilesConfigurationService: any;
export interface IFilesConfigurationService {
    readonly _serviceBrand: undefined;
    readonly onDidChangeAutoSaveConfiguration: Event<void>;
    readonly onDidChangeAutoSaveDisabled: Event<URI>;
    getAutoSaveConfiguration(resourceOrEditor: EditorInput | URI | undefined): IAutoSaveConfiguration;
    hasShortAutoSaveDelay(resourceOrEditor: EditorInput | URI | undefined): boolean;
    getAutoSaveMode(resourceOrEditor: EditorInput | URI | undefined, saveReason?: SaveReason): IAutoSaveMode;
    toggleAutoSave(): Promise<void>;
    disableAutoSave(resourceOrEditor: EditorInput | URI): IDisposable;
    readonly onDidChangeReadonly: Event<void>;
    isReadonly(resource: URI, stat?: IBaseFileStat): boolean | IMarkdownString;
    updateReadonly(resource: URI, readonly: true | false | "toggle" | "reset"): Promise<void>;
    readonly onDidChangeFilesAssociation: Event<void>;
    readonly isHotExitEnabled: boolean;
    readonly hotExitConfiguration: string | undefined;
    preventSaveConflicts(resource: URI, language?: string): boolean;
}
export declare class FilesConfigurationService extends Disposable implements IFilesConfigurationService {
    private readonly contextKeyService;
    private readonly configurationService;
    private readonly contextService;
    private readonly environmentService;
    private readonly uriIdentityService;
    private readonly fileService;
    private readonly markerService;
    private readonly textResourceConfigurationService;
    readonly _serviceBrand: undefined;
    private static readonly DEFAULT_AUTO_SAVE_MODE;
    private static readonly DEFAULT_AUTO_SAVE_DELAY;
    private static readonly READONLY_MESSAGES;
    private readonly _onDidChangeAutoSaveConfiguration;
    readonly onDidChangeAutoSaveConfiguration: any;
    private readonly _onDidChangeAutoSaveDisabled;
    readonly onDidChangeAutoSaveDisabled: any;
    private readonly _onDidChangeFilesAssociation;
    readonly onDidChangeFilesAssociation: any;
    private readonly _onDidChangeReadonly;
    readonly onDidChangeReadonly: any;
    private currentGlobalAutoSaveConfiguration;
    private currentFilesAssociationConfiguration;
    private currentHotExitConfiguration;
    private readonly autoSaveConfigurationCache;
    private readonly autoSaveDisabledOverrides;
    private readonly autoSaveAfterShortDelayContext;
    private readonly readonlyIncludeMatcher;
    private readonly readonlyExcludeMatcher;
    private configuredReadonlyFromPermissions;
    private readonly sessionReadonlyOverrides;
    constructor(contextKeyService: IContextKeyService, configurationService: IConfigurationService, contextService: IWorkspaceContextService, environmentService: IEnvironmentService, uriIdentityService: IUriIdentityService, fileService: IFileService, markerService: IMarkerService, textResourceConfigurationService: ITextResourceConfigurationService);
    private createReadonlyMatcher;
    isReadonly(resource: URI, stat?: IBaseFileStat): boolean | IMarkdownString;
    updateReadonly(resource: URI, readonly: true | false | "toggle" | "reset"): Promise<void>;
    private registerListeners;
    protected onFilesConfigurationChange(configuration: IFilesConfiguration, fromEvent: boolean): void;
    getAutoSaveConfiguration(resourceOrEditor: EditorInput | URI | undefined): ICachedAutoSaveConfiguration;
    private computeAutoSaveConfiguration;
    private toResource;
    hasShortAutoSaveDelay(resourceOrEditor: EditorInput | URI | undefined): boolean;
    getAutoSaveMode(resourceOrEditor: EditorInput | URI | undefined, saveReason?: SaveReason): IAutoSaveMode;
    toggleAutoSave(): Promise<void>;
    disableAutoSave(resourceOrEditor: EditorInput | URI): IDisposable;
    get isHotExitEnabled(): boolean;
    get hotExitConfiguration(): string;
    preventSaveConflicts(resource: URI, language?: string): boolean;
}
export {};
