import { Disposable } from "vs/base/common/lifecycle";
import { ITextModelService } from "vs/editor/common/services/resolverService";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IScopedContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { ICellViewModel, INotebookEditorDelegate } from "vs/workbench/contrib/notebook/browser/notebookBrowser";
export declare class NotebookCellEditorPool extends Disposable {
    readonly notebookEditor: INotebookEditorDelegate;
    private readonly contextKeyServiceProvider;
    private readonly textModelService;
    private readonly _configurationService;
    private readonly _instantiationService;
    private readonly _focusedEditorDOM;
    private readonly _editorDisposable;
    private _editorContextKeyService;
    private _editor;
    private _focusEditorCancellablePromise;
    private _isInitialized;
    private _isDisposed;
    constructor(notebookEditor: INotebookEditorDelegate, contextKeyServiceProvider: (container: HTMLElement) => IScopedContextKeyService, textModelService: ITextModelService, _configurationService: IConfigurationService, _instantiationService: IInstantiationService);
    private _initializeEditor;
    preserveFocusedEditor(cell: ICellViewModel): void;
    dispose(): void;
}
