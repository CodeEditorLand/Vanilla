import "vs/css!./media/extensionsWidgets";
import { HoverPosition } from "vs/base/browser/ui/hover/hoverWidget";
import { Event } from "vs/base/common/event";
import { Disposable, IDisposable } from "vs/base/common/lifecycle";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IHoverService } from "vs/platform/hover/browser/hover";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IOpenerService } from "vs/platform/opener/common/opener";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
import { IThemeService } from "vs/platform/theme/common/themeService";
import { IUserDataSyncEnablementService } from "vs/platform/userDataSync/common/userDataSync";
import { IWorkspaceContextService } from "vs/platform/workspace/common/workspace";
import { ExtensionStatusAction } from "vs/workbench/contrib/extensions/browser/extensionsActions";
import { IExtension, IExtensionContainer, IExtensionsWorkbenchService } from "vs/workbench/contrib/extensions/common/extensions";
import { IExtensionManagementServerService } from "vs/workbench/services/extensionManagement/common/extensionManagement";
import { IExtensionIgnoredRecommendationsService, IExtensionRecommendationsService } from "vs/workbench/services/extensionRecommendations/common/extensionRecommendations";
import { IExtensionService } from "vs/workbench/services/extensions/common/extensions";
export declare abstract class ExtensionWidget extends Disposable implements IExtensionContainer {
    private _extension;
    get extension(): IExtension | null;
    set extension(extension: IExtension | null);
    update(): void;
    abstract render(): void;
}
export declare function onClick(element: HTMLElement, callback: () => void): IDisposable;
export declare class InstallCountWidget extends ExtensionWidget {
    private container;
    private small;
    constructor(container: HTMLElement, small: boolean);
    render(): void;
    static getInstallLabel(extension: IExtension, small: boolean): string | undefined;
}
export declare class RatingsWidget extends ExtensionWidget {
    private container;
    private small;
    private readonly containerHover;
    constructor(container: HTMLElement, small: boolean, hoverService: IHoverService);
    render(): void;
}
export declare class VerifiedPublisherWidget extends ExtensionWidget {
    private container;
    private small;
    private readonly openerService;
    private readonly disposables;
    private readonly containerHover;
    constructor(container: HTMLElement, small: boolean, hoverService: IHoverService, openerService: IOpenerService);
    render(): void;
}
export declare class SponsorWidget extends ExtensionWidget {
    private container;
    private readonly hoverService;
    private readonly openerService;
    private readonly telemetryService;
    private readonly disposables;
    constructor(container: HTMLElement, hoverService: IHoverService, openerService: IOpenerService, telemetryService: ITelemetryService);
    render(): void;
}
export declare class RecommendationWidget extends ExtensionWidget {
    private parent;
    private readonly extensionRecommendationsService;
    private element?;
    private readonly disposables;
    constructor(parent: HTMLElement, extensionRecommendationsService: IExtensionRecommendationsService);
    private clear;
    render(): void;
}
export declare class PreReleaseBookmarkWidget extends ExtensionWidget {
    private parent;
    private element?;
    private readonly disposables;
    constructor(parent: HTMLElement);
    private clear;
    render(): void;
}
export declare class RemoteBadgeWidget extends ExtensionWidget {
    private readonly tooltip;
    private readonly extensionManagementServerService;
    private readonly instantiationService;
    private readonly remoteBadge;
    private element;
    constructor(parent: HTMLElement, tooltip: boolean, extensionManagementServerService: IExtensionManagementServerService, instantiationService: IInstantiationService);
    private clear;
    render(): void;
}
export declare class ExtensionPackCountWidget extends ExtensionWidget {
    private readonly parent;
    private element;
    constructor(parent: HTMLElement);
    private clear;
    render(): void;
}
export declare class SyncIgnoredWidget extends ExtensionWidget {
    private readonly container;
    private readonly configurationService;
    private readonly extensionsWorkbenchService;
    private readonly hoverService;
    private readonly userDataSyncEnablementService;
    private readonly disposables;
    constructor(container: HTMLElement, configurationService: IConfigurationService, extensionsWorkbenchService: IExtensionsWorkbenchService, hoverService: IHoverService, userDataSyncEnablementService: IUserDataSyncEnablementService);
    render(): void;
}
export declare class ExtensionActivationStatusWidget extends ExtensionWidget {
    private readonly container;
    private readonly small;
    private readonly extensionsWorkbenchService;
    constructor(container: HTMLElement, small: boolean, extensionService: IExtensionService, extensionsWorkbenchService: IExtensionsWorkbenchService);
    render(): void;
}
export type ExtensionHoverOptions = {
    position: () => HoverPosition;
    readonly target: HTMLElement;
};
export declare class ExtensionHoverWidget extends ExtensionWidget {
    private readonly options;
    private readonly extensionStatusAction;
    private readonly extensionsWorkbenchService;
    private readonly hoverService;
    private readonly configurationService;
    private readonly extensionRecommendationsService;
    private readonly themeService;
    private readonly contextService;
    private readonly hover;
    constructor(options: ExtensionHoverOptions, extensionStatusAction: ExtensionStatusAction, extensionsWorkbenchService: IExtensionsWorkbenchService, hoverService: IHoverService, configurationService: IConfigurationService, extensionRecommendationsService: IExtensionRecommendationsService, themeService: IThemeService, contextService: IWorkspaceContextService);
    render(): void;
    private getHoverMarkdown;
    private getRecommendationMessage;
    static getPreReleaseMessage(extension: IExtension): string | undefined;
}
export declare class ExtensionStatusWidget extends ExtensionWidget {
    private readonly container;
    private readonly extensionStatusAction;
    private readonly openerService;
    private readonly renderDisposables;
    private readonly _onDidRender;
    readonly onDidRender: Event<void>;
    constructor(container: HTMLElement, extensionStatusAction: ExtensionStatusAction, openerService: IOpenerService);
    render(): void;
}
export declare class ExtensionRecommendationWidget extends ExtensionWidget {
    private readonly container;
    private readonly extensionRecommendationsService;
    private readonly extensionIgnoredRecommendationsService;
    private readonly _onDidRender;
    readonly onDidRender: Event<void>;
    constructor(container: HTMLElement, extensionRecommendationsService: IExtensionRecommendationsService, extensionIgnoredRecommendationsService: IExtensionIgnoredRecommendationsService);
    render(): void;
    private getRecommendationStatus;
}
export declare const extensionRatingIconColor: any;
export declare const extensionVerifiedPublisherIconColor: any;
export declare const extensionPreReleaseIconColor: any;
export declare const extensionSponsorIconColor: any;
