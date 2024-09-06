import { AsyncIterableObject } from "vs/base/common/async";
import { CancellationToken } from "vs/base/common/cancellation";
import { IMarkdownString } from "vs/base/common/htmlContent";
import { ICodeEditor } from "vs/editor/browser/editorBrowser";
import { Position } from "vs/editor/common/core/position";
import { Range } from "vs/editor/common/core/range";
import { Hover, HoverProvider, HoverVerbosityAction } from "vs/editor/common/languages";
import { ILanguageService } from "vs/editor/common/languages/language";
import { IModelDecoration } from "vs/editor/common/model";
import { ILanguageFeaturesService } from "vs/editor/common/services/languageFeatures";
import { HoverAnchor, IEditorHoverParticipant, IEditorHoverRenderContext, IHoverPart, IRenderedHoverParts } from "vs/editor/contrib/hover/browser/hoverTypes";
import { ICommandService } from "vs/platform/commands/common/commands";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IHoverService } from "vs/platform/hover/browser/hover";
import { IKeybindingService } from "vs/platform/keybinding/common/keybinding";
import { IOpenerService } from "vs/platform/opener/common/opener";
export declare class MarkdownHover implements IHoverPart {
    readonly owner: IEditorHoverParticipant<MarkdownHover>;
    readonly range: Range;
    readonly contents: IMarkdownString[];
    readonly isBeforeContent: boolean;
    readonly ordinal: number;
    readonly source: HoverSource | undefined;
    constructor(owner: IEditorHoverParticipant<MarkdownHover>, range: Range, contents: IMarkdownString[], isBeforeContent: boolean, ordinal: number, source?: HoverSource | undefined);
    isValidForHoverAnchor(anchor: HoverAnchor): boolean;
}
declare class HoverSource {
    readonly hover: Hover;
    readonly hoverProvider: HoverProvider;
    readonly hoverPosition: Position;
    constructor(hover: Hover, hoverProvider: HoverProvider, hoverPosition: Position);
    supportsVerbosityAction(hoverVerbosityAction: HoverVerbosityAction): boolean;
}
export declare class MarkdownHoverParticipant implements IEditorHoverParticipant<MarkdownHover> {
    protected readonly _editor: ICodeEditor;
    private readonly _languageService;
    private readonly _openerService;
    private readonly _configurationService;
    protected readonly _languageFeaturesService: ILanguageFeaturesService;
    private readonly _keybindingService;
    private readonly _hoverService;
    private readonly _commandService;
    readonly hoverOrdinal: number;
    private _renderedHoverParts;
    constructor(_editor: ICodeEditor, _languageService: ILanguageService, _openerService: IOpenerService, _configurationService: IConfigurationService, _languageFeaturesService: ILanguageFeaturesService, _keybindingService: IKeybindingService, _hoverService: IHoverService, _commandService: ICommandService);
    createLoadingMessage(anchor: HoverAnchor): MarkdownHover | null;
    computeSync(anchor: HoverAnchor, lineDecorations: IModelDecoration[]): MarkdownHover[];
    computeAsync(anchor: HoverAnchor, lineDecorations: IModelDecoration[], token: CancellationToken): AsyncIterableObject<MarkdownHover>;
    private _getMarkdownHovers;
    renderHoverParts(context: IEditorHoverRenderContext, hoverParts: MarkdownHover[]): IRenderedHoverParts<MarkdownHover>;
    getAccessibleContent(hoverPart: MarkdownHover): string;
    doesMarkdownHoverAtIndexSupportVerbosityAction(index: number, action: HoverVerbosityAction): boolean;
    updateMarkdownHoverVerbosityLevel(action: HoverVerbosityAction, index: number, focus?: boolean): Promise<{
        hoverPart: MarkdownHover;
        hoverElement: HTMLElement;
    } | undefined>;
}
export declare function renderMarkdownHovers(context: IEditorHoverRenderContext, markdownHovers: MarkdownHover[], editor: ICodeEditor, languageService: ILanguageService, openerService: IOpenerService): IRenderedHoverParts<MarkdownHover>;
export declare function labelForHoverVerbosityAction(keybindingService: IKeybindingService, action: HoverVerbosityAction): string;
export {};
