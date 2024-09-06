import { CancellationToken } from "vs/base/common/cancellation";
import { IEditorOptions as ICodeEditorOptions } from "vs/editor/common/config/editorOptions";
import { ICodeEditorViewState } from "vs/editor/common/editorCommon";
import { ITextResourceConfigurationService } from "vs/editor/common/services/textResourceConfiguration";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { ITextEditorOptions } from "vs/platform/editor/common/editor";
import { IFileService } from "vs/platform/files/common/files";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IStorageService } from "vs/platform/storage/common/storage";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
import { IThemeService } from "vs/platform/theme/common/themeService";
import { IUriIdentityService } from "vs/platform/uriIdentity/common/uriIdentity";
import { IWorkspaceContextService } from "vs/platform/workspace/common/workspace";
import { AbstractTextCodeEditor } from "vs/workbench/browser/parts/editor/textCodeEditor";
import { IEditorOpenContext, IFileEditorInputOptions } from "vs/workbench/common/editor";
import { EditorInput } from "vs/workbench/common/editor/editorInput";
import { FileEditorInput } from "vs/workbench/contrib/files/browser/editors/fileEditorInput";
import { IExplorerService } from "vs/workbench/contrib/files/browser/files";
import { IEditorGroup, IEditorGroupsService } from "vs/workbench/services/editor/common/editorGroupsService";
import { IEditorService } from "vs/workbench/services/editor/common/editorService";
import { IFilesConfigurationService } from "vs/workbench/services/filesConfiguration/common/filesConfigurationService";
import { IHostService } from "vs/workbench/services/host/browser/host";
import { IPaneCompositePartService } from "vs/workbench/services/panecomposite/browser/panecomposite";
import { IPathService } from "vs/workbench/services/path/common/pathService";
import { IPreferencesService } from "vs/workbench/services/preferences/common/preferences";
import { ITextFileService } from "vs/workbench/services/textfile/common/textfiles";
/**
 * An implementation of editor for file system resources.
 */
export declare class TextFileEditor extends AbstractTextCodeEditor<ICodeEditorViewState> {
    private readonly paneCompositeService;
    private readonly contextService;
    private readonly textFileService;
    private readonly explorerService;
    private readonly uriIdentityService;
    private readonly pathService;
    private readonly configurationService;
    protected readonly preferencesService: IPreferencesService;
    private readonly hostService;
    private readonly filesConfigurationService;
    static readonly ID: any;
    constructor(group: IEditorGroup, telemetryService: ITelemetryService, fileService: IFileService, paneCompositeService: IPaneCompositePartService, instantiationService: IInstantiationService, contextService: IWorkspaceContextService, storageService: IStorageService, textResourceConfigurationService: ITextResourceConfigurationService, editorService: IEditorService, themeService: IThemeService, editorGroupService: IEditorGroupsService, textFileService: ITextFileService, explorerService: IExplorerService, uriIdentityService: IUriIdentityService, pathService: IPathService, configurationService: IConfigurationService, preferencesService: IPreferencesService, hostService: IHostService, filesConfigurationService: IFilesConfigurationService);
    private onDidFilesChange;
    private onDidRunOperation;
    getTitle(): string;
    get input(): FileEditorInput | undefined;
    setInput(input: FileEditorInput, options: IFileEditorInputOptions | undefined, context: IEditorOpenContext, token: CancellationToken): Promise<void>;
    protected handleSetInputError(error: Error, input: FileEditorInput, options: ITextEditorOptions | undefined): Promise<void>;
    private openAsBinary;
    private doOpenAsBinaryInDifferentEditor;
    private doOpenAsBinaryInSameEditor;
    clearInput(): void;
    protected createEditorControl(parent: HTMLElement, initialOptions: ICodeEditorOptions): void;
    protected tracksEditorViewState(input: EditorInput): boolean;
    protected tracksDisposedEditorViewState(): boolean;
}
