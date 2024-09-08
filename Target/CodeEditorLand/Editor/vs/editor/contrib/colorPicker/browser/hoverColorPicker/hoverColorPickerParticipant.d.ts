import { AsyncIterableObject } from "../../../../../base/common/async.js";
import type { CancellationToken } from "../../../../../base/common/cancellation.js";
import { IThemeService } from "../../../../../platform/theme/common/themeService.js";
import type { ICodeEditor } from "../../../../browser/editorBrowser.js";
import type { Range } from "../../../../common/core/range.js";
import type { DocumentColorProvider } from "../../../../common/languages.js";
import type { IModelDecoration } from "../../../../common/model.js";
import { type HoverAnchor, type IEditorHoverParticipant, type IEditorHoverRenderContext, type IHoverPart, type IRenderedHoverParts } from "../../../hover/browser/hoverTypes.js";
import type { ColorPickerModel } from "../colorPickerModel.js";
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
export declare class HoverColorPickerParticipant implements IEditorHoverParticipant<ColorHover> {
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
