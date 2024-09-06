import { AsyncIterableObject } from "vs/base/common/async";
import { CancellationToken } from "vs/base/common/cancellation";
import { Color } from "vs/base/common/color";
import { IDisposable } from "vs/base/common/lifecycle";
import { ICodeEditor } from "vs/editor/browser/editorBrowser";
import { Range } from "vs/editor/common/core/range";
import { LanguageFeatureRegistry } from "vs/editor/common/languageFeatureRegistry";
import { DocumentColorProvider, IColorInformation } from "vs/editor/common/languages";
import { IModelDecoration } from "vs/editor/common/model";
import { ColorPickerModel } from "vs/editor/contrib/colorPicker/browser/colorPickerModel";
import { ColorPickerWidget } from "vs/editor/contrib/colorPicker/browser/colorPickerWidget";
import { HoverAnchor, IEditorHoverParticipant, IEditorHoverRenderContext, IHoverPart, IRenderedHoverParts } from "vs/editor/contrib/hover/browser/hoverTypes";
import { IThemeService } from "vs/platform/theme/common/themeService";
export declare class ColorHover implements IHoverPart {
    readonly owner: IEditorHoverParticipant<ColorHover>;
    readonly range: Range;
    readonly model: ColorPickerModel;
    readonly provider: DocumentColorProvider;
    /**
     * Force the hover to always be rendered at this specific range,
     * even in the case of multiple hover parts.
     */
    readonly forceShowAtRange: boolean;
    constructor(owner: IEditorHoverParticipant<ColorHover>, range: Range, model: ColorPickerModel, provider: DocumentColorProvider);
    isValidForHoverAnchor(anchor: HoverAnchor): boolean;
}
export declare class ColorHoverParticipant implements IEditorHoverParticipant<ColorHover> {
    private readonly _editor;
    private readonly _themeService;
    readonly hoverOrdinal: number;
    private _colorPicker;
    constructor(_editor: ICodeEditor, _themeService: IThemeService);
    computeSync(_anchor: HoverAnchor, _lineDecorations: IModelDecoration[]): ColorHover[];
    computeAsync(anchor: HoverAnchor, lineDecorations: IModelDecoration[], token: CancellationToken): AsyncIterableObject<ColorHover>;
    private _computeAsync;
    renderHoverParts(context: IEditorHoverRenderContext, hoverParts: ColorHover[]): IRenderedHoverParts<ColorHover>;
    getAccessibleContent(hoverPart: ColorHover): string;
    handleResize(): void;
    isColorPickerVisible(): boolean;
}
export declare class StandaloneColorPickerHover {
    readonly owner: StandaloneColorPickerParticipant;
    readonly range: Range;
    readonly model: ColorPickerModel;
    readonly provider: DocumentColorProvider;
    constructor(owner: StandaloneColorPickerParticipant, range: Range, model: ColorPickerModel, provider: DocumentColorProvider);
}
export declare class StandaloneColorPickerParticipant {
    private readonly _editor;
    private readonly _themeService;
    readonly hoverOrdinal: number;
    private _color;
    constructor(_editor: ICodeEditor, _themeService: IThemeService);
    createColorHover(defaultColorInfo: IColorInformation, defaultColorProvider: DocumentColorProvider, colorProviderRegistry: LanguageFeatureRegistry<DocumentColorProvider>): Promise<{
        colorHover: StandaloneColorPickerHover;
        foundInEditor: boolean;
    } | null>;
    updateEditorModel(colorHoverData: StandaloneColorPickerHover): Promise<void>;
    renderHoverParts(context: IEditorHoverRenderContext, hoverParts: StandaloneColorPickerHover[]): {
        disposables: IDisposable;
        hoverPart: StandaloneColorPickerHover;
        colorPicker: ColorPickerWidget;
    } | undefined;
    set color(color: Color | null);
    get color(): Color | null;
}
