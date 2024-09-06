import { IExpression } from "vs/base/common/glob";
import { Disposable } from "vs/base/common/lifecycle";
import { URI } from "vs/base/common/uri";
import { IEditorOptions } from "vs/editor/common/config/editorOptions";
import { ILanguageService } from "vs/editor/common/languages/language";
import { ITextModel } from "vs/editor/common/model";
import { IModelService } from "vs/editor/common/services/model";
import { ITextModelContentProvider } from "vs/editor/common/services/resolverService";
import { ITextEditorOptions } from "vs/platform/editor/common/editor";
import { IFileService, IFilesConfiguration as PlatformIFilesConfiguration } from "vs/platform/files/common/files";
import { IEditorIdentifier, IWorkbenchEditorConfiguration } from "vs/workbench/common/editor";
import { EditorInput } from "vs/workbench/common/editor/editorInput";
import { IEditorGroup } from "vs/workbench/services/editor/common/editorGroupsService";
import { IEditorService } from "vs/workbench/services/editor/common/editorService";
import { ITextFileService } from "vs/workbench/services/textfile/common/textfiles";
/**
 * Explorer viewlet id.
 */
export declare const VIEWLET_ID = "workbench.view.explorer";
/**
 * Explorer file view id.
 */
export declare const VIEW_ID = "workbench.explorer.fileView";
/**
 * Context Keys to use with keybindings for the Explorer and Open Editors view
 */
export declare const ExplorerViewletVisibleContext: any;
export declare const FoldersViewVisibleContext: any;
export declare const ExplorerFolderContext: any;
export declare const ExplorerResourceReadonlyContext: any;
export declare const ExplorerResourceNotReadonlyContext: any;
/**
 * Comma separated list of editor ids that can be used for the selected explorer resource.
 */
export declare const ExplorerResourceAvailableEditorIdsContext: any;
export declare const ExplorerRootContext: any;
export declare const ExplorerResourceCut: any;
export declare const ExplorerResourceMoveableToTrash: any;
export declare const FilesExplorerFocusedContext: any;
export declare const OpenEditorsFocusedContext: any;
export declare const ExplorerFocusedContext: any;
export declare const ExplorerCompressedFocusContext: any;
export declare const ExplorerCompressedFirstFocusContext: any;
export declare const ExplorerCompressedLastFocusContext: any;
export declare const ViewHasSomeCollapsibleRootItemContext: any;
export declare const FilesExplorerFocusCondition: any;
export declare const ExplorerFocusCondition: any;
/**
 * Text file editor id.
 */
export declare const TEXT_FILE_EDITOR_ID = "workbench.editors.files.textFileEditor";
/**
 * File editor input id.
 */
export declare const FILE_EDITOR_INPUT_ID = "workbench.editors.files.fileEditorInput";
/**
 * Binary file editor id.
 */
export declare const BINARY_FILE_EDITOR_ID = "workbench.editors.files.binaryFileEditor";
/**
 * Language identifier for binary files opened as text.
 */
export declare const BINARY_TEXT_FILE_MODE = "code-text-binary";
export interface IFilesConfiguration extends PlatformIFilesConfiguration, IWorkbenchEditorConfiguration {
    explorer: {
        openEditors: {
            visible: number;
            sortOrder: "editorOrder" | "alphabetical" | "fullPath";
        };
        autoReveal: boolean | "focusNoScroll";
        autoRevealExclude: IExpression;
        enableDragAndDrop: boolean;
        confirmDelete: boolean;
        enableUndo: boolean;
        confirmUndo: UndoConfirmLevel;
        expandSingleFolderWorkspaces: boolean;
        sortOrder: SortOrder;
        sortOrderLexicographicOptions: LexicographicOptions;
        sortOrderReverse: boolean;
        decorations: {
            colors: boolean;
            badges: boolean;
        };
        incrementalNaming: "simple" | "smart" | "disabled";
        excludeGitIgnore: boolean;
        fileNesting: {
            enabled: boolean;
            expand: boolean;
            patterns: {
                [parent: string]: string;
            };
        };
        autoOpenDroppedFile: boolean;
    };
    editor: IEditorOptions;
}
export interface IFileResource {
    resource: URI;
    isDirectory?: boolean;
}
export declare const enum SortOrder {
    Default = "default",
    Mixed = "mixed",
    FilesFirst = "filesFirst",
    Type = "type",
    Modified = "modified",
    FoldersNestsFiles = "foldersNestsFiles"
}
export declare const enum UndoConfirmLevel {
    Verbose = "verbose",
    Default = "default",
    Light = "light"
}
export declare const enum LexicographicOptions {
    Default = "default",
    Upper = "upper",
    Lower = "lower",
    Unicode = "unicode"
}
export interface ISortOrderConfiguration {
    sortOrder: SortOrder;
    lexicographicOptions: LexicographicOptions;
    reverse: boolean;
}
export declare class TextFileContentProvider extends Disposable implements ITextModelContentProvider {
    private readonly textFileService;
    private readonly fileService;
    private readonly languageService;
    private readonly modelService;
    private readonly fileWatcherDisposable;
    constructor(textFileService: ITextFileService, fileService: IFileService, languageService: ILanguageService, modelService: IModelService);
    static open(resource: URI, scheme: string, label: string, editorService: IEditorService, options?: ITextEditorOptions): Promise<void>;
    private static resourceToTextFile;
    private static textFileToResource;
    provideTextContent(resource: URI): Promise<ITextModel | null>;
    private resolveEditorModel;
}
export declare class OpenEditor implements IEditorIdentifier {
    private _editor;
    private _group;
    private id;
    private static COUNTER;
    constructor(_editor: EditorInput, _group: IEditorGroup);
    get editor(): EditorInput;
    get group(): IEditorGroup;
    get groupId(): any;
    getId(): string;
    isPreview(): boolean;
    isSticky(): boolean;
    getResource(): URI | undefined;
}
