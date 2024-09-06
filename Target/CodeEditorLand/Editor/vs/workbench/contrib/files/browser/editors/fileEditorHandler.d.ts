import { Disposable } from "vs/base/common/lifecycle";
import { IFileService } from "vs/platform/files/common/files";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IWorkbenchContribution } from "vs/workbench/common/contributions";
import { IEditorSerializer } from "vs/workbench/common/editor";
import { EditorInput } from "vs/workbench/common/editor/editorInput";
import { FileEditorInput } from "vs/workbench/contrib/files/browser/editors/fileEditorInput";
import { ITextEditorService } from "vs/workbench/services/textfile/common/textEditorService";
import { IWorkingCopyIdentifier } from "vs/workbench/services/workingCopy/common/workingCopy";
import { IWorkingCopyEditorHandler, IWorkingCopyEditorService } from "vs/workbench/services/workingCopy/common/workingCopyEditorService";
export declare class FileEditorInputSerializer implements IEditorSerializer {
    canSerialize(editorInput: EditorInput): boolean;
    serialize(editorInput: EditorInput): string;
    deserialize(instantiationService: IInstantiationService, serializedEditorInput: string): FileEditorInput;
}
export declare class FileEditorWorkingCopyEditorHandler extends Disposable implements IWorkbenchContribution, IWorkingCopyEditorHandler {
    private readonly textEditorService;
    private readonly fileService;
    static readonly ID = "workbench.contrib.fileEditorWorkingCopyEditorHandler";
    constructor(workingCopyEditorService: IWorkingCopyEditorService, textEditorService: ITextEditorService, fileService: IFileService);
    handles(workingCopy: IWorkingCopyIdentifier): boolean | Promise<boolean>;
    private handlesSync;
    isOpen(workingCopy: IWorkingCopyIdentifier, editor: EditorInput): boolean;
    createEditor(workingCopy: IWorkingCopyIdentifier): EditorInput;
}
