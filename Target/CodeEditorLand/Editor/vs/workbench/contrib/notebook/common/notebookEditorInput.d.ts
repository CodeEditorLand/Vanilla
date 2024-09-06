import { IMarkdownString } from "vs/base/common/htmlContent";
import { IReference } from "vs/base/common/lifecycle";
import { URI } from "vs/base/common/uri";
import { ITextResourceConfigurationService } from "vs/editor/common/services/textResourceConfiguration";
import { IFileDialogService } from "vs/platform/dialogs/common/dialogs";
import { IResourceEditorInput } from "vs/platform/editor/common/editor";
import { IFileService } from "vs/platform/files/common/files";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { ILabelService } from "vs/platform/label/common/label";
import { EditorInputCapabilities, GroupIdentifier, IFileLimitedEditorInputOptions, IMoveResult, IRevertOptions, ISaveOptions, IUntypedEditorInput } from "vs/workbench/common/editor";
import { EditorInput } from "vs/workbench/common/editor/editorInput";
import { AbstractResourceEditorInput } from "vs/workbench/common/editor/resourceEditorInput";
import { IResolvedNotebookEditorModel } from "vs/workbench/contrib/notebook/common/notebookCommon";
import { INotebookEditorModelResolverService } from "vs/workbench/contrib/notebook/common/notebookEditorModelResolverService";
import { NotebookPerfMarks } from "vs/workbench/contrib/notebook/common/notebookPerformance";
import { INotebookService } from "vs/workbench/contrib/notebook/common/notebookService";
import { ICustomEditorLabelService } from "vs/workbench/services/editor/common/customEditorLabelService";
import { IEditorService } from "vs/workbench/services/editor/common/editorService";
import { IExtensionService } from "vs/workbench/services/extensions/common/extensions";
import { IFilesConfigurationService } from "vs/workbench/services/filesConfiguration/common/filesConfigurationService";
import { IWorkingCopyIdentifier } from "vs/workbench/services/workingCopy/common/workingCopy";
export interface NotebookEditorInputOptions {
    startDirty?: boolean;
    /**
     * backupId for webview
     */
    _backupId?: string;
    _workingCopy?: IWorkingCopyIdentifier;
}
export declare class NotebookEditorInput extends AbstractResourceEditorInput {
    readonly viewType: string;
    readonly options: NotebookEditorInputOptions;
    private readonly _notebookService;
    private readonly _notebookModelResolverService;
    private readonly _fileDialogService;
    static getOrCreate(instantiationService: IInstantiationService, resource: URI, preferredResource: URI | undefined, viewType: string, options?: NotebookEditorInputOptions): any;
    static readonly ID: string;
    protected editorModelReference: IReference<IResolvedNotebookEditorModel> | null;
    private _sideLoadedListener;
    private _defaultDirtyState;
    constructor(resource: URI, preferredResource: URI | undefined, viewType: string, options: NotebookEditorInputOptions, _notebookService: INotebookService, _notebookModelResolverService: INotebookEditorModelResolverService, _fileDialogService: IFileDialogService, labelService: ILabelService, fileService: IFileService, filesConfigurationService: IFilesConfigurationService, extensionService: IExtensionService, editorService: IEditorService, textResourceConfigurationService: ITextResourceConfigurationService, customEditorLabelService: ICustomEditorLabelService);
    dispose(): void;
    get typeId(): string;
    get editorId(): string | undefined;
    get capabilities(): EditorInputCapabilities;
    getDescription(verbosity?: any): string | undefined;
    isReadonly(): boolean | IMarkdownString;
    isDirty(): any;
    isSaving(): boolean;
    save(group: GroupIdentifier, options?: ISaveOptions): Promise<EditorInput | IUntypedEditorInput | undefined>;
    saveAs(group: GroupIdentifier, options?: ISaveOptions): Promise<IUntypedEditorInput | undefined>;
    private _suggestName;
    rename(group: GroupIdentifier, target: URI): Promise<IMoveResult | undefined>;
    revert(_group: GroupIdentifier, options?: IRevertOptions): Promise<void>;
    resolve(_options?: IFileLimitedEditorInputOptions, perf?: NotebookPerfMarks): Promise<IResolvedNotebookEditorModel | null>;
    toUntyped(): IResourceEditorInput;
    matches(otherInput: EditorInput | IUntypedEditorInput): boolean;
}
export interface ICompositeNotebookEditorInput {
    readonly editorInputs: NotebookEditorInput[];
}
export declare function isCompositeNotebookEditorInput(thing: unknown): thing is ICompositeNotebookEditorInput;
export declare function isNotebookEditorInput(thing: EditorInput | undefined): thing is NotebookEditorInput;
