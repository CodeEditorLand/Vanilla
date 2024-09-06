import "vs/css!./hover";
import { AnchorPosition } from "vs/base/browser/ui/contextview/contextview";
import type { IHoverOptions, IHoverWidget } from "vs/base/browser/ui/hover/hover";
import { Widget } from "vs/base/browser/ui/widget";
import { Event } from "vs/base/common/event";
import { IAccessibilityService } from "vs/platform/accessibility/common/accessibility";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IKeybindingService } from "vs/platform/keybinding/common/keybinding";
import { IOpenerService } from "vs/platform/opener/common/opener";
export declare class HoverWidget extends Widget implements IHoverWidget {
    private readonly _keybindingService;
    private readonly _configurationService;
    private readonly _openerService;
    private readonly _instantiationService;
    private readonly _accessibilityService;
    private readonly _messageListeners;
    private readonly _lockMouseTracker;
    private readonly _hover;
    private readonly _hoverPointer;
    private readonly _hoverContainer;
    private readonly _target;
    private readonly _linkHandler;
    private _isDisposed;
    private _hoverPosition;
    private _forcePosition;
    private _x;
    private _y;
    private _isLocked;
    private _enableFocusTraps;
    private _addedFocusTrap;
    private get _targetWindow();
    private get _targetDocumentElement();
    get isDisposed(): boolean;
    get isMouseIn(): boolean;
    get domNode(): HTMLElement;
    private readonly _onDispose;
    get onDispose(): Event<void>;
    private readonly _onRequestLayout;
    get onRequestLayout(): Event<void>;
    get anchor(): AnchorPosition;
    get x(): number;
    get y(): number;
    /**
     * Whether the hover is "locked" by holding the alt/option key. When locked, the hover will not
     * hide and can be hovered regardless of whether the `hideOnHover` hover option is set.
     */
    get isLocked(): boolean;
    set isLocked(value: boolean);
    constructor(options: IHoverOptions, _keybindingService: IKeybindingService, _configurationService: IConfigurationService, _openerService: IOpenerService, _instantiationService: IInstantiationService, _accessibilityService: IAccessibilityService);
    private addFocusTrap;
    private findLastFocusableChild;
    render(container: HTMLElement): void;
    layout(): void;
    private computeXCordinate;
    private computeYCordinate;
    private adjustHorizontalHoverPosition;
    private adjustVerticalHoverPosition;
    private adjustHoverMaxHeight;
    private setHoverPointerPosition;
    focus(): void;
    hide(): void;
    dispose(): void;
}
