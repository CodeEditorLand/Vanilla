import { Disposable } from "vs/base/common/lifecycle";
import { IMenuService } from "vs/platform/actions/common/actions";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IContextMenuService } from "vs/platform/contextview/browser/contextView";
import { IHoverService } from "vs/platform/hover/browser/hover";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IStorageService } from "vs/platform/storage/common/storage";
import { ITerminalConfigurationService, ITerminalGroupService, ITerminalService } from "vs/workbench/contrib/terminal/browser/terminal";
export declare class TerminalTabbedView extends Disposable {
    private readonly _terminalService;
    private readonly _terminalConfigurationService;
    private readonly _terminalGroupService;
    private readonly _instantiationService;
    private readonly _contextMenuService;
    private readonly _configurationService;
    private readonly _storageService;
    private readonly _hoverService;
    private _splitView;
    private _terminalContainer;
    private _tabListElement;
    private _tabContainer;
    private _tabList;
    private _sashDisposables;
    private _plusButton;
    private _tabTreeIndex;
    private _terminalContainerIndex;
    private _height;
    private _width;
    private _cancelContextMenu;
    private _instanceMenu;
    private _tabsListMenu;
    private _tabsListEmptyMenu;
    private _terminalIsTabsNarrowContextKey;
    private _terminalTabsFocusContextKey;
    private _terminalTabsMouseContextKey;
    private _panelOrientation;
    constructor(parentElement: HTMLElement, _terminalService: ITerminalService, _terminalConfigurationService: ITerminalConfigurationService, _terminalGroupService: ITerminalGroupService, _instantiationService: IInstantiationService, _contextMenuService: IContextMenuService, _configurationService: IConfigurationService, menuService: IMenuService, _storageService: IStorageService, contextKeyService: IContextKeyService, _hoverService: IHoverService);
    private _shouldShowTabs;
    private _refreshShowTabs;
    private _getLastListWidth;
    private _handleOnDidSashReset;
    private _getAdditionalWidth;
    private _handleOnDidSashChange;
    private _updateListWidth;
    private _setupSplitView;
    private _addTabTree;
    rerenderTabs(): void;
    private _addSashListener;
    private _removeSashListener;
    private _updateHasText;
    layout(width: number, height: number): void;
    private _attachEventListeners;
    private _getTabActions;
    setEditable(isEditing: boolean): void;
    focusTabs(): void;
    focus(): void;
    focusHover(): void;
    private _focus;
}
