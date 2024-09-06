import { IKeyboardEvent } from "vs/base/browser/keyboardEvent";
import { IContextViewProvider } from "vs/base/browser/ui/contextview/contextview";
import { IVerticalSashLayoutProvider, Sash } from "vs/base/browser/ui/sash/sash";
import { Widget } from "vs/base/browser/ui/widget";
import "vs/css!./findWidget";
import { IHoverDelegate } from "vs/base/browser/ui/hover/hoverDelegate";
import { ThemeIcon } from "vs/base/common/themables";
import { ICodeEditor, IOverlayWidget, IOverlayWidgetPosition, IViewZone } from "vs/editor/browser/editorBrowser";
import { FindReplaceState } from "vs/editor/contrib/find/browser/findState";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IHoverService } from "vs/platform/hover/browser/hover";
import { IKeybindingService } from "vs/platform/keybinding/common/keybinding";
import { INotificationService } from "vs/platform/notification/common/notification";
import { IStorageService } from "vs/platform/storage/common/storage";
import { IThemeService } from "vs/platform/theme/common/themeService";
export declare const findSelectionIcon: any;
export declare const findReplaceIcon: any;
export declare const findReplaceAllIcon: any;
export declare const findPreviousMatchIcon: any;
export declare const findNextMatchIcon: any;
export interface IFindController {
    replace(): void;
    replaceAll(): void;
    getGlobalBufferTerm(): Promise<string>;
}
export declare const NLS_MATCHES_LOCATION: any;
export declare const NLS_NO_RESULTS: any;
export declare class FindWidgetViewZone implements IViewZone {
    readonly afterLineNumber: number;
    heightInPx: number;
    readonly suppressMouseDown: boolean;
    readonly domNode: HTMLElement;
    constructor(afterLineNumber: number);
}
export declare class FindWidget extends Widget implements IOverlayWidget, IVerticalSashLayoutProvider {
    private readonly _hoverService;
    private static readonly ID;
    private readonly _codeEditor;
    private readonly _state;
    private readonly _controller;
    private readonly _contextViewProvider;
    private readonly _keybindingService;
    private readonly _contextKeyService;
    private readonly _storageService;
    private readonly _notificationService;
    private _domNode;
    private _cachedHeight;
    private _findInput;
    private _replaceInput;
    private _toggleReplaceBtn;
    private _matchesCount;
    private _prevBtn;
    private _nextBtn;
    private _toggleSelectionFind;
    private _closeBtn;
    private _replaceBtn;
    private _replaceAllBtn;
    private _isVisible;
    private _isReplaceVisible;
    private _ignoreChangeEvent;
    private _ctrlEnterReplaceAllWarningPrompted;
    private readonly _findFocusTracker;
    private readonly _findInputFocused;
    private readonly _replaceFocusTracker;
    private readonly _replaceInputFocused;
    private _viewZone?;
    private _viewZoneId?;
    private _resizeSash;
    private _resized;
    private readonly _updateHistoryDelayer;
    constructor(codeEditor: ICodeEditor, controller: IFindController, state: FindReplaceState, contextViewProvider: IContextViewProvider, keybindingService: IKeybindingService, contextKeyService: IContextKeyService, themeService: IThemeService, storageService: IStorageService, notificationService: INotificationService, _hoverService: IHoverService);
    getId(): string;
    getDomNode(): HTMLElement;
    getPosition(): IOverlayWidgetPosition | null;
    private _onStateChanged;
    private _delayedUpdateHistory;
    private _updateHistory;
    private _updateMatchesCount;
    private _getAriaLabel;
    /**
     * If 'selection find' is ON we should not disable the button (its function is to cancel 'selection find').
     * If 'selection find' is OFF we enable the button only if there is a selection.
     */
    private _updateToggleSelectionFindButton;
    private _updateButtons;
    private _revealTimeouts;
    private _reveal;
    private _hide;
    private _layoutViewZone;
    private _showViewZone;
    private _removeViewZone;
    private _tryUpdateWidgetWidth;
    private _getHeight;
    private _tryUpdateHeight;
    focusFindInput(): void;
    focusReplaceInput(): void;
    highlightFindOptions(): void;
    private _updateSearchScope;
    private _onFindInputMouseDown;
    private _onFindInputKeyDown;
    private _onReplaceInputKeyDown;
    getVerticalSashLeft(_sash: Sash): number;
    private _keybindingLabelFor;
    private _buildDomNode;
    private updateAccessibilitySupport;
    getViewState(): {
        widgetViewZoneVisible: boolean;
        scrollTop: any;
    };
    setViewState(state?: {
        widgetViewZoneVisible: boolean;
        scrollTop: number;
    }): void;
}
export interface ISimpleButtonOpts {
    readonly label: string;
    readonly className?: string;
    readonly icon?: ThemeIcon;
    readonly hoverDelegate?: IHoverDelegate;
    readonly onTrigger: () => void;
    readonly onKeyDown?: (e: IKeyboardEvent) => void;
}
export declare class SimpleButton extends Widget {
    private readonly _opts;
    private readonly _domNode;
    constructor(opts: ISimpleButtonOpts, hoverService: IHoverService);
    get domNode(): HTMLElement;
    isEnabled(): boolean;
    focus(): void;
    setEnabled(enabled: boolean): void;
    setExpanded(expanded: boolean): void;
}
