import { Disposable } from "../../../../base/common/lifecycle.js";
import type { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import type { IWorkbenchContribution } from "../../../common/contributions.js";
import type { IEditorSerializer } from "../../../common/editor.js";
import type { EditorInput } from "../../../common/editor/editorInput.js";
import { IWorkbenchEnvironmentService } from "../../environment/common/environmentService.js";
import { IFilesConfigurationService } from "../../filesConfiguration/common/filesConfigurationService.js";
import { IPathService } from "../../path/common/pathService.js";
import { ITextEditorService } from "../../textfile/common/textEditorService.js";
import { type IWorkingCopyIdentifier } from "../../workingCopy/common/workingCopy.js";
import { IWorkingCopyEditorService, type IWorkingCopyEditorHandler } from "../../workingCopy/common/workingCopyEditorService.js";
import { UntitledTextEditorInput } from "./untitledTextEditorInput.js";
import { IUntitledTextEditorService } from "./untitledTextEditorService.js";
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