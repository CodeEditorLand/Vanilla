import { Event } from "vs/base/common/event";
import { Disposable } from "vs/base/common/lifecycle";
import { LinkedText } from "vs/base/common/linkedText";
import { ThemeIcon } from "vs/base/common/themables";
import { URI } from "vs/base/common/uri";
import { ICommandService } from "vs/platform/commands/common/commands";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { ContextKeyExpression, IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IExtensionManagementService } from "vs/platform/extensionManagement/common/extensionManagement";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IStorageService } from "vs/platform/storage/common/storage";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
import { IUserDataSyncEnablementService } from "vs/platform/userDataSync/common/userDataSync";
import { IWorkspaceContextService } from "vs/platform/workspace/common/workspace";
import { IWorkbenchAssignmentService } from "vs/workbench/services/assignment/common/assignmentService";
import { IHostService } from "vs/workbench/services/host/browser/host";
import { IViewsService } from "vs/workbench/services/views/common/viewsService";
export declare const HasMultipleNewFileEntries: any;
export declare const IWalkthroughsService: any;
export declare const hiddenEntriesConfigurationKey = "workbench.welcomePage.hiddenCategories";
export declare const walkthroughMetadataConfigurationKey = "workbench.welcomePage.walkthroughMetadata";
export type WalkthroughMetaDataType = Map<string, {
    firstSeen: number;
    stepIDs: string[];
    manaullyOpened: boolean;
}>;
export interface IWalkthrough {
    id: string;
    title: string;
    description: string;
    order: number;
    source: string;
    isFeatured: boolean;
    next?: string;
    when: ContextKeyExpression;
    steps: IWalkthroughStep[];
    icon: {
        type: "icon";
        icon: ThemeIcon;
    } | {
        type: "image";
        path: string;
    };
}
export type IWalkthroughLoose = Omit<IWalkthrough, "steps"> & {
    steps: (Omit<IWalkthroughStep, "description"> & {
        description: string;
    })[];
};
export interface IResolvedWalkthrough extends IWalkthrough {
    steps: IResolvedWalkthroughStep[];
    newItems: boolean;
    recencyBonus: number;
    newEntry: boolean;
}
export interface IWalkthroughStep {
    id: string;
    title: string;
    description: LinkedText[];
    category: string;
    when: ContextKeyExpression;
    order: number;
    completionEvents: string[];
    media: {
        type: "image";
        path: {
            hcDark: URI;
            hcLight: URI;
            light: URI;
            dark: URI;
        };
        altText: string;
    } | {
        type: "svg";
        path: URI;
        altText: string;
    } | {
        type: "markdown";
        path: URI;
        base: URI;
        root: URI;
    };
}
type StepProgress = {
    done: boolean;
};
export interface IResolvedWalkthroughStep extends IWalkthroughStep, StepProgress {
}
export interface IWalkthroughsService {
    _serviceBrand: undefined;
    readonly onDidAddWalkthrough: Event<IResolvedWalkthrough>;
    readonly onDidRemoveWalkthrough: Event<string>;
    readonly onDidChangeWalkthrough: Event<IResolvedWalkthrough>;
    readonly onDidProgressStep: Event<IResolvedWalkthroughStep>;
    getWalkthroughs(): IResolvedWalkthrough[];
    getWalkthrough(id: string): IResolvedWalkthrough;
    registerWalkthrough(descriptor: IWalkthroughLoose): void;
    progressByEvent(eventName: string): void;
    progressStep(id: string): void;
    deprogressStep(id: string): void;
    markWalkthroughOpened(id: string): void;
}
export declare class WalkthroughsService extends Disposable implements IWalkthroughsService {
    private readonly storageService;
    private readonly commandService;
    private readonly instantiationService;
    private readonly workspaceContextService;
    private readonly contextService;
    private readonly userDataSyncEnablementService;
    private readonly configurationService;
    private readonly extensionManagementService;
    private readonly hostService;
    private readonly viewsService;
    private readonly telemetryService;
    private readonly tasExperimentService;
    readonly _serviceBrand: undefined;
    private readonly _onDidAddWalkthrough;
    readonly onDidAddWalkthrough: Event<IResolvedWalkthrough>;
    private readonly _onDidRemoveWalkthrough;
    readonly onDidRemoveWalkthrough: Event<string>;
    private readonly _onDidChangeWalkthrough;
    readonly onDidChangeWalkthrough: Event<IResolvedWalkthrough>;
    private readonly _onDidProgressStep;
    readonly onDidProgressStep: Event<IResolvedWalkthroughStep>;
    private memento;
    private stepProgress;
    private sessionEvents;
    private completionListeners;
    private gettingStartedContributions;
    private steps;
    private sessionInstalledExtensions;
    private categoryVisibilityContextKeys;
    private stepCompletionContextKeyExpressions;
    private stepCompletionContextKeys;
    private metadata;
    constructor(storageService: IStorageService, commandService: ICommandService, instantiationService: IInstantiationService, workspaceContextService: IWorkspaceContextService, contextService: IContextKeyService, userDataSyncEnablementService: IUserDataSyncEnablementService, configurationService: IConfigurationService, extensionManagementService: IExtensionManagementService, hostService: IHostService, viewsService: IViewsService, telemetryService: ITelemetryService, tasExperimentService: IWorkbenchAssignmentService);
    private registerWalkthroughs;
    private initCompletionEventListeners;
    markWalkthroughOpened(id: string): void;
    private registerExtensionWalkthroughContributions;
    private unregisterExtensionWalkthroughContributions;
    getWalkthrough(id: string): IResolvedWalkthrough;
    getWalkthroughs(): IResolvedWalkthrough[];
    private resolveWalkthrough;
    private getStepProgress;
    progressStep(id: string): void;
    deprogressStep(id: string): void;
    progressByEvent(event: string): void;
    registerWalkthrough(walkthoughDescriptor: IWalkthroughLoose): void;
    _registerWalkthrough(walkthroughDescriptor: IWalkthrough): void;
    private registerDoneListeners;
    private registerCompletionListener;
    private getStep;
}
export declare const parseDescription: (desc: string) => LinkedText[];
export declare const convertInternalMediaPathToFileURI: (path: string) => any;
export {};
