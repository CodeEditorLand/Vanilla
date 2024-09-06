import { CancellationToken } from "vs/base/common/cancellation";
import { IMarkdownString } from "vs/base/common/htmlContent";
import { URI } from "vs/base/common/uri";
import { ICodeEditor } from "vs/editor/browser/editorBrowser";
import { IEditorOptions as ICodeEditorOptions } from "vs/editor/common/config/editorOptions";
import { Selection } from "vs/editor/common/core/selection";
import { IEditorViewState } from "vs/editor/common/editorCommon";
import { ITextResourceConfigurationChangeEvent, ITextResourceConfigurationService } from "vs/editor/common/services/textResourceConfiguration";
import { IEditorOptions, ITextEditorOptions } from "vs/platform/editor/common/editor";
import { IFileService } from "vs/platform/files/common/files";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IStorageService } from "vs/platform/storage/common/storage";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
import { IThemeService } from "vs/platform/theme/common/themeService";
import { AbstractEditorWithViewState } from "vs/workbench/browser/parts/editor/editorWithViewState";
import { EditorPaneSelectionCompareResult, IEditorOpenContext, IEditorPaneScrollPosition, IEditorPaneSelection, IEditorPaneWithScrolling, IEditorPaneWithSelection } from "vs/workbench/common/editor";
import { EditorInput } from "vs/workbench/common/editor/editorInput";
import { IEditorGroup, IEditorGroupsService } from "vs/workbench/services/editor/common/editorGroupsService";
import { IEditorService } from "vs/workbench/services/editor/common/editorService";
export interface IEditorConfiguration {
    editor: object;
    diffEditor: object;
    accessibility?: {
        verbosity?: {
            diffEditor?: boolean;
        };
    };
    problems?: {
        visibility?: boolean;
    };
}
/**
 * The base class of editors that leverage any kind of text editor for the editing experience.
 */
export declare abstract class AbstractTextEditor<T extends IEditorViewState> extends AbstractEditorWithViewState<T> implements IEditorPaneWithSelection, IEditorPaneWithScrolling {
    protected readonly fileService: IFileService;
    private static readonly VIEW_STATE_PREFERENCE_KEY;
    protected readonly _onDidChangeSelection: any;
    readonly onDidChangeSelection: any;
    protected readonly _onDidChangeScroll: any;
    readonly onDidChangeScroll: any;
    private editorContainer;
    private hasPendingConfigurationChange;
    private lastAppliedEditorOptions?;
    private readonly inputListener;
    constructor(id: string, group: IEditorGroup, telemetryService: ITelemetryService, instantiationService: IInstantiationService, storageService: IStorageService, textResourceConfigurationService: ITextResourceConfigurationService, themeService: IThemeService, editorService: IEditorService, editorGroupService: IEditorGroupsService, fileService: IFileService);
    private handleConfigurationChangeEvent;
    protected shouldHandleConfigurationChangeEvent(e: ITextResourceConfigurationChangeEvent, resource: URI | undefined): boolean;
    private consumePendingConfigurationChangeEvent;
    protected computeConfiguration(configuration: IEditorConfiguration): ICodeEditorOptions;
    protected computeAriaLabel(): string;
    private onDidChangeFileSystemProvider;
    private onDidChangeInputCapabilities;
    protected updateReadonly(input: EditorInput): void;
    protected getReadonlyConfiguration(isReadonly: boolean | IMarkdownString | undefined): {
        readOnly: boolean;
        readOnlyMessage: IMarkdownString | undefined;
    };
    protected getConfigurationOverrides(configuration: IEditorConfiguration): ICodeEditorOptions;
    protected createEditor(parent: HTMLElement): void;
    private registerCodeEditorListeners;
    private toEditorPaneSelectionChangeReason;
    getSelection(): IEditorPaneSelection | undefined;
    /**
     * This method creates and returns the text editor control to be used.
     * Subclasses must override to provide their own editor control that
     * should be used (e.g. a text diff editor).
     *
     * The passed in configuration object should be passed to the editor
     * control when creating it.
     */
    protected abstract createEditorControl(parent: HTMLElement, initialOptions: ICodeEditorOptions): void;
    /**
     * The method asks to update the editor control options and is called
     * whenever there is change to the options.
     */
    protected abstract updateEditorControlOptions(options: ICodeEditorOptions): void;
    /**
     * This method returns the main, dominant instance of `ICodeEditor`
     * for the editor pane. E.g. for a diff editor, this is the right
     * hand (modified) side.
     */
    protected abstract getMainControl(): ICodeEditor | undefined;
    setInput(input: EditorInput, options: ITextEditorOptions | undefined, context: IEditorOpenContext, token: CancellationToken): Promise<void>;
    clearInput(): void;
    getScrollPosition(): IEditorPaneScrollPosition;
    setScrollPosition(scrollPosition: IEditorPaneScrollPosition): void;
    protected setEditorVisible(visible: boolean): void;
    protected toEditorViewStateResource(input: EditorInput): URI | undefined;
    private updateEditorConfiguration;
    private getActiveResource;
    dispose(): void;
}
export declare class TextEditorPaneSelection implements IEditorPaneSelection {
    private readonly textSelection;
    private static readonly TEXT_EDITOR_SELECTION_THRESHOLD;
    constructor(textSelection: Selection);
    compare(other: IEditorPaneSelection): EditorPaneSelectionCompareResult;
    restore(options: IEditorOptions): ITextEditorOptions;
    log(): string;
}
