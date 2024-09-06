import { Event } from "vs/base/common/event";
import { URI } from "vs/base/common/uri";
import { ResourceEdit, ResourceFileEdit, ResourceTextEdit } from "vs/editor/browser/services/bulkEditService";
import { ISingleEditOperation } from "vs/editor/common/core/editOperation";
import { WorkspaceEditMetadata } from "vs/editor/common/languages";
import { ILanguageService } from "vs/editor/common/languages/language";
import { IModelService } from "vs/editor/common/services/model";
import { ITextModelContentProvider, ITextModelService } from "vs/editor/common/services/resolverService";
import { IFileService } from "vs/platform/files/common/files";
import { IInstantiationService, ServicesAccessor } from "vs/platform/instantiation/common/instantiation";
import { ConflictDetector } from "vs/workbench/contrib/bulkEdit/browser/conflicts";
export declare class CheckedStates<T extends object> {
    private readonly _states;
    private _checkedCount;
    private readonly _onDidChange;
    readonly onDidChange: Event<T>;
    dispose(): void;
    get checkedCount(): number;
    isChecked(obj: T): boolean;
    updateChecked(obj: T, value: boolean): void;
}
export declare class BulkTextEdit {
    readonly parent: BulkFileOperation;
    readonly textEdit: ResourceTextEdit;
    constructor(parent: BulkFileOperation, textEdit: ResourceTextEdit);
}
export declare const enum BulkFileOperationType {
    TextEdit = 1,
    Create = 2,
    Delete = 4,
    Rename = 8
}
export declare class BulkFileOperation {
    readonly uri: URI;
    readonly parent: BulkFileOperations;
    type: number;
    textEdits: BulkTextEdit[];
    originalEdits: Map<number, any>;
    newUri?: URI;
    constructor(uri: URI, parent: BulkFileOperations);
    addEdit(index: number, type: BulkFileOperationType, edit: ResourceTextEdit | ResourceFileEdit): void;
    needsConfirmation(): boolean;
}
export declare class BulkCategory {
    readonly metadata: WorkspaceEditMetadata;
    private static readonly _defaultMetadata;
    static keyOf(metadata?: WorkspaceEditMetadata): any;
    readonly operationByResource: Map<string, BulkFileOperation>;
    constructor(metadata?: WorkspaceEditMetadata);
    get fileOperations(): IterableIterator<BulkFileOperation>;
}
export declare class BulkFileOperations {
    private readonly _bulkEdit;
    private readonly _fileService;
    static create(accessor: ServicesAccessor, bulkEdit: ResourceEdit[]): Promise<BulkFileOperations>;
    readonly checked: CheckedStates<ResourceEdit>;
    readonly fileOperations: BulkFileOperation[];
    readonly categories: BulkCategory[];
    readonly conflicts: ConflictDetector;
    constructor(_bulkEdit: ResourceEdit[], _fileService: IFileService, instaService: IInstantiationService);
    dispose(): void;
    _init(): Promise<this>;
    getWorkspaceEdit(): ResourceEdit[];
    getFileEdits(uri: URI): ISingleEditOperation[];
    getUriOfEdit(edit: ResourceEdit): URI;
}
export declare class BulkEditPreviewProvider implements ITextModelContentProvider {
    private readonly _operations;
    private readonly _languageService;
    private readonly _modelService;
    private readonly _textModelResolverService;
    private static readonly Schema;
    static emptyPreview: any;
    static fromPreviewUri(uri: URI): URI;
    private readonly _disposables;
    private readonly _ready;
    private readonly _modelPreviewEdits;
    private readonly _instanceId;
    constructor(_operations: BulkFileOperations, _languageService: ILanguageService, _modelService: IModelService, _textModelResolverService: ITextModelService);
    dispose(): void;
    asPreviewUri(uri: URI): URI;
    private _init;
    private _applyTextEditsToPreviewModel;
    private _getOrCreatePreviewModel;
    provideTextContent(previewUri: URI): Promise<any>;
}
