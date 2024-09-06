import { AsyncIterableObject } from "../../../../base/common/async.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { Color } from "../../../../base/common/color.js";
import { IDisposable } from "../../../../base/common/lifecycle.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { ICodeEditor } from "../../../browser/editorBrowser.js";
import { Range } from "../../../common/core/range.js";
import { LanguageFeatureRegistry } from "../../../common/languageFeatureRegistry.js";
import { DocumentColorProvider, IColorInformation } from "../../../common/languages.js";
import { IModelDecoration } from "../../../common/model.js";
import { HoverAnchor, IEditorHoverParticipant, IEditorHoverRenderContext, IHoverPart, IRenderedHoverParts } from "../../hover/browser/hoverTypes.js";
import { ColorPickerModel } from "./colorPickerModel.js";
import { ColorPickerWidget } from "./colorPickerWidget.js";
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
