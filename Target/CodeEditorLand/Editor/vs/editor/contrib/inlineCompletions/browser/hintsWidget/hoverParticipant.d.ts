import { ICodeEditor, IEditorMouseEvent } from "vs/editor/browser/editorBrowser";
import { Range } from "vs/editor/common/core/range";
import { ILanguageService } from "vs/editor/common/languages/language";
import { IModelDecoration } from "vs/editor/common/model";
import { HoverAnchor, IEditorHoverParticipant, IEditorHoverRenderContext, IHoverPart, IRenderedHoverParts } from "vs/editor/contrib/hover/browser/hoverTypes";
import { InlineCompletionsController } from "vs/editor/contrib/inlineCompletions/browser/controller/inlineCompletionsController";
import { IAccessibilityService } from "vs/platform/accessibility/common/accessibility";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IOpenerService } from "vs/platform/opener/common/opener";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
export declare class InlineCompletionsHover implements IHoverPart {
    readonly owner: IEditorHoverParticipant<InlineCompletionsHover>;
    readonly range: Range;
    readonly controller: InlineCompletionsController;
    constructor(owner: IEditorHoverParticipant<InlineCompletionsHover>, range: Range, controller: InlineCompletionsController);
    isValidForHoverAnchor(anchor: HoverAnchor): boolean;
}
export declare class InlineCompletionsHoverParticipant implements IEditorHoverParticipant<InlineCompletionsHover> {
    private readonly _editor;
    private readonly _languageService;
    private readonly _openerService;
    private readonly accessibilityService;
    private readonly _instantiationService;
    private readonly _telemetryService;
    readonly hoverOrdinal: number;
    constructor(_editor: ICodeEditor, _languageService: ILanguageService, _openerService: IOpenerService, accessibilityService: IAccessibilityService, _instantiationService: IInstantiationService, _telemetryService: ITelemetryService);
    suggestHoverAnchor(mouseEvent: IEditorMouseEvent): HoverAnchor | null;
    computeSync(anchor: HoverAnchor, lineDecorations: IModelDecoration[]): InlineCompletionsHover[];
    renderHoverParts(context: IEditorHoverRenderContext, hoverParts: InlineCompletionsHover[]): IRenderedHoverParts<InlineCompletionsHover>;
    getAccessibleContent(hoverPart: InlineCompletionsHover): string;
    private renderScreenReaderText;
}
