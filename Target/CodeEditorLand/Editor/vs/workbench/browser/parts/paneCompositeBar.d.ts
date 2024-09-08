import { ActionsOrientation } from '../../../base/browser/ui/actionbar/actionbar.js';
import { IWorkbenchLayoutService, Parts } from '../../services/layout/browser/layoutService.js';
import { IInstantiationService } from '../../../platform/instantiation/common/instantiation.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { IColorTheme } from '../../../platform/theme/common/themeService.js';
import { IStorageService } from '../../../platform/storage/common/storage.js';
import { IExtensionService } from '../../services/extensions/common/extensions.js';
import { ICompositeBarColors, IActivityHoverOptions } from './compositeBarActions.js';
import { IViewDescriptorService } from '../../common/views.js';
import { IContextKeyService } from '../../../platform/contextkey/common/contextkey.js';
import { IWorkbenchEnvironmentService } from '../../services/environment/common/environmentService.js';
import { ICompositeDragAndDrop } from '../dnd.js';
import { IAction } from '../../../base/common/actions.js';
import { GestureEvent } from '../../../base/browser/touch.js';
import { IPaneCompositePart } from './paneCompositePart.js';
import { IViewsService } from '../../services/views/common/viewsService.js';
export interface IPaneCompositeBarOptions {
    readonly partContainerClass: string;
    readonly pinnedViewContainersKey: string;
    readonly placeholderViewContainersKey: string;
    readonly viewContainersWorkspaceStateKey: string;
    readonly icon: boolean;
    readonly compact?: boolean;
    readonly iconSize: number;
    readonly recomputeSizes: boolean;
    readonly orientation: ActionsOrientation;
    readonly compositeSize: number;
    readonly overflowActionSize: number;
    readonly preventLoopNavigation?: boolean;
    readonly activityHoverOptions: IActivityHoverOptions;
    readonly fillExtraContextMenuActions: (actions: IAction[], e?: MouseEvent | GestureEvent) => void;
    readonly colors: (theme: IColorTheme) => ICompositeBarColors;
}
export declare class PaneCompositeBar extends Disposable {
    protected readonly options: IPaneCompositeBarOptions;
    private readonly part;
    private readonly paneCompositePart;
    protected readonly instantiationService: IInstantiationService;
    private readonly storageService;
    private readonly extensionService;
    private readonly viewDescriptorService;
    private readonly viewService;
    protected readonly contextKeyService: IContextKeyService;
    private readonly environmentService;
    protected readonly layoutService: IWorkbenchLayoutService;
    private readonly viewContainerDisposables;
    private readonly location;
    private readonly compositeBar;
    readonly dndHandler: ICompositeDragAndDrop;
    private readonly compositeActions;
    private hasExtensionsRegistered;
    constructor(options: IPaneCompositeBarOptions, part: Parts, paneCompositePart: IPaneCompositePart, instantiationService: IInstantiationService, storageService: IStorageService, extensionService: IExtensionService, viewDescriptorService: IViewDescriptorService, viewService: IViewsService, contextKeyService: IContextKeyService, environmentService: IWorkbenchEnvironmentService, layoutService: IWorkbenchLayoutService);
    private createCompositeBar;
    private getContextMenuActionsForComposite;
    private registerListeners;
    private onDidChangeViewContainers;
    private onDidChangeViewContainerLocation;
    private onDidChangeViewContainerVisibility;
    private onDidRegisterExtensions;
    private onDidViewContainerVisible;
    create(parent: HTMLElement): HTMLElement;
    private getCompositeActions;
    private onDidRegisterViewContainers;
    private onDidDeregisterViewContainer;
    private updateCompositeBarActionItem;
    private toCompositeBarActionItemFrom;
    private toCompositeBarActionItem;
    private showOrHideViewContainer;
    private shouldBeHidden;
    private addComposite;
    private hideComposite;
    private removeComposite;
    getPinnedPaneCompositeIds(): string[];
    getVisiblePaneCompositeIds(): string[];
    getContextMenuActions(): IAction[];
    focus(index?: number): void;
    layout(width: number, height: number): void;
    private getViewContainer;
    private getViewContainers;
    private onDidPinnedViewContainersStorageValueChange;
    private saveCachedViewContainers;
    private _cachedViewContainers;
    private get cachedViewContainers();
    private storeCachedViewContainersState;
    private getPinnedViewContainers;
    private setPinnedViewContainers;
    private _pinnedViewContainersValue;
    private get pinnedViewContainersValue();
    private set pinnedViewContainersValue(value);
    private getStoredPinnedViewContainersValue;
    private setStoredPinnedViewContainersValue;
    private getPlaceholderViewContainers;
    private setPlaceholderViewContainers;
    private _placeholderViewContainersValue;
    private get placeholderViewContainersValue();
    private set placeholderViewContainersValue(value);
    private getStoredPlaceholderViewContainersValue;
    private setStoredPlaceholderViewContainersValue;
    private getViewContainersWorkspaceState;
    private setViewContainersWorkspaceState;
    private _viewContainersWorkspaceStateValue;
    private get viewContainersWorkspaceStateValue();
    private set viewContainersWorkspaceStateValue(value);
    private getStoredViewContainersWorkspaceStateValue;
    private setStoredViewContainersWorkspaceStateValue;
}
