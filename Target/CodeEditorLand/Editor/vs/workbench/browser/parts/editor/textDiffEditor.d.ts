import { Dimension } from "vs/base/browser/dom";
import { IBoundarySashes } from "vs/base/browser/ui/sash/sash";
import { CancellationToken } from "vs/base/common/cancellation";
import { URI } from "vs/base/common/uri";
import { ICodeEditor, IDiffEditor } from "vs/editor/browser/editorBrowser";
import { IEditorOptions as ICodeEditorOptions, IDiffEditorOptions } from "vs/editor/common/config/editorOptions";
import { IDiffEditorModel, IDiffEditorViewState } from "vs/editor/common/editorCommon";
import { ITextResourceConfigurationChangeEvent, ITextResourceConfigurationService } from "vs/editor/common/services/textResourceConfiguration";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { ITextEditorOptions } from "vs/platform/editor/common/editor";
import { IFileService } from "vs/platform/files/common/files";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IStorageService } from "vs/platform/storage/common/storage";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
import { IThemeService } from "vs/platform/theme/common/themeService";
import { AbstractTextEditor, IEditorConfiguration } from "vs/workbench/browser/parts/editor/textEditor";
import { IEditorOpenContext, ITextDiffEditorPane } from "vs/workbench/common/editor";
import { DiffEditorInput } from "vs/workbench/common/editor/diffEditorInput";
import { EditorInput } from "vs/workbench/common/editor/editorInput";
import { IEditorGroup, IEditorGroupsService } from "vs/workbench/services/editor/common/editorGroupsService";
import { IEditorService } from "vs/workbench/services/editor/common/editorService";
import { IPreferencesService } from "vs/workbench/services/preferences/common/preferences";
/**
 * The text editor that leverages the diff text editor for the editing experience.
 */
export declare class TextDiffEditor extends AbstractTextEditor<IDiffEditorViewState> implements ITextDiffEditorPane {
    private readonly preferencesService;
    static readonly ID: any;
    private diffEditorControl;
    private inputLifecycleStopWatch;
    get scopedContextKeyService(): IContextKeyService | undefined;
    constructor(group: IEditorGroup, telemetryService: ITelemetryService, instantiationService: IInstantiationService, storageService: IStorageService, configurationService: ITextResourceConfigurationService, editorService: IEditorService, themeService: IThemeService, editorGroupService: IEditorGroupsService, fileService: IFileService, preferencesService: IPreferencesService);
    getTitle(): string;
    protected createEditorControl(parent: HTMLElement, configuration: ICodeEditorOptions): void;
    protected updateEditorControlOptions(options: ICodeEditorOptions): void;
    protected getMainControl(): ICodeEditor | undefined;
    private _previousViewModel;
    setInput(input: DiffEditorInput, options: ITextEditorOptions | undefined, context: IEditorOpenContext, token: CancellationToken): Promise<void>;
    private handleSetInputError;
    private restoreTextDiffEditorViewState;
    private openAsBinary;
    setOptions(options: ITextEditorOptions | undefined): void;
    protected shouldHandleConfigurationChangeEvent(e: ITextResourceConfigurationChangeEvent, resource: URI): boolean;
    protected computeConfiguration(configuration: IEditorConfiguration): ICodeEditorOptions;
    protected getConfigurationOverrides(configuration: IEditorConfiguration): IDiffEditorOptions;
    protected updateReadonly(input: EditorInput): void;
    private isFileBinaryError;
    clearInput(): void;
    private logInputLifecycleTelemetry;
    getControl(): IDiffEditor | undefined;
    focus(): void;
    hasFocus(): boolean;
    protected setEditorVisible(visible: boolean): void;
    layout(dimension: Dimension): void;
    setBoundarySashes(sashes: IBoundarySashes): void;
    protected tracksEditorViewState(input: EditorInput): boolean;
    protected computeEditorViewState(resource: URI): IDiffEditorViewState | undefined;
    protected toEditorViewStateResource(modelOrInput: IDiffEditorModel | EditorInput): URI | undefined;
}
