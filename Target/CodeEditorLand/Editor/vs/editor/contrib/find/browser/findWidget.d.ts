import type { IKeyboardEvent } from "../../../../base/browser/keyboardEvent.js";
import type { IContextViewProvider } from "../../../../base/browser/ui/contextview/contextview.js";
import { type IVerticalSashLayoutProvider, Sash } from "../../../../base/browser/ui/sash/sash.js";
import { Widget } from "../../../../base/browser/ui/widget.js";
import "./findWidget.css";
import type { IHoverDelegate } from "../../../../base/browser/ui/hover/hoverDelegate.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import type { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import type { IHoverService } from "../../../../platform/hover/browser/hover.js";
import type { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import type { INotificationService } from "../../../../platform/notification/common/notification.js";
import { type IStorageService } from "../../../../platform/storage/common/storage.js";
import { type IThemeService } from "../../../../platform/theme/common/themeService.js";
import { type ICodeEditor, type IOverlayWidget, type IOverlayWidgetPosition, type IViewZone } from "../../../browser/editorBrowser.js";
import type { FindReplaceState } from "./findState.js";
export declare const findSelectionIcon: ThemeIcon;
export declare const findReplaceIcon: ThemeIcon;
export declare const findReplaceAllIcon: ThemeIcon;
export declare const findPreviousMatchIcon: ThemeIcon;
export declare const findNextMatchIcon: ThemeIcon;
export interface IFindController {
    replace(): void;
    replaceAll(): void;
    getGlobalBufferTerm(): Promise<string>;
}
export declare const NLS_MATCHES_LOCATION: string;
export declare const NLS_NO_RESULTS: string;
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
        scrollTop: number;
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
