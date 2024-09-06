import { Color } from "../../../../../base/common/color.js";
import { IDisposable } from "../../../../../base/common/lifecycle.js";
import { IThemeService } from "../../../../../platform/theme/common/themeService.js";
import { ICodeEditor } from "../../../../browser/editorBrowser.js";
import { Range } from "../../../../common/core/range.js";
import { LanguageFeatureRegistry } from "../../../../common/languageFeatureRegistry.js";
import { DocumentColorProvider, IColorInformation } from "../../../../common/languages.js";
import { IEditorHoverRenderContext } from "../../../hover/browser/hoverTypes.js";
import { ColorPickerModel } from "../colorPickerModel.js";
import { ColorPickerWidget } from "../hoverColorPicker/hoverColorPickerWidget.js";
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
