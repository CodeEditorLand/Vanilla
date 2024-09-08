import type { CancellationToken } from "../../../../base/common/cancellation.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import type { IMarkdownString } from "../../../../base/common/htmlContent.js";
import type { URI } from "../../../../base/common/uri.js";
import type { ICodeEditor } from "../../../../editor/browser/editorBrowser.js";
import type { IEditorOptions as ICodeEditorOptions } from "../../../../editor/common/config/editorOptions.js";
import type { Selection } from "../../../../editor/common/core/selection.js";
import type { IEditorViewState } from "../../../../editor/common/editorCommon.js";
import { type ITextResourceConfigurationChangeEvent, ITextResourceConfigurationService } from "../../../../editor/common/services/textResourceConfiguration.js";
import { type IEditorOptions, type ITextEditorOptions } from "../../../../platform/editor/common/editor.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { EditorPaneSelectionCompareResult, type IEditorOpenContext, type IEditorPaneScrollPosition, type IEditorPaneSelection, type IEditorPaneSelectionChangeEvent, type IEditorPaneWithScrolling, type IEditorPaneWithSelection } from "../../../common/editor.js";
import type { EditorInput } from "../../../common/editor/editorInput.js";
import { type IEditorGroup, IEditorGroupsService } from "../../../services/editor/common/editorGroupsService.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { AbstractEditorWithViewState } from "./editorWithViewState.js";
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
    protected readonly _onDidChangeSelection: Emitter<IEditorPaneSelectionChangeEvent>;
    readonly onDidChangeSelection: Event<IEditorPaneSelectionChangeEvent>;
    protected readonly _onDidChangeScroll: Emitter<void>;
    readonly onDidChangeScroll: Event<void>;
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
