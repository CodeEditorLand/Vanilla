import { AsyncIterableObject } from "vs/base/common/async";
import { CancellationToken } from "vs/base/common/cancellation";
import { ICodeEditor, IEditorMouseEvent } from "vs/editor/browser/editorBrowser";
import { ILanguageService } from "vs/editor/common/languages/language";
import { IModelDecoration } from "vs/editor/common/model";
import { ILanguageFeaturesService } from "vs/editor/common/services/languageFeatures";
import { ITextModelService } from "vs/editor/common/services/resolverService";
import { HoverAnchor, IEditorHoverParticipant } from "vs/editor/contrib/hover/browser/hoverTypes";
import { MarkdownHover, MarkdownHoverParticipant } from "vs/editor/contrib/hover/browser/markdownHoverParticipant";
import { ICommandService } from "vs/platform/commands/common/commands";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IHoverService } from "vs/platform/hover/browser/hover";
import { IKeybindingService } from "vs/platform/keybinding/common/keybinding";
import { IOpenerService } from "vs/platform/opener/common/opener";
export declare class InlayHintsHover extends MarkdownHoverParticipant implements IEditorHoverParticipant<MarkdownHover> {
    private readonly _resolverService;
    readonly hoverOrdinal: number;
    constructor(editor: ICodeEditor, languageService: ILanguageService, openerService: IOpenerService, keybindingService: IKeybindingService, hoverService: IHoverService, configurationService: IConfigurationService, _resolverService: ITextModelService, languageFeaturesService: ILanguageFeaturesService, commandService: ICommandService);
    suggestHoverAnchor(mouseEvent: IEditorMouseEvent): HoverAnchor | null;
    computeSync(): MarkdownHover[];
    computeAsync(anchor: HoverAnchor, _lineDecorations: IModelDecoration[], token: CancellationToken): AsyncIterableObject<MarkdownHover>;
    private _resolveInlayHintLabelPartHover;
}
