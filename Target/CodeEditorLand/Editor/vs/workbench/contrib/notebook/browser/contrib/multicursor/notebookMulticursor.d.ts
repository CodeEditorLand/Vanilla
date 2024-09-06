import { Event } from "vs/base/common/event";
import { Disposable } from "vs/base/common/lifecycle";
import { ILanguageConfigurationService } from "vs/editor/common/languages/languageConfigurationRegistry";
import { ITextModelService } from "vs/editor/common/services/resolverService";
import { IAccessibilityService } from "vs/platform/accessibility/common/accessibility";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { ICellViewModel, INotebookEditor, INotebookEditorContribution } from "vs/workbench/contrib/notebook/browser/notebookBrowser";
export declare const NOTEBOOK_MULTI_SELECTION_CONTEXT: {
    IsNotebookMultiSelect: any;
};
export declare class NotebookMultiCursorController extends Disposable implements INotebookEditorContribution {
    private readonly notebookEditor;
    private readonly contextKeyService;
    private readonly textModelService;
    private readonly languageConfigurationService;
    private readonly accessibilityService;
    private readonly configurationService;
    static readonly id: string;
    private state;
    private word;
    private trackedMatches;
    private readonly _onDidChangeAnchorCell;
    readonly onDidChangeAnchorCell: Event<void>;
    private anchorCell;
    private readonly anchorDisposables;
    private readonly cursorsDisposables;
    private cursorsControllers;
    private _nbIsMultiSelectSession;
    constructor(notebookEditor: INotebookEditor, contextKeyService: IContextKeyService, textModelService: ITextModelService, languageConfigurationService: ILanguageConfigurationService, accessibilityService: IAccessibilityService, configurationService: IConfigurationService);
    private updateCursorsControllers;
    private constructCoordinatesConverter;
    private constructCursorSimpleModel;
    private updateAnchorListeners;
    resetToIdleState(): void;
    findAndTrackNextSelection(cell: ICellViewModel): Promise<void>;
    private constructCellEditorOptions;
    /**
     * Updates the multicursor selection decorations for a specific matched cell
     *
     * @param match -- match object containing the viewmodel + selections
     */
    private initializeMultiSelectDecorations;
    private updateLazyDecorations;
    private clearDecorations;
    private getWord;
    dispose(): void;
}
