import { ITextModelService } from "vs/editor/common/services/resolverService";
import { ITextResourceConfigurationService } from "vs/editor/common/services/textResourceConfiguration";
import { IFileService } from "vs/platform/files/common/files";
import { ILabelService } from "vs/platform/label/common/label";
import { IUntitledTextResourceEditorInput, IUntypedEditorInput, Verbosity } from "vs/workbench/common/editor";
import { EditorInput, IUntypedEditorOptions } from "vs/workbench/common/editor/editorInput";
import { AbstractTextResourceEditorInput } from "vs/workbench/common/editor/textResourceEditorInput";
import { ICustomEditorLabelService } from "vs/workbench/services/editor/common/customEditorLabelService";
import { IEditorService } from "vs/workbench/services/editor/common/editorService";
import { IWorkbenchEnvironmentService } from "vs/workbench/services/environment/common/environmentService";
import { IFilesConfigurationService } from "vs/workbench/services/filesConfiguration/common/filesConfigurationService";
import { IPathService } from "vs/workbench/services/path/common/pathService";
import { EncodingMode, IEncodingSupport, ILanguageSupport, ITextFileService } from "vs/workbench/services/textfile/common/textfiles";
import { IUntitledTextEditorModel } from "vs/workbench/services/untitled/common/untitledTextEditorModel";
/**
 * An editor input to be used for untitled text buffers.
 */
export declare class UntitledTextEditorInput extends AbstractTextResourceEditorInput implements IEncodingSupport, ILanguageSupport {
    protected model: IUntitledTextEditorModel;
    private readonly environmentService;
    private readonly pathService;
    private readonly textModelService;
    static readonly ID: string;
    get typeId(): string;
    get editorId(): string | undefined;
    private modelResolve;
    private readonly modelDisposables;
    private cachedUntitledTextEditorModelReference;
    constructor(model: IUntitledTextEditorModel, textFileService: ITextFileService, labelService: ILabelService, editorService: IEditorService, fileService: IFileService, environmentService: IWorkbenchEnvironmentService, pathService: IPathService, filesConfigurationService: IFilesConfigurationService, textModelService: ITextModelService, textResourceConfigurationService: ITextResourceConfigurationService, customEditorLabelService: ICustomEditorLabelService);
    private registerModelListeners;
    private onDidCreateUntitledModel;
    getName(): string;
    getDescription(verbosity?: any): string | undefined;
    getTitle(verbosity: Verbosity): string;
    isDirty(): boolean;
    getEncoding(): string | undefined;
    setEncoding(encoding: string, mode: EncodingMode): Promise<void>;
    get hasLanguageSetExplicitly(): any;
    get hasAssociatedFilePath(): any;
    setLanguageId(languageId: string, source?: string): void;
    getLanguageId(): string | undefined;
    resolve(): Promise<IUntitledTextEditorModel>;
    toUntyped(options?: IUntypedEditorOptions): IUntitledTextResourceEditorInput;
    matches(otherInput: EditorInput | IUntypedEditorInput): boolean;
    dispose(): void;
    private disposeModelReference;
}
