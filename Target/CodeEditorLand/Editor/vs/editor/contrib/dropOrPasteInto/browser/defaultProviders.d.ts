import { CancellationToken } from "vs/base/common/cancellation";
import { IReadonlyVSDataTransfer } from "vs/base/common/dataTransfer";
import { HierarchicalKind } from "vs/base/common/hierarchicalKind";
import { Disposable } from "vs/base/common/lifecycle";
import { IPosition } from "vs/editor/common/core/position";
import { IRange } from "vs/editor/common/core/range";
import { DocumentDropEditProvider, DocumentDropEditsSession, DocumentPasteContext, DocumentPasteEdit, DocumentPasteEditProvider, DocumentPasteEditsSession } from "vs/editor/common/languages";
import { ITextModel } from "vs/editor/common/model";
import { ILanguageFeaturesService } from "vs/editor/common/services/languageFeatures";
import { IWorkspaceContextService } from "vs/platform/workspace/common/workspace";
declare abstract class SimplePasteAndDropProvider implements DocumentDropEditProvider, DocumentPasteEditProvider {
    abstract readonly kind: HierarchicalKind;
    abstract readonly dropMimeTypes: readonly string[] | undefined;
    abstract readonly pasteMimeTypes: readonly string[];
    provideDocumentPasteEdits(_model: ITextModel, _ranges: readonly IRange[], dataTransfer: IReadonlyVSDataTransfer, context: DocumentPasteContext, token: CancellationToken): Promise<DocumentPasteEditsSession | undefined>;
    provideDocumentDropEdits(_model: ITextModel, _position: IPosition, dataTransfer: IReadonlyVSDataTransfer, token: CancellationToken): Promise<DocumentDropEditsSession | undefined>;
    protected abstract getEdit(dataTransfer: IReadonlyVSDataTransfer, token: CancellationToken): Promise<DocumentPasteEdit | undefined>;
}
export declare class DefaultTextPasteOrDropEditProvider extends SimplePasteAndDropProvider {
    static readonly id = "text";
    static readonly kind: any;
    readonly id = "text";
    readonly kind: any;
    readonly dropMimeTypes: any[];
    readonly pasteMimeTypes: any[];
    protected getEdit(dataTransfer: IReadonlyVSDataTransfer, _token: CancellationToken): Promise<DocumentPasteEdit | undefined>;
}
export declare class DefaultDropProvidersFeature extends Disposable {
    constructor(languageFeaturesService: ILanguageFeaturesService, workspaceContextService: IWorkspaceContextService);
}
export declare class DefaultPasteProvidersFeature extends Disposable {
    constructor(languageFeaturesService: ILanguageFeaturesService, workspaceContextService: IWorkspaceContextService);
}
export {};
