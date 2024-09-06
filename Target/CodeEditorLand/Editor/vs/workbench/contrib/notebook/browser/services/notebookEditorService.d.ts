import { Dimension } from "vs/base/browser/dom";
import { CodeWindow } from "vs/base/browser/window";
import { Event } from "vs/base/common/event";
import { URI } from "vs/base/common/uri";
import { ServicesAccessor } from "vs/platform/instantiation/common/instantiation";
import { INotebookEditor, INotebookEditorCreationOptions } from "vs/workbench/contrib/notebook/browser/notebookBrowser";
import { NotebookEditorWidget } from "vs/workbench/contrib/notebook/browser/notebookEditorWidget";
import { NotebookEditorInput } from "vs/workbench/contrib/notebook/common/notebookEditorInput";
export declare const INotebookEditorService: any;
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
