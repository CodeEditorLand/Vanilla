import { Disposable } from "vs/base/common/lifecycle";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IWorkbenchContribution } from "vs/workbench/common/contributions";
import { IEditorSerializer } from "vs/workbench/common/editor";
import { EditorInput } from "vs/workbench/common/editor/editorInput";
import { IWorkbenchEnvironmentService } from "vs/workbench/services/environment/common/environmentService";
import { IFilesConfigurationService } from "vs/workbench/services/filesConfiguration/common/filesConfigurationService";
import { IPathService } from "vs/workbench/services/path/common/pathService";
import { ITextEditorService } from "vs/workbench/services/textfile/common/textEditorService";
import { UntitledTextEditorInput } from "vs/workbench/services/untitled/common/untitledTextEditorInput";
import { IUntitledTextEditorService } from "vs/workbench/services/untitled/common/untitledTextEditorService";
import { IWorkingCopyIdentifier } from "vs/workbench/services/workingCopy/common/workingCopy";
import { IWorkingCopyEditorHandler, IWorkingCopyEditorService } from "vs/workbench/services/workingCopy/common/workingCopyEditorService";
export declare class UntitledTextEditorInputSerializer implements IEditorSerializer {
    private readonly filesConfigurationService;
    private readonly environmentService;
    private readonly pathService;
    constructor(filesConfigurationService: IFilesConfigurationService, environmentService: IWorkbenchEnvironmentService, pathService: IPathService);
    canSerialize(editorInput: EditorInput): boolean;
    serialize(editorInput: EditorInput): string | undefined;
    deserialize(instantiationService: IInstantiationService, serializedEditorInput: string): UntitledTextEditorInput;
}
export declare class UntitledTextEditorWorkingCopyEditorHandler extends Disposable implements IWorkbenchContribution, IWorkingCopyEditorHandler {
    private readonly environmentService;
    private readonly pathService;
    private readonly textEditorService;
    private readonly untitledTextEditorService;
    static readonly ID = "workbench.contrib.untitledTextEditorWorkingCopyEditorHandler";
    constructor(workingCopyEditorService: IWorkingCopyEditorService, environmentService: IWorkbenchEnvironmentService, pathService: IPathService, textEditorService: ITextEditorService, untitledTextEditorService: IUntitledTextEditorService);
    handles(workingCopy: IWorkingCopyIdentifier): boolean;
    isOpen(workingCopy: IWorkingCopyIdentifier, editor: EditorInput): boolean;
    createEditor(workingCopy: IWorkingCopyIdentifier): EditorInput;
}
