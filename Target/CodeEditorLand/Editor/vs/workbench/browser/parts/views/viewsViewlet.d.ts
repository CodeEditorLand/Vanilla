import type { Event } from "../../../../base/common/event.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import type { ExtensionIdentifier } from "../../../../platform/extensions/common/extensions.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import { type IAddedViewDescriptorRef, type IView, type IViewDescriptor, IViewDescriptorService } from "../../../common/views.js";
import { IExtensionService } from "../../../services/extensions/common/extensions.js";
import { IWorkbenchLayoutService } from "../../../services/layout/browser/layoutService.js";
import type { IViewPaneOptions, ViewPane } from "./viewPane.js";
import { ViewPaneContainer } from "./viewPaneContainer.js";
export interface IViewletViewOptions extends IViewPaneOptions {
    readonly fromExtensionId?: ExtensionIdentifier;
}
export declare abstract class FilterViewPaneContainer extends ViewPaneContainer {
    private constantViewDescriptors;
    private allViews;
    private filterValue;
    constructor(viewletId: string, onDidChangeFilterValue: Event<string[]>, configurationService: IConfigurationService, layoutService: IWorkbenchLayoutService, telemetryService: ITelemetryService, storageService: IStorageService, instantiationService: IInstantiationService, themeService: IThemeService, contextMenuService: IContextMenuService, extensionService: IExtensionService, contextService: IWorkspaceContextService, viewDescriptorService: IViewDescriptorService);
    private updateAllViews;
    protected addConstantViewDescriptors(constantViewDescriptors: IViewDescriptor[]): void;
    protected abstract getFilterOn(viewDescriptor: IViewDescriptor): string | undefined;
    protected abstract setFilter(viewDescriptor: IViewDescriptor): void;
    private onFilterChanged;
    private getViewsForTarget;
    private getViewsNotForTarget;
    protected onDidAddViewDescriptors(added: IAddedViewDescriptorRef[]): ViewPane[];
    openView(id: string, focus?: boolean): IView | undefined;
    abstract getTitle(): string;
}
