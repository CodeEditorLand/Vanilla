import { IAction } from "vs/base/common/actions";
import { IDisposable } from "vs/base/common/lifecycle";
import "vs/css!./media/scm";
import { IMenu, IMenuService } from "vs/platform/actions/common/actions";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { ISCMHistoryProviderMenus, SCMHistoryItemGroupTreeElement, SCMHistoryItemTreeElement, SCMHistoryItemViewModelTreeElement } from "vs/workbench/contrib/scm/common/history";
import { ISCMMenus, ISCMProvider, ISCMRepositoryMenus, ISCMResource, ISCMResourceGroup, ISCMService } from "vs/workbench/contrib/scm/common/scm";
export declare class SCMTitleMenu implements IDisposable {
    private _actions;
    get actions(): IAction[];
    private _secondaryActions;
    get secondaryActions(): IAction[];
    private readonly _onDidChangeTitle;
    readonly onDidChangeTitle: any;
    readonly menu: IMenu;
    private readonly disposables;
    constructor(menuService: IMenuService, contextKeyService: IContextKeyService);
    private updateTitleActions;
    dispose(): void;
}
export declare class SCMRepositoryMenus implements ISCMRepositoryMenus, IDisposable {
    private readonly provider;
    private readonly menuService;
    private contextKeyService;
    readonly titleMenu: SCMTitleMenu;
    readonly repositoryMenu: IMenu;
    private readonly resourceGroupMenusItems;
    private _repositoryContextMenu;
    get repositoryContextMenu(): IMenu;
    private _historyProviderMenu;
    get historyProviderMenu(): SCMHistoryProviderMenus | undefined;
    private readonly disposables;
    constructor(provider: ISCMProvider, contextKeyService: IContextKeyService, instantiationService: IInstantiationService, menuService: IMenuService);
    getResourceGroupMenu(group: ISCMResourceGroup): IMenu;
    getResourceMenu(resource: ISCMResource): IMenu;
    getResourceFolderMenu(group: ISCMResourceGroup): IMenu;
    private getOrCreateResourceGroupMenusItem;
    private onDidChangeResourceGroups;
    dispose(): void;
}
export declare class SCMHistoryProviderMenus implements ISCMHistoryProviderMenus, IDisposable {
    private readonly contextKeyService;
    private readonly menuService;
    private readonly historyItemMenus;
    private readonly historyItemMenus2;
    private readonly disposables;
    constructor(contextKeyService: IContextKeyService, menuService: IMenuService);
    getHistoryItemMenu(historyItem: SCMHistoryItemTreeElement): IMenu;
    getHistoryItemMenu2(historyItem: SCMHistoryItemViewModelTreeElement): IMenu;
    getHistoryItemGroupMenu(historyItemGroup: SCMHistoryItemGroupTreeElement): IMenu;
    getHistoryItemGroupContextMenu(historyItemGroup: SCMHistoryItemGroupTreeElement): IMenu;
    private getOrCreateHistoryItemMenu;
    private getOrCreateHistoryItemMenu2;
    private getOutgoingHistoryItemGroupMenu;
    dispose(): void;
}
export declare class SCMMenus implements ISCMMenus, IDisposable {
    private instantiationService;
    readonly titleMenu: SCMTitleMenu;
    private readonly disposables;
    private readonly menus;
    constructor(scmService: ISCMService, instantiationService: IInstantiationService);
    private onDidRemoveRepository;
    getRepositoryMenus(provider: ISCMProvider): SCMRepositoryMenus;
    dispose(): void;
}
