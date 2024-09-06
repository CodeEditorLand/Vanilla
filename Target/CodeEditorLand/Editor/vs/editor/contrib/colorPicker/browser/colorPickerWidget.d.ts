import { Widget } from "vs/base/browser/ui/widget";
import { Color } from "vs/base/common/color";
import { Event } from "vs/base/common/event";
import { Disposable } from "vs/base/common/lifecycle";
import "vs/css!./colorPicker";
import { ColorPickerModel } from "vs/editor/contrib/colorPicker/browser/colorPickerModel";
import { IEditorHoverColorPickerWidget } from "vs/editor/contrib/hover/browser/hoverTypes";
import { IThemeService } from "vs/platform/theme/common/themeService";
export declare class ColorPickerHeader extends Disposable {
    private readonly model;
    private showingStandaloneColorPicker;
    private readonly _domNode;
    private readonly _pickedColorNode;
    private readonly _pickedColorPresentation;
    private readonly _originalColorNode;
    private readonly _closeButton;
    private backgroundColor;
    constructor(container: HTMLElement, model: ColorPickerModel, themeService: IThemeService, showingStandaloneColorPicker?: boolean);
    get domNode(): HTMLElement;
    get closeButton(): CloseButton | null;
    get pickedColorNode(): HTMLElement;
    get originalColorNode(): HTMLElement;
    private onDidChangeColor;
    private onDidChangePresentation;
}
declare class CloseButton extends Disposable {
    private _button;
    private readonly _onClicked;
    readonly onClicked: any;
    constructor(container: HTMLElement);
}
export declare class ColorPickerBody extends Disposable {
    private readonly model;
    private pixelRatio;
    private readonly _domNode;
    private readonly _saturationBox;
    private readonly _hueStrip;
    private readonly _opacityStrip;
    private readonly _insertButton;
    constructor(container: HTMLElement, model: ColorPickerModel, pixelRatio: number, isStandaloneColorPicker?: boolean);
    private flushColor;
    private onDidSaturationValueChange;
    private onDidOpacityChange;
    private onDidHueChange;
    get domNode(): HTMLElement;
    get saturationBox(): SaturationBox;
    get opacityStrip(): Strip;
    get hueStrip(): Strip;
    get enterButton(): InsertButton | null;
    layout(): void;
}
declare class SaturationBox extends Disposable {
    private readonly model;
    private pixelRatio;
    private readonly _domNode;
    private readonly selection;
    private readonly _canvas;
    private width;
    private height;
    private monitor;
    private readonly _onDidChange;
    readonly onDidChange: Event<{
        s: number;
        v: number;
    }>;
    private readonly _onColorFlushed;
    readonly onColorFlushed: Event<void>;
    constructor(container: HTMLElement, model: ColorPickerModel, pixelRatio: number);
    get domNode(): HTMLElement;
    get canvas(): HTMLCanvasElement;
    private onPointerDown;
    private onDidChangePosition;
    layout(): void;
    private paint;
    private paintSelection;
    private onDidChangeColor;
}
declare abstract class Strip extends Disposable {
    protected model: ColorPickerModel;
    protected domNode: HTMLElement;
    protected overlay: HTMLElement;
    protected slider: HTMLElement;
    private height;
    private readonly _onDidChange;
    readonly onDidChange: Event<number>;
    private readonly _onColorFlushed;
    readonly onColorFlushed: Event<void>;
    constructor(container: HTMLElement, model: ColorPickerModel, showingStandaloneColorPicker?: boolean);
    layout(): void;
    protected onDidChangeColor(color: Color): void;
    private onPointerDown;
    private onDidChangeTop;
    private updateSliderPosition;
    protected abstract getValue(color: Color): number;
}
export declare class InsertButton extends Disposable {
    private _button;
    private readonly _onClicked;
    readonly onClicked: any;
    constructor(container: HTMLElement);
    get button(): HTMLElement;
}
export declare class ColorPickerWidget extends Widget implements IEditorHoverColorPickerWidget {
    readonly model: ColorPickerModel;
    private pixelRatio;
    private static readonly ID;
    private readonly _domNode;
    body: ColorPickerBody;
    header: ColorPickerHeader;
    constructor(container: Node, model: ColorPickerModel, pixelRatio: number, themeService: IThemeService, standaloneColorPicker?: boolean);
    getId(): string;
    layout(): void;
    get domNode(): HTMLElement;
}
export {};
