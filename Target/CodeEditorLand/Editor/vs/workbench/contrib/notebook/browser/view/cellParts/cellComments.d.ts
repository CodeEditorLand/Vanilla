import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IThemeService } from "vs/platform/theme/common/themeService";
import { ICommentService } from "vs/workbench/contrib/comments/browser/commentService";
import { ICellViewModel, INotebookEditorDelegate } from "vs/workbench/contrib/notebook/browser/notebookBrowser";
import { CellContentPart } from "vs/workbench/contrib/notebook/browser/view/cellPart";
export declare class CellComments extends CellContentPart {
    private readonly notebookEditor;
    private readonly container;
    private readonly contextKeyService;
    private readonly themeService;
    private readonly commentService;
    private readonly configurationService;
    private readonly instantiationService;
    private readonly _commentThreadWidget;
    private currentElement;
    private readonly _commentThreadDisposables;
    constructor(notebookEditor: INotebookEditorDelegate, container: HTMLElement, contextKeyService: IContextKeyService, themeService: IThemeService, commentService: ICommentService, configurationService: IConfigurationService, instantiationService: IInstantiationService);
    private initialize;
    private _createCommentTheadWidget;
    private _bindListeners;
    private _updateThread;
    private _calculateCommentThreadHeight;
    private _getCommentThreadForCell;
    private _applyTheme;
    didRenderCell(element: ICellViewModel): void;
    prepareLayout(): void;
    updateInternalLayoutNow(element: ICellViewModel): void;
}