import { Color } from "../../../../base/common/color.js";
import { DisposableStore } from "../../../../base/common/lifecycle.js";
import type { IThemeService } from "../../../../platform/theme/common/themeService.js";
import type { IActiveCodeEditor, ICodeEditor } from "../../../browser/editorBrowser.js";
import { Range } from "../../../common/core/range.js";
import type { DocumentColorProvider, IColorInformation } from "../../../common/languages.js";
import { type ITextModel } from "../../../common/model.js";
import type { IEditorHoverRenderContext } from "../../hover/browser/hoverTypes.js";
import { ColorPickerModel } from "./colorPickerModel.js";
import { ColorHover, HoverColorPickerParticipant } from "./hoverColorPicker/hoverColorPickerParticipant.js";
import { ColorPickerWidget } from "./hoverColorPicker/hoverColorPickerWidget.js";
import { StandaloneColorPickerHover, StandaloneColorPickerParticipant } from "./standaloneColorPicker/standaloneColorPickerParticipant.js";
export declare function createColorHover<T extends HoverColorPickerParticipant | StandaloneColorPickerParticipant>(participant: T, editorModel: ITextModel, colorInfo: IColorInformation, provider: DocumentColorProvider): Promise<T extends HoverColorPickerParticipant ? ColorHover : StandaloneColorPickerHover>;
export declare function renderHoverParts<T extends ColorHover | StandaloneColorPickerHover>(participant: HoverColorPickerParticipant | StandaloneColorPickerParticipant, editor: ICodeEditor, themeService: IThemeService, hoverParts: T[], context: IEditorHoverRenderContext): {
    hoverPart: T;
    colorPicker: ColorPickerWidget;
    disposables: DisposableStore;
} | undefined;
export declare function updateEditorModel(editor: IActiveCodeEditor, range: Range, model: ColorPickerModel): Range;
export declare function updateColorPresentations(editorModel: ITextModel, colorPickerModel: ColorPickerModel, color: Color, range: Range, colorHover: ColorHover | StandaloneColorPickerHover): Promise<void>;
