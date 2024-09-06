import { Dimension } from "../../../../../base/browser/dom.js";
import { CodeWindow } from "../../../../../base/browser/window.js";
import { Event } from "../../../../../base/common/event.js";
import { URI } from "../../../../../base/common/uri.js";
import { ServicesAccessor } from "../../../../../platform/instantiation/common/instantiation.js";
import { NotebookEditorInput } from "../../common/notebookEditorInput.js";
import { INotebookEditor, INotebookEditorCreationOptions } from "../notebookBrowser.js";
import { NotebookEditorWidget } from "../notebookEditorWidget.js";
export declare const INotebookEditorService: import("../../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<INotebookEditorService>;
export interface IBorrowValue<T> {
    readonly value: T | undefined;
}
export interface INotebookEditorService {
    _serviceBrand: undefined;
    retrieveWidget(accessor: ServicesAccessor, groupId: number, input: NotebookEditorInput, creationOptions?: INotebookEditorCreationOptions, dimension?: Dimension, codeWindow?: CodeWindow): IBorrowValue<INotebookEditor>;
    retrieveExistingWidgetFromURI(resource: URI): IBorrowValue<NotebookEditorWidget> | undefined;
    retrieveAllExistingWidgets(): IBorrowValue<NotebookEditorWidget>[];
    onDidAddNotebookEditor: Event<INotebookEditor>;
    onDidRemoveNotebookEditor: Event<INotebookEditor>;
    addNotebookEditor(editor: INotebookEditor): void;
    removeNotebookEditor(editor: INotebookEditor): void;
    getNotebookEditor(editorId: string): INotebookEditor | undefined;
    listNotebookEditors(): readonly INotebookEditor[];
}
