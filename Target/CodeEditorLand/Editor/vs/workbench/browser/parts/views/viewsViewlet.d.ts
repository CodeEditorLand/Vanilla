import { Event } from "vs/base/common/event";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IContextMenuService } from "vs/platform/contextview/browser/contextView";
import { ExtensionIdentifier } from "vs/platform/extensions/common/extensions";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IStorageService } from "vs/platform/storage/common/storage";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
import { IThemeService } from "vs/platform/theme/common/themeService";
import { IWorkspaceContextService } from "vs/platform/workspace/common/workspace";
import { IViewPaneOptions, ViewPane } from "vs/workbench/browser/parts/views/viewPane";
import { ViewPaneContainer } from "vs/workbench/browser/parts/views/viewPaneContainer";
import { IAddedViewDescriptorRef, IView, IViewDescriptor, IViewDescriptorService } from "vs/workbench/common/views";
import { IExtensionService } from "vs/workbench/services/extensions/common/extensions";
import { IWorkbenchLayoutService } from "vs/workbench/services/layout/browser/layoutService";
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
