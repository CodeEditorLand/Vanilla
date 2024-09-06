import { Disposable } from "vs/base/common/lifecycle";
import { ThemeIcon } from "vs/base/common/themables";
import { URI } from "vs/base/common/uri";
import { IDocumentDiffItem } from "vs/editor/browser/widget/multiDiffEditor/model";
import { MultiDiffEditorViewModel } from "vs/editor/browser/widget/multiDiffEditor/multiDiffEditorViewModel";
import { ITextModelService } from "vs/editor/common/services/resolverService";
import { ITextResourceConfigurationService } from "vs/editor/common/services/textResourceConfiguration";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { EditorInputCapabilities, GroupIdentifier, IEditorSerializer, IResourceMultiDiffEditorInput, IRevertOptions, ISaveOptions, IUntypedEditorInput } from "vs/workbench/common/editor";
import { EditorInput, IEditorCloseHandler } from "vs/workbench/common/editor/editorInput";
import { IMultiDiffSourceResolverService, MultiDiffEditorItem } from "vs/workbench/contrib/multiDiffEditor/browser/multiDiffSourceResolverService";
import { IEditorResolverService } from "vs/workbench/services/editor/common/editorResolverService";
import { ILanguageSupport, ITextFileService } from "vs/workbench/services/textfile/common/textfiles";
export declare class MultiDiffEditorInput extends EditorInput implements ILanguageSupport {
    readonly multiDiffSource: URI;
    readonly label: string | undefined;
    readonly initialResources: readonly MultiDiffEditorItem[] | undefined;
    readonly isTransient: boolean;
    private readonly _textModelService;
    private readonly _textResourceConfigurationService;
    private readonly _instantiationService;
    private readonly _multiDiffSourceResolverService;
    private readonly _textFileService;
    static fromResourceMultiDiffEditorInput(input: IResourceMultiDiffEditorInput, instantiationService: IInstantiationService): MultiDiffEditorInput;
    static fromSerialized(data: ISerializedMultiDiffEditorInput, instantiationService: IInstantiationService): MultiDiffEditorInput;
    static readonly ID: string;
    get resource(): URI | undefined;
    get capabilities(): EditorInputCapabilities;
    get typeId(): string;
    private _name;
    getName(): string;
    get editorId(): string;
    getIcon(): ThemeIcon;
    constructor(multiDiffSource: URI, label: string | undefined, initialResources: readonly MultiDiffEditorItem[] | undefined, isTransient: boolean, _textModelService: ITextModelService, _textResourceConfigurationService: ITextResourceConfigurationService, _instantiationService: IInstantiationService, _multiDiffSourceResolverService: IMultiDiffSourceResolverService, _textFileService: ITextFileService);
    serialize(): ISerializedMultiDiffEditorInput;
    setLanguageId(languageId: string, source?: string | undefined): void;
    getViewModel(): Promise<MultiDiffEditorViewModel>;
    private readonly _viewModel;
    private _createModel;
    private readonly _resolvedSource;
    matches(otherInput: EditorInput | IUntypedEditorInput): boolean;
    readonly resources: any;
    private readonly textFileServiceOnDidChange;
    private readonly _isDirtyObservables;
    private readonly _isDirtyObservable;
    readonly onDidChangeDirty: any;
    isDirty(): any;
    save(group: number, options?: ISaveOptions | undefined): Promise<EditorInput>;
    revert(group: GroupIdentifier, options?: IRevertOptions): Promise<void>;
    private doSaveOrRevert;
    readonly closeHandler: IEditorCloseHandler;
}
export interface IDocumentDiffItemWithMultiDiffEditorItem extends IDocumentDiffItem {
    multiDiffEditorItem: MultiDiffEditorItem;
}
export declare class MultiDiffEditorResolverContribution extends Disposable {
    static readonly ID = "workbench.contrib.multiDiffEditorResolver";
    constructor(editorResolverService: IEditorResolverService, instantiationService: IInstantiationService);
}
interface ISerializedMultiDiffEditorInput {
    multiDiffSourceUri: string;
    label: string | undefined;
    resources: {
        originalUri: string | undefined;
        modifiedUri: string | undefined;
        goToFileUri: string | undefined;
    }[] | undefined;
}
export declare class MultiDiffEditorSerializer implements IEditorSerializer {
    canSerialize(editor: EditorInput): editor is MultiDiffEditorInput;
    serialize(editor: MultiDiffEditorInput): string | undefined;
    deserialize(instantiationService: IInstantiationService, serializedEditor: string): EditorInput | undefined;
}
export {};
