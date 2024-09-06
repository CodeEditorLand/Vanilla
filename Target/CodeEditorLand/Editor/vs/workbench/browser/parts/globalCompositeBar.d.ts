import { IBaseActionViewItemOptions } from "vs/base/browser/ui/actionbar/actionViewItems";
import { AnchorAlignment, AnchorAxisAlignment } from "vs/base/browser/ui/contextview/contextview";
import { IAction } from "vs/base/common/actions";
import { Disposable, DisposableStore } from "vs/base/common/lifecycle";
import { IMenu, IMenuService, MenuId } from "vs/platform/actions/common/actions";
import { ICommandService } from "vs/platform/commands/common/commands";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IContextMenuService } from "vs/platform/contextview/browser/contextView";
import { IHoverService } from "vs/platform/hover/browser/hover";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IKeybindingService } from "vs/platform/keybinding/common/keybinding";
import { ILogService } from "vs/platform/log/common/log";
import { IProductService } from "vs/platform/product/common/productService";
import { ISecretStorageService } from "vs/platform/secrets/common/secrets";
import { IStorageService } from "vs/platform/storage/common/storage";
import { IColorTheme, IThemeService } from "vs/platform/theme/common/themeService";
import { CompositeBarAction, CompositeBarActionViewItem, IActivityHoverOptions, ICompositeBarActionViewItemOptions, ICompositeBarColors } from "vs/workbench/browser/parts/compositeBarActions";
import { IActivityService } from "vs/workbench/services/activity/common/activity";
import { IAuthenticationService } from "vs/workbench/services/authentication/common/authentication";
import { IWorkbenchEnvironmentService } from "vs/workbench/services/environment/common/environmentService";
import { IExtensionService } from "vs/workbench/services/extensions/common/extensions";
import { ILifecycleService } from "vs/workbench/services/lifecycle/common/lifecycle";
import { IUserDataProfileService } from "vs/workbench/services/userDataProfile/common/userDataProfile";
export declare class GlobalCompositeBar extends Disposable {
    private readonly contextMenuActionsProvider;
    private readonly colors;
    private readonly activityHoverOptions;
    private readonly instantiationService;
    private readonly storageService;
    private readonly extensionService;
    private static readonly ACCOUNTS_ACTION_INDEX;
    static readonly ACCOUNTS_ICON: any;
    readonly element: HTMLElement;
    private readonly globalActivityAction;
    private readonly accountAction;
    private readonly globalActivityActionBar;
    constructor(contextMenuActionsProvider: () => IAction[], colors: (theme: IColorTheme) => ICompositeBarColors, activityHoverOptions: IActivityHoverOptions, configurationService: IConfigurationService, instantiationService: IInstantiationService, storageService: IStorageService, extensionService: IExtensionService);
    private registerListeners;
    create(parent: HTMLElement): void;
    focus(): void;
    size(): number;
    getContextMenuActions(): IAction[];
    private toggleAccountsActivity;
    private get accountsVisibilityPreference();
    private set accountsVisibilityPreference(value);
}
declare abstract class AbstractGlobalActivityActionViewItem extends CompositeBarActionViewItem {
    private readonly menuId;
    private readonly contextMenuActionsProvider;
    private readonly contextMenuAlignmentOptions;
    private readonly menuService;
    private readonly contextMenuService;
    private readonly contextKeyService;
    private readonly activityService;
    constructor(menuId: MenuId, action: CompositeBarAction, options: ICompositeBarActionViewItemOptions, contextMenuActionsProvider: () => IAction[], contextMenuAlignmentOptions: () => Readonly<{
        anchorAlignment: AnchorAlignment;
        anchorAxisAlignment: AnchorAxisAlignment;
    }> | undefined, themeService: IThemeService, hoverService: IHoverService, menuService: IMenuService, contextMenuService: IContextMenuService, contextKeyService: IContextKeyService, configurationService: IConfigurationService, keybindingService: IKeybindingService, activityService: IActivityService);
    private updateItemActivity;
    private getCumulativeNumberBadge;
    render(container: HTMLElement): void;
    protected resolveContextMenuActions(disposables: DisposableStore): Promise<IAction[]>;
    private run;
    protected resolveMainMenuActions(menu: IMenu, _disposable: DisposableStore): Promise<IAction[]>;
}
export declare class AccountsActivityActionViewItem extends AbstractGlobalActivityActionViewItem {
    private readonly fillContextMenuActions;
    private readonly lifecycleService;
    private readonly authenticationService;
    private readonly productService;
    private readonly secretStorageService;
    private readonly logService;
    private readonly commandService;
    static readonly ACCOUNTS_VISIBILITY_PREFERENCE_KEY = "workbench.activity.showAccounts";
    private readonly groupedAccounts;
    private readonly problematicProviders;
    private initialized;
    private sessionFromEmbedder;
    constructor(contextMenuActionsProvider: () => IAction[], options: ICompositeBarActionViewItemOptions, contextMenuAlignmentOptions: () => Readonly<{
        anchorAlignment: AnchorAlignment;
        anchorAxisAlignment: AnchorAxisAlignment;
    }> | undefined, fillContextMenuActions: (actions: IAction[]) => void, themeService: IThemeService, lifecycleService: ILifecycleService, hoverService: IHoverService, contextMenuService: IContextMenuService, menuService: IMenuService, contextKeyService: IContextKeyService, authenticationService: IAuthenticationService, environmentService: IWorkbenchEnvironmentService, productService: IProductService, configurationService: IConfigurationService, keybindingService: IKeybindingService, secretStorageService: ISecretStorageService, logService: ILogService, activityService: IActivityService, instantiationService: IInstantiationService, commandService: ICommandService);
    private registerListeners;
    private initialize;
    private doInitialize;
    protected resolveMainMenuActions(accountsMenu: IMenu, disposables: DisposableStore): Promise<IAction[]>;
    protected resolveContextMenuActions(disposables: DisposableStore): Promise<IAction[]>;
    private addOrUpdateAccount;
    private removeAccount;
    private addAccountsFromProvider;
}
export declare class GlobalActivityActionViewItem extends AbstractGlobalActivityActionViewItem {
    private readonly userDataProfileService;
    private profileBadge;
    private profileBadgeContent;
    constructor(contextMenuActionsProvider: () => IAction[], options: ICompositeBarActionViewItemOptions, contextMenuAlignmentOptions: () => Readonly<{
        anchorAlignment: AnchorAlignment;
        anchorAxisAlignment: AnchorAxisAlignment;
    }> | undefined, userDataProfileService: IUserDataProfileService, themeService: IThemeService, hoverService: IHoverService, menuService: IMenuService, contextMenuService: IContextMenuService, contextKeyService: IContextKeyService, configurationService: IConfigurationService, environmentService: IWorkbenchEnvironmentService, keybindingService: IKeybindingService, instantiationService: IInstantiationService, activityService: IActivityService);
    render(container: HTMLElement): void;
    private updateProfileBadge;
    protected updateActivity(): void;
    protected computeTitle(): string;
}
export declare class SimpleAccountActivityActionViewItem extends AccountsActivityActionViewItem {
    constructor(hoverOptions: IActivityHoverOptions, options: IBaseActionViewItemOptions, themeService: IThemeService, lifecycleService: ILifecycleService, hoverService: IHoverService, contextMenuService: IContextMenuService, menuService: IMenuService, contextKeyService: IContextKeyService, authenticationService: IAuthenticationService, environmentService: IWorkbenchEnvironmentService, productService: IProductService, configurationService: IConfigurationService, keybindingService: IKeybindingService, secretStorageService: ISecretStorageService, storageService: IStorageService, logService: ILogService, activityService: IActivityService, instantiationService: IInstantiationService, commandService: ICommandService);
}
export declare class SimpleGlobalActivityActionViewItem extends GlobalActivityActionViewItem {
    constructor(hoverOptions: IActivityHoverOptions, options: IBaseActionViewItemOptions, userDataProfileService: IUserDataProfileService, themeService: IThemeService, hoverService: IHoverService, menuService: IMenuService, contextMenuService: IContextMenuService, contextKeyService: IContextKeyService, configurationService: IConfigurationService, environmentService: IWorkbenchEnvironmentService, keybindingService: IKeybindingService, instantiationService: IInstantiationService, activityService: IActivityService, storageService: IStorageService);
}
export declare function isAccountsActionVisible(storageService: IStorageService): boolean;
export {};
