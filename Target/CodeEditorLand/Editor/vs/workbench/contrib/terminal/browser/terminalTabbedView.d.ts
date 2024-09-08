import { Disposable } from "../../../../base/common/lifecycle.js";
import { IMenuService } from "../../../../platform/actions/common/actions.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { IHoverService } from "../../../../platform/hover/browser/hover.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { ITerminalConfigurationService, ITerminalGroupService, ITerminalService } from "./terminal.js";
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