import { IClipboardService } from "vs/platform/clipboard/common/clipboardService";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IContextMenuService, IContextViewService } from "vs/platform/contextview/browser/contextView";
import { IHoverService } from "vs/platform/hover/browser/hover";
import { IKeybindingService } from "vs/platform/keybinding/common/keybinding";
import { IThemeService } from "vs/platform/theme/common/themeService";
import { SimpleFindWidget } from "vs/workbench/contrib/codeEditor/browser/find/simpleFindWidget";
import { IDetachedTerminalInstance, ITerminalInstance } from "vs/workbench/contrib/terminal/browser/terminal";
export declare class TerminalFindWidget extends SimpleFindWidget {
    private _instance;
    private readonly _contextKeyService;
    private readonly _themeService;
    private readonly _configurationService;
    private _findInputFocused;
    private _findWidgetFocused;
    private _findWidgetVisible;
    private _overrideCopyOnSelectionDisposable;
    constructor(_instance: ITerminalInstance | IDetachedTerminalInstance, _contextViewService: IContextViewService, keybindingService: IKeybindingService, _contextKeyService: IContextKeyService, _contextMenuService: IContextMenuService, _clipboardService: IClipboardService, hoverService: IHoverService, _themeService: IThemeService, _configurationService: IConfigurationService);
    find(previous: boolean, update?: boolean): void;
    reveal(): void;
    show(): void;
    hide(): void;
    protected _getResultCount(): Promise<{
        resultIndex: number;
        resultCount: number;
    } | undefined>;
    protected _onInputChanged(): boolean;
    protected _onFocusTrackerFocus(): void;
    protected _onFocusTrackerBlur(): void;
    protected _onFindInputFocusTrackerFocus(): void;
    protected _onFindInputFocusTrackerBlur(): void;
    findFirst(): void;
    private _findNextWithEvent;
    private _findPreviousWithEvent;
}
