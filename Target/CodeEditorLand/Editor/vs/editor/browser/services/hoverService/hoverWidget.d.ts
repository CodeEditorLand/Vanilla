import "./hover.css";
import { AnchorPosition } from "../../../../base/browser/ui/contextview/contextview.js";
import type { IHoverOptions, IHoverWidget } from "../../../../base/browser/ui/hover/hover.js";
import { Widget } from "../../../../base/browser/ui/widget.js";
import { Event } from "../../../../base/common/event.js";
import { IAccessibilityService } from "../../../../platform/accessibility/common/accessibility.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
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
