import { ICodeEditor, IEditorMouseEvent } from "vs/editor/browser/editorBrowser";
import { Range } from "vs/editor/common/core/range";
import { IModelDecoration } from "vs/editor/common/model";
import { HoverAnchor, IEditorHoverParticipant, IEditorHoverRenderContext, IHoverPart, IRenderedHoverParts } from "vs/editor/contrib/hover/browser/hoverTypes";
import { InlineEditController } from "vs/editor/contrib/inlineEdit/browser/inlineEditController";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
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
