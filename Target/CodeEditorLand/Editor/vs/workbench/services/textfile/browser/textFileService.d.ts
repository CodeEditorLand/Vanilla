import { VSBuffer, VSBufferReadable, VSBufferReadableStream } from "vs/base/common/buffer";
import { Disposable } from "vs/base/common/lifecycle";
import { ReadableStream } from "vs/base/common/stream";
import { URI } from "vs/base/common/uri";
import { ICodeEditorService } from "vs/editor/browser/services/codeEditorService";
import { ILanguageService } from "vs/editor/common/languages/language";
import { ITextSnapshot } from "vs/editor/common/model";
import { IModelService } from "vs/editor/common/services/model";
import { ITextResourceConfigurationService } from "vs/editor/common/services/textResourceConfiguration";
import { IDialogService, IFileDialogService } from "vs/platform/dialogs/common/dialogs";
import { ICreateFileOptions, IFileService, IFileStatWithMetadata } from "vs/platform/files/common/files";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { ILogService } from "vs/platform/log/common/log";
import { IUriIdentityService } from "vs/platform/uriIdentity/common/uriIdentity";
import { IWorkspaceContextService } from "vs/platform/workspace/common/workspace";
import { IRevertOptions } from "vs/workbench/common/editor";
import { IDecorationsService } from "vs/workbench/services/decorations/common/decorations";
import { IWorkbenchEnvironmentService } from "vs/workbench/services/environment/common/environmentService";
import { IElevatedFileService } from "vs/workbench/services/files/common/elevatedFileService";
import { IFilesConfigurationService } from "vs/workbench/services/filesConfiguration/common/filesConfigurationService";
import { ILifecycleService } from "vs/workbench/services/lifecycle/common/lifecycle";
import { IPathService } from "vs/workbench/services/path/common/pathService";
import { IReadTextFileEncodingOptions, IReadTextFileOptions, IResourceEncoding, IResourceEncodings, ITextFileContent, ITextFileEditorModelManager, ITextFileSaveAsOptions, ITextFileSaveOptions, ITextFileService, ITextFileStreamContent, IWriteTextFileOptions } from "vs/workbench/services/textfile/common/textfiles";
import { IUntitledTextEditorModelManager, IUntitledTextEditorService } from "vs/workbench/services/untitled/common/untitledTextEditorService";
import { IFileOperationUndoRedoInfo, IWorkingCopyFileService } from "vs/workbench/services/workingCopy/common/workingCopyFileService";
export declare abstract class AbstractTextFileService extends Disposable implements ITextFileService {
    protected readonly fileService: IFileService;
    private untitledTextEditorService;
    protected readonly lifecycleService: ILifecycleService;
    protected readonly instantiationService: IInstantiationService;
    private readonly modelService;
    protected readonly environmentService: IWorkbenchEnvironmentService;
    private readonly dialogService;
    private readonly fileDialogService;
    protected readonly textResourceConfigurationService: ITextResourceConfigurationService;
    protected readonly filesConfigurationService: IFilesConfigurationService;
    private readonly codeEditorService;
    private readonly pathService;
    private readonly workingCopyFileService;
    private readonly uriIdentityService;
    private readonly languageService;
    protected readonly logService: ILogService;
    private readonly elevatedFileService;
    private readonly decorationsService;
    readonly _serviceBrand: undefined;
    private static readonly TEXTFILE_SAVE_CREATE_SOURCE;
    private static readonly TEXTFILE_SAVE_REPLACE_SOURCE;
    readonly files: ITextFileEditorModelManager;
    readonly untitled: IUntitledTextEditorModelManager;
    constructor(fileService: IFileService, untitledTextEditorService: IUntitledTextEditorService, lifecycleService: ILifecycleService, instantiationService: IInstantiationService, modelService: IModelService, environmentService: IWorkbenchEnvironmentService, dialogService: IDialogService, fileDialogService: IFileDialogService, textResourceConfigurationService: ITextResourceConfigurationService, filesConfigurationService: IFilesConfigurationService, codeEditorService: ICodeEditorService, pathService: IPathService, workingCopyFileService: IWorkingCopyFileService, uriIdentityService: IUriIdentityService, languageService: ILanguageService, logService: ILogService, elevatedFileService: IElevatedFileService, decorationsService: IDecorationsService);
    private provideDecorations;
    private _encoding;
    get encoding(): EncodingOracle;
    read(resource: URI, options?: IReadTextFileOptions): Promise<ITextFileContent>;
    readStream(resource: URI, options?: IReadTextFileOptions): Promise<ITextFileStreamContent>;
    private doRead;
    create(operations: {
        resource: URI;
        value?: string | ITextSnapshot;
        options?: ICreateFileOptions;
    }[], undoInfo?: IFileOperationUndoRedoInfo): Promise<readonly IFileStatWithMetadata[]>;
    write(resource: URI, value: string | ITextSnapshot, options?: IWriteTextFileOptions): Promise<IFileStatWithMetadata>;
    getEncodedReadable(resource: URI, value: ITextSnapshot): Promise<VSBufferReadable>;
    getEncodedReadable(resource: URI, value: string): Promise<VSBuffer>;
    getEncodedReadable(resource: URI, value?: ITextSnapshot): Promise<VSBufferReadable | undefined>;
    getEncodedReadable(resource: URI, value?: string): Promise<VSBuffer | undefined>;
    getEncodedReadable(resource: URI, value?: string | ITextSnapshot): Promise<VSBuffer | VSBufferReadable | undefined>;
    getEncodedReadable(resource: URI, value: string | ITextSnapshot, options?: IWriteTextFileOptions): Promise<VSBuffer | VSBufferReadable>;
    getDecodedStream(resource: URI, value: VSBufferReadableStream, options?: IReadTextFileEncodingOptions): Promise<ReadableStream<string>>;
    private doGetDecodedStream;
    save(resource: URI, options?: ITextFileSaveOptions): Promise<URI | undefined>;
    saveAs(source: URI, target?: URI, options?: ITextFileSaveAsOptions): Promise<URI | undefined>;
    private doSaveAs;
    private doSaveAsTextFile;
    private confirmOverwrite;
    private confirmMakeWriteable;
    private suggestSavePath;
    suggestFilename(languageId: string, untitledName: string): any;
    revert(resource: URI, options?: IRevertOptions): Promise<void>;
    isDirty(resource: URI): boolean;
}
export interface IEncodingOverride {
    parent?: URI;
    extension?: string;
    encoding: string;
}
export declare class EncodingOracle extends Disposable implements IResourceEncodings {
    private textResourceConfigurationService;
    private environmentService;
    private contextService;
    private readonly uriIdentityService;
    private _encodingOverrides;
    protected get encodingOverrides(): IEncodingOverride[];
    protected set encodingOverrides(value: IEncodingOverride[]);
    constructor(textResourceConfigurationService: ITextResourceConfigurationService, environmentService: IWorkbenchEnvironmentService, contextService: IWorkspaceContextService, uriIdentityService: IUriIdentityService);
    private registerListeners;
    private getDefaultEncodingOverrides;
    getWriteEncoding(resource: URI, options?: IWriteTextFileOptions): Promise<{
        encoding: string;
        addBOM: boolean;
    }>;
    getPreferredWriteEncoding(resource: URI, preferredEncoding?: string): Promise<IResourceEncoding>;
    getPreferredReadEncoding(resource: URI, options?: IReadTextFileEncodingOptions, detectedEncoding?: string): Promise<IResourceEncoding>;
    private getEncodingForResource;
    private getEncodingOverride;
}
