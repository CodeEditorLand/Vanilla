import * as dom from "../../../../base/browser/dom.js";
import { IAccessibilityService } from "../../../../platform/accessibility/common/accessibility.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { type ICodeEditor, type IContentWidgetPosition } from "../../../browser/editorBrowser.js";
import type { RenderedContentHover } from "./contentHoverRendered.js";
import { ResizableContentWidget } from "./resizableContentWidget.js";
export declare class ContentHoverWidget extends ResizableContentWidget {
    private readonly _configurationService;
    private readonly _accessibilityService;
    private readonly _keybindingService;
    static ID: string;
    private static _lastDimensions;
    private _renderedHover;
    private _positionPreference;
    private _minimumSize;
    private _contentWidth;
    private readonly _hover;
    private readonly _hoverVisibleKey;
    private readonly _hoverFocusedKey;
    private readonly _onDidResize;
    readonly onDidResize: import("../../../../base/common/event.js").Event<void>;
    get isVisibleFromKeyboard(): boolean;
    get isVisible(): boolean;
    get isFocused(): boolean;
    constructor(editor: ICodeEditor, contextKeyService: IContextKeyService, _configurationService: IConfigurationService, _accessibilityService: IAccessibilityService, _keybindingService: IKeybindingService);
    dispose(): void;
    getId(): string;
    private static _applyDimensions;
    private _setContentsDomNodeDimensions;
    private _setContainerDomNodeDimensions;
    private _setHoverWidgetDimensions;
    private static _applyMaxDimensions;
    private _setHoverWidgetMaxDimensions;
    private _setAdjustedHoverWidgetDimensions;
    private _updateResizableNodeMaxDimensions;
    protected _resize(size: dom.Dimension): void;
    private _findAvailableSpaceVertically;
    private _findMaximumRenderingHeight;
    private _isHoverTextOverflowing;
    private _findMaximumRenderingWidth;
    isMouseGettingCloser(posx: number, posy: number): boolean;
    private _setRenderedHover;
    private _updateFont;
    private _updateContent;
    private _layoutContentWidget;
    private _updateMaxDimensions;
    private _render;
    getPosition(): IContentWidgetPosition | null;
    show(renderedHover: RenderedContentHover): void;
    hide(): void;
    private _removeConstraintsRenderNormally;
    setMinimumDimensions(dimensions: dom.Dimension): void;
    private _updateMinimumWidth;
    onContentsChanged(): void;
    focus(): void;
    scrollUp(): void;
    scrollDown(): void;
    scrollLeft(): void;
    scrollRight(): void;
    pageUp(): void;
    pageDown(): void;
    goToTop(): void;
    goToBottom(): void;
}