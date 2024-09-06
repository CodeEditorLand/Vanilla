import { ICodeEditor, IDiffEditor } from '../../../../editor/browser/editorBrowser.js';
import { IDiffEditorOptions, IEditorOptions as ICodeEditorOptions } from '../../../../editor/common/config/editorOptions.js';
import { AbstractTextEditor, IEditorConfiguration } from './textEditor.js';
import { ITextDiffEditorPane, IEditorOpenContext } from '../../../common/editor.js';
import { EditorInput } from '../../../common/editor/editorInput.js';
import { DiffEditorInput } from '../../../common/editor/diffEditorInput.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { ITextResourceConfigurationChangeEvent, ITextResourceConfigurationService } from '../../../../editor/common/services/textResourceConfiguration.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { IDiffEditorViewState, IDiffEditorModel } from '../../../../editor/common/editorCommon.js';
import { URI } from '../../../../base/common/uri.js';
import { IEditorGroup, IEditorGroupsService } from '../../../services/editor/common/editorGroupsService.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { ITextEditorOptions } from '../../../../platform/editor/common/editor.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { Dimension } from '../../../../base/browser/dom.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IBoundarySashes } from '../../../../base/browser/ui/sash/sash.js';
import { IPreferencesService } from '../../../services/preferences/common/preferences.js';
/**
 * The text editor that leverages the diff text editor for the editing experience.
 */
export declare class TextDiffEditor extends AbstractTextEditor<IDiffEditorViewState> implements ITextDiffEditorPane {
    private readonly preferencesService;
    static readonly ID = "workbench.editors.textDiffEditor";
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
