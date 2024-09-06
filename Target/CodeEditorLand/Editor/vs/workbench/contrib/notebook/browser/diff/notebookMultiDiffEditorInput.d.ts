import { URI } from "vs/base/common/uri";
import { ITextModelService } from "vs/editor/common/services/resolverService";
import { ITextResourceConfigurationService } from "vs/editor/common/services/textResourceConfiguration";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { MultiDiffEditorInput } from "vs/workbench/contrib/multiDiffEditor/browser/multiDiffEditorInput";
import { IMultiDiffSourceResolverService, IResolvedMultiDiffSource, type IMultiDiffSourceResolver } from "vs/workbench/contrib/multiDiffEditor/browser/multiDiffSourceResolverService";
import { NotebookDiffViewModel } from "vs/workbench/contrib/notebook/browser/diff/notebookDiffViewModel";
import { NotebookDiffEditorInput } from "vs/workbench/contrib/notebook/common/notebookDiffEditorInput";
import { ITextFileService } from "vs/workbench/services/textfile/common/textfiles";
export declare const NotebookMultiDiffEditorScheme = "multi-cell-notebook-diff-editor";
export declare class NotebookMultiDiffEditorInput extends NotebookDiffEditorInput {
    static readonly ID: string;
    static create(instantiationService: IInstantiationService, resource: URI, name: string | undefined, description: string | undefined, originalResource: URI, viewType: string): any;
}
export declare class NotebookMultiDiffEditorWidgetInput extends MultiDiffEditorInput implements IMultiDiffSourceResolver {
    private readonly notebookDiffViewModel;
    static createInput(notebookDiffViewModel: NotebookDiffViewModel, instantiationService: IInstantiationService): NotebookMultiDiffEditorWidgetInput;
    constructor(multiDiffSource: URI, notebookDiffViewModel: NotebookDiffViewModel, _textModelService: ITextModelService, _textResourceConfigurationService: ITextResourceConfigurationService, _instantiationService: IInstantiationService, _multiDiffSourceResolverService: IMultiDiffSourceResolverService, _textFileService: ITextFileService);
    canHandleUri(uri: URI): boolean;
    resolveDiffSource(_: URI): Promise<IResolvedMultiDiffSource>;
}
