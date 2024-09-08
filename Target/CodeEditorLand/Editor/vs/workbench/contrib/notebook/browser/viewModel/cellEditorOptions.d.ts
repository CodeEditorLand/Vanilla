import { type Event } from "../../../../../base/common/event.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import type { IEditorOptions } from "../../../../../editor/common/config/editorOptions.js";
import type { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import type { IBaseCellEditorOptions, INotebookEditorDelegate } from "../notebookBrowser.js";
import type { NotebookOptions } from "../notebookOptions.js";
export declare class BaseCellEditorOptions extends Disposable implements IBaseCellEditorOptions {
    readonly notebookEditor: INotebookEditorDelegate;
    readonly notebookOptions: NotebookOptions;
    readonly configurationService: IConfigurationService;
    readonly language: string;
    private static fixedEditorOptions;
    private readonly _localDisposableStore;
    private readonly _onDidChange;
    readonly onDidChange: Event<void>;
    private _value;
    get value(): Readonly<IEditorOptions>;
    constructor(notebookEditor: INotebookEditorDelegate, notebookOptions: NotebookOptions, configurationService: IConfigurationService, language: string);
    private _recomputeOptions;
    private _computeEditorOptions;
}
