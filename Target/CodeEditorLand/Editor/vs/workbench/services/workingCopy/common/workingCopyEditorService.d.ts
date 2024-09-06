import { Event } from "vs/base/common/event";
import { Disposable, IDisposable } from "vs/base/common/lifecycle";
import { IEditorIdentifier } from "vs/workbench/common/editor";
import { EditorInput } from "vs/workbench/common/editor/editorInput";
import { IEditorService } from "vs/workbench/services/editor/common/editorService";
import { IWorkingCopy, IWorkingCopyIdentifier } from "vs/workbench/services/workingCopy/common/workingCopy";
export declare const IWorkingCopyEditorService: any;
export interface IWorkingCopyEditorHandler {
    /**
     * Whether the handler is capable of opening the specific backup in
     * an editor.
     */
    handles(workingCopy: IWorkingCopyIdentifier): boolean | Promise<boolean>;
    /**
     * Whether the provided working copy is opened in the provided editor.
     */
    isOpen(workingCopy: IWorkingCopyIdentifier, editor: EditorInput): boolean;
    /**
     * Create an editor that is suitable of opening the provided working copy.
     */
    createEditor(workingCopy: IWorkingCopyIdentifier): EditorInput | Promise<EditorInput>;
}
export interface IWorkingCopyEditorService {
    readonly _serviceBrand: undefined;
    /**
     * An event fired whenever a handler is registered.
     */
    readonly onDidRegisterHandler: Event<IWorkingCopyEditorHandler>;
    /**
     * Register a handler to the working copy editor service.
     */
    registerHandler(handler: IWorkingCopyEditorHandler): IDisposable;
    /**
     * Finds the first editor that can handle the provided working copy.
     */
    findEditor(workingCopy: IWorkingCopy): IEditorIdentifier | undefined;
}
export declare class WorkingCopyEditorService extends Disposable implements IWorkingCopyEditorService {
    private readonly editorService;
    readonly _serviceBrand: undefined;
    private readonly _onDidRegisterHandler;
    readonly onDidRegisterHandler: any;
    private readonly handlers;
    constructor(editorService: IEditorService);
    registerHandler(handler: IWorkingCopyEditorHandler): IDisposable;
    findEditor(workingCopy: IWorkingCopy): IEditorIdentifier | undefined;
    private isOpen;
}
