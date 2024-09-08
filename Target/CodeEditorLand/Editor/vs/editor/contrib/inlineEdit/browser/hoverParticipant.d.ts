import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { type ICodeEditor, type IEditorMouseEvent } from "../../../browser/editorBrowser.js";
import type { Range } from "../../../common/core/range.js";
import type { IModelDecoration } from "../../../common/model.js";
import { type HoverAnchor, type IEditorHoverParticipant, type IEditorHoverRenderContext, type IHoverPart, type IRenderedHoverParts } from "../../hover/browser/hoverTypes.js";
import { InlineEditController } from "./inlineEditController.js";
export declare class InlineEditHover implements IHoverPart {
    readonly owner: IEditorHoverParticipant<InlineEditHover>;
    readonly range: Range;
    readonly controller: InlineEditController;
    constructor(owner: IEditorHoverParticipant<InlineEditHover>, range: Range, controller: InlineEditController);
    isValidForHoverAnchor(anchor: HoverAnchor): boolean;
}
export declare class InlineEditHoverParticipant implements IEditorHoverParticipant<InlineEditHover> {
    private readonly _editor;
    private readonly _instantiationService;
    private readonly _telemetryService;
    readonly hoverOrdinal: number;
    constructor(_editor: ICodeEditor, _instantiationService: IInstantiationService, _telemetryService: ITelemetryService);
    suggestHoverAnchor(mouseEvent: IEditorMouseEvent): HoverAnchor | null;
    computeSync(anchor: HoverAnchor, lineDecorations: IModelDecoration[]): InlineEditHover[];
    renderHoverParts(context: IEditorHoverRenderContext, hoverParts: InlineEditHover[]): IRenderedHoverParts<InlineEditHover>;
    getAccessibleContent(hoverPart: InlineEditHover): string;
}
