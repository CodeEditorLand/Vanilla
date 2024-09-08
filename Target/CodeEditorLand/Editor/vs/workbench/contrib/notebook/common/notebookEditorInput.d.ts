import type { IMarkdownString } from "../../../../base/common/htmlContent.js";
import type { IReference } from "../../../../base/common/lifecycle.js";
import type { URI } from "../../../../base/common/uri.js";
import { ITextResourceConfigurationService } from "../../../../editor/common/services/textResourceConfiguration.js";
import { IFileDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import type { IResourceEditorInput } from "../../../../platform/editor/common/editor.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import type { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ILabelService } from "../../../../platform/label/common/label.js";
import { EditorInputCapabilities, Verbosity, type GroupIdentifier, type IFileLimitedEditorInputOptions, type IMoveResult, type IRevertOptions, type ISaveOptions, type IUntypedEditorInput } from "../../../common/editor.js";
import type { EditorInput } from "../../../common/editor/editorInput.js";
import { AbstractResourceEditorInput } from "../../../common/editor/resourceEditorInput.js";
import { ICustomEditorLabelService } from "../../../services/editor/common/customEditorLabelService.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { IExtensionService } from "../../../services/extensions/common/extensions.js";
import { IFilesConfigurationService } from "../../../services/filesConfiguration/common/filesConfigurationService.js";
import type { IWorkingCopyIdentifier } from "../../../services/workingCopy/common/workingCopy.js";
import { type IResolvedNotebookEditorModel } from "./notebookCommon.js";
import { INotebookEditorModelResolverService } from "./notebookEditorModelResolverService.js";
import type { NotebookPerfMarks } from "./notebookPerformance.js";
import { INotebookService } from "./notebookService.js";
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
    static getOrCreate(instantiationService: IInstantiationService, resource: URI, preferredResource: URI | undefined, viewType: string, options?: NotebookEditorInputOptions): NotebookEditorInput;
    static readonly ID: string;
    protected editorModelReference: IReference<IResolvedNotebookEditorModel> | null;
    private _sideLoadedListener;
    private _defaultDirtyState;
    constructor(resource: URI, preferredResource: URI | undefined, viewType: string, options: NotebookEditorInputOptions, _notebookService: INotebookService, _notebookModelResolverService: INotebookEditorModelResolverService, _fileDialogService: IFileDialogService, labelService: ILabelService, fileService: IFileService, filesConfigurationService: IFilesConfigurationService, extensionService: IExtensionService, editorService: IEditorService, textResourceConfigurationService: ITextResourceConfigurationService, customEditorLabelService: ICustomEditorLabelService);
    dispose(): void;
    get typeId(): string;
    get editorId(): string | undefined;
    get capabilities(): EditorInputCapabilities;
    getDescription(verbosity?: Verbosity): string | undefined;
    isReadonly(): boolean | IMarkdownString;
    isDirty(): boolean;
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
