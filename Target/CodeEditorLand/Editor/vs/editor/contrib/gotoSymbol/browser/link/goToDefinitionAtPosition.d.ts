import "./goToDefinitionAtPosition.css";
import { ICodeEditor } from "../../../../browser/editorBrowser.js";
import { Position } from "../../../../common/core/position.js";
import { IEditorContribution } from "../../../../common/editorCommon.js";
import { ILanguageService } from "../../../../common/languages/language.js";
import { ILanguageFeaturesService } from "../../../../common/services/languageFeatures.js";
import { ITextModelService } from "../../../../common/services/resolverService.js";
export declare class GotoDefinitionAtPositionEditorContribution implements IEditorContribution {
    private readonly textModelResolverService;
    private readonly languageService;
    private readonly languageFeaturesService;
    static readonly ID = "editor.contrib.gotodefinitionatposition";
    static readonly MAX_SOURCE_PREVIEW_LINES = 8;
    private readonly editor;
    private readonly toUnhook;
    private readonly toUnhookForKeyboard;
    private readonly linkDecorations;
    private currentWordAtPosition;
    private previousPromise;
    constructor(editor: ICodeEditor, textModelResolverService: ITextModelService, languageService: ILanguageService, languageFeaturesService: ILanguageFeaturesService);
    static get(editor: ICodeEditor): GotoDefinitionAtPositionEditorContribution | null;
    startFindDefinitionFromCursor(position: Position): Promise<void>;
    private startFindDefinitionFromMouse;
    private startFindDefinition;
    private getPreviewValue;
    private stripIndentationFromPreviewRange;
    private getPreviewRangeBasedOnIndentation;
    private addDecoration;
    private removeLinkDecorations;
    private isEnabled;
    private findDefinition;
    private gotoDefinition;
    private isInPeekEditor;
    dispose(): void;
}
