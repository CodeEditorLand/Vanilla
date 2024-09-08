import { type Dimension } from "../../../../base/browser/dom.js";
import type { IBoundarySashes } from "../../../../base/browser/ui/sash/sash.js";
import type { CancellationToken } from "../../../../base/common/cancellation.js";
import { URI } from "../../../../base/common/uri.js";
import type { ICodeEditor, IDiffEditor } from "../../../../editor/browser/editorBrowser.js";
import type { IEditorOptions as ICodeEditorOptions, IDiffEditorOptions } from "../../../../editor/common/config/editorOptions.js";
import { type IDiffEditorModel, type IDiffEditorViewState } from "../../../../editor/common/editorCommon.js";
import { type ITextResourceConfigurationChangeEvent, ITextResourceConfigurationService } from "../../../../editor/common/services/textResourceConfiguration.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { type ITextEditorOptions } from "../../../../platform/editor/common/editor.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { type IEditorOpenContext, type ITextDiffEditorPane } from "../../../common/editor.js";
import { DiffEditorInput } from "../../../common/editor/diffEditorInput.js";
import type { EditorInput } from "../../../common/editor/editorInput.js";
import { type IEditorGroup, IEditorGroupsService } from "../../../services/editor/common/editorGroupsService.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { IPreferencesService } from "../../../services/preferences/common/preferences.js";
import { AbstractTextEditor, type IEditorConfiguration } from "./textEditor.js";
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
