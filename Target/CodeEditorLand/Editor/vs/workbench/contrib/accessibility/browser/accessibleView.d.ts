import { Disposable } from "vs/base/common/lifecycle";
import { Position } from "vs/editor/common/core/position";
import { IModelService } from "vs/editor/common/services/model";
import { AccessibleContentProvider, AccessibleViewProviderId, ExtensionContentProvider, IAccessibleViewService, IAccessibleViewSymbol } from "vs/platform/accessibility/browser/accessibleView";
import { IAccessibilityService } from "vs/platform/accessibility/common/accessibility";
import { IMenuService } from "vs/platform/actions/common/actions";
import { ICommandService } from "vs/platform/commands/common/commands";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IContextViewService } from "vs/platform/contextview/browser/contextView";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IKeybindingService } from "vs/platform/keybinding/common/keybinding";
import { ILayoutService } from "vs/platform/layout/browser/layoutService";
import { IOpenerService } from "vs/platform/opener/common/opener";
import { IQuickInputService } from "vs/platform/quickinput/common/quickInput";
import { IStorageService } from "vs/platform/storage/common/storage";
import { AccessibilityVerbositySettingId } from "vs/workbench/contrib/accessibility/browser/accessibilityConfiguration";
import { IChatCodeBlockContextProviderService } from "vs/workbench/contrib/chat/browser/chat";
import { ICodeBlockActionContext } from "vs/workbench/contrib/chat/browser/codeBlockPart";
export type AccesibleViewContentProvider = AccessibleContentProvider | ExtensionContentProvider;
export declare class AccessibleView extends Disposable {
    private readonly _openerService;
    private readonly _instantiationService;
    private readonly _configurationService;
    private readonly _modelService;
    private readonly _contextViewService;
    private readonly _contextKeyService;
    private readonly _accessibilityService;
    private readonly _keybindingService;
    private readonly _layoutService;
    private readonly _menuService;
    private readonly _commandService;
    private readonly _codeBlockContextProviderService;
    private readonly _storageService;
    private readonly _quickInputService;
    private _editorWidget;
    private _accessiblityHelpIsShown;
    private _onLastLine;
    private _accessibleViewIsShown;
    private _accessibleViewSupportsNavigation;
    private _accessibleViewVerbosityEnabled;
    private _accessibleViewGoToSymbolSupported;
    private _accessibleViewCurrentProviderId;
    private _accessibleViewInCodeBlock;
    private _accessibleViewContainsCodeBlocks;
    private _hasUnassignedKeybindings;
    private _hasAssignedKeybindings;
    private _codeBlocks?;
    private _inQuickPick;
    get editorWidget(): CodeEditorWidget;
    private _container;
    private _title;
    private readonly _toolbar;
    private _currentProvider;
    private _currentContent;
    private _lastProvider;
    private _viewContainer;
    constructor(_openerService: IOpenerService, _instantiationService: IInstantiationService, _configurationService: IConfigurationService, _modelService: IModelService, _contextViewService: IContextViewService, _contextKeyService: IContextKeyService, _accessibilityService: IAccessibilityService, _keybindingService: IKeybindingService, _layoutService: ILayoutService, _menuService: IMenuService, _commandService: ICommandService, _codeBlockContextProviderService: IChatCodeBlockContextProviderService, _storageService: IStorageService, _quickInputService: IQuickInputService);
    private _resetContextKeys;
    getPosition(id?: AccessibleViewProviderId): Position | undefined;
    setPosition(position: Position, reveal?: boolean, select?: boolean): void;
    getCodeBlockContext(): ICodeBlockActionContext | undefined;
    navigateToCodeBlock(type: "next" | "previous"): void;
    showLastProvider(id: AccessibleViewProviderId): void;
    show(provider?: AccesibleViewContentProvider, symbol?: IAccessibleViewSymbol, showAccessibleViewHelp?: boolean, position?: Position): void;
    previous(): void;
    next(): void;
    private _verbosityEnabled;
    goToSymbol(): void;
    calculateCodeBlocks(markdown?: string): void;
    getSymbols(): IAccessibleViewSymbol[] | undefined;
    openHelpLink(): void;
    configureKeybindings(unassigned: boolean): void;
    private _convertTokensToSymbols;
    showSymbol(provider: AccesibleViewContentProvider, symbol: IAccessibleViewSymbol): void;
    disableHint(): void;
    private _updateContextKeys;
    private _updateContent;
    private _render;
    private _updateToolbar;
    private _layout;
    private _getTextModel;
    private _goToSymbolsSupported;
    private _updateLastProvider;
    showAccessibleViewHelp(): void;
    private _accessibleViewHelpDialogContent;
    private _getChatHints;
    private _navigationHint;
    private _disableVerbosityHint;
    private _goToSymbolHint;
    private _configureUnassignedKbHint;
    private _configureAssignedKbHint;
    private _screenReaderModeHint;
    private _exitDialogHint;
    private _readMoreHint;
}
export declare class AccessibleViewService extends Disposable implements IAccessibleViewService {
    private readonly _instantiationService;
    private readonly _configurationService;
    private readonly _keybindingService;
    readonly _serviceBrand: undefined;
    private _accessibleView;
    constructor(_instantiationService: IInstantiationService, _configurationService: IConfigurationService, _keybindingService: IKeybindingService);
    show(provider: AccesibleViewContentProvider, position?: Position): void;
    configureKeybindings(unassigned: boolean): void;
    openHelpLink(): void;
    showLastProvider(id: AccessibleViewProviderId): void;
    next(): void;
    previous(): void;
    goToSymbol(): void;
    getOpenAriaHint(verbositySettingKey: AccessibilityVerbositySettingId): string | null;
    disableHint(): void;
    showAccessibleViewHelp(): void;
    getPosition(id: AccessibleViewProviderId): Position | undefined;
    getLastPosition(): Position | undefined;
    setPosition(position: Position, reveal?: boolean, select?: boolean): void;
    getCodeBlockContext(): ICodeBlockActionContext | undefined;
    navigateToCodeBlock(type: "next" | "previous"): void;
}