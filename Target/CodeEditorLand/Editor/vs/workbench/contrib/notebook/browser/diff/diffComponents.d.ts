import { Disposable, DisposableStore } from '../../../../../base/common/lifecycle.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { DiffElementCellViewModelBase, PropertyFoldingState, SideBySideDiffElementViewModel, SingleSideDiffElementViewModel, DiffElementPlaceholderViewModel } from './diffElementViewModel.js';
import { CellDiffSideBySideRenderTemplate, CellDiffSingleSideRenderTemplate, INotebookTextDiffEditor, CellDiffPlaceholderRenderTemplate, IDiffCellMarginOverlay } from './notebookDiffEditorBrowser.js';
import { CodeEditorWidget, ICodeEditorWidgetOptions } from '../../../../../editor/browser/widget/codeEditor/codeEditorWidget.js';
import { IModelService } from '../../../../../editor/common/services/model.js';
import { ILanguageService } from '../../../../../editor/common/languages/language.js';
import { ToolBar } from '../../../../../base/browser/ui/toolbar/toolbar.js';
import { IContextMenuService } from '../../../../../platform/contextview/browser/contextView.js';
import { IMenu, IMenuService, MenuId } from '../../../../../platform/actions/common/actions.js';
import { IKeybindingService } from '../../../../../platform/keybinding/common/keybinding.js';
import { INotificationService } from '../../../../../platform/notification/common/notification.js';
import { IContextKey, IContextKeyService } from '../../../../../platform/contextkey/common/contextkey.js';
import { OutputContainer } from './diffElementOutputs.js';
import { ITextModelService } from '../../../../../editor/common/services/resolverService.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { IThemeService } from '../../../../../platform/theme/common/themeService.js';
import { WorkbenchToolBar } from '../../../../../platform/actions/browser/toolbar.js';
import { ITelemetryService } from '../../../../../platform/telemetry/common/telemetry.js';
import { IAccessibilityService } from '../../../../../platform/accessibility/common/accessibility.js';
import { DiffEditorWidget } from '../../../../../editor/browser/widget/diffEditor/diffEditorWidget.js';
import { ICommandService } from '../../../../../platform/commands/common/commands.js';
import { DiffNestedCellViewModel } from './diffNestedCellViewModel.js';
import { ITextResourceConfigurationService } from '../../../../../editor/common/services/textResourceConfiguration.js';
export declare function getOptimizedNestedCodeEditorWidgetOptions(): ICodeEditorWidgetOptions;
export declare class CellDiffPlaceholderElement extends Disposable {
    constructor(placeholder: DiffElementPlaceholderViewModel, templateData: CellDiffPlaceholderRenderTemplate);
}
declare class PropertyHeader extends Disposable {
    readonly cell: DiffElementCellViewModelBase;
    readonly propertyHeaderContainer: HTMLElement;
    readonly notebookEditor: INotebookTextDiffEditor;
    readonly accessor: {
        updateInfoRendering: (renderOutput: boolean) => void;
        checkIfModified: (cell: DiffElementCellViewModelBase) => false | {
            reason: string | undefined;
        };
        getFoldingState: (cell: DiffElementCellViewModelBase) => PropertyFoldingState;
        updateFoldingState: (cell: DiffElementCellViewModelBase, newState: PropertyFoldingState) => void;
        unChangedLabel: string;
        changedLabel: string;
        prefix: string;
        menuId: MenuId;
    };
    private readonly contextMenuService;
    private readonly keybindingService;
    private readonly commandService;
    private readonly notificationService;
    private readonly menuService;
    private readonly contextKeyService;
    private readonly themeService;
    private readonly telemetryService;
    private readonly accessibilityService;
    protected _foldingIndicator: HTMLElement;
    protected _statusSpan: HTMLElement;
    protected _description: HTMLElement;
    protected _toolbar: WorkbenchToolBar;
    protected _menu: IMenu;
    protected _propertyExpanded?: IContextKey<boolean>;
    protected _propertyChanged?: IContextKey<boolean>;
    constructor(cell: DiffElementCellViewModelBase, propertyHeaderContainer: HTMLElement, notebookEditor: INotebookTextDiffEditor, accessor: {
        updateInfoRendering: (renderOutput: boolean) => void;
        checkIfModified: (cell: DiffElementCellViewModelBase) => false | {
            reason: string | undefined;
        };
        getFoldingState: (cell: DiffElementCellViewModelBase) => PropertyFoldingState;
        updateFoldingState: (cell: DiffElementCellViewModelBase, newState: PropertyFoldingState) => void;
        unChangedLabel: string;
        changedLabel: string;
        prefix: string;
        menuId: MenuId;
    }, contextMenuService: IContextMenuService, keybindingService: IKeybindingService, commandService: ICommandService, notificationService: INotificationService, menuService: IMenuService, contextKeyService: IContextKeyService, themeService: IThemeService, telemetryService: ITelemetryService, accessibilityService: IAccessibilityService);
    buildHeader(): void;
    refresh(): void;
    private updateMenu;
    private _updateFoldingIcon;
}
interface IDiffElementLayoutState {
    outerWidth?: boolean;
    editorHeight?: boolean;
    metadataEditor?: boolean;
    metadataHeight?: boolean;
    outputTotalHeight?: boolean;
}
declare abstract class AbstractElementRenderer extends Disposable {
    readonly notebookEditor: INotebookTextDiffEditor;
    readonly cell: DiffElementCellViewModelBase;
    readonly templateData: CellDiffSingleSideRenderTemplate | CellDiffSideBySideRenderTemplate;
    readonly style: 'left' | 'right' | 'full';
    protected readonly instantiationService: IInstantiationService;
    protected readonly languageService: ILanguageService;
    protected readonly modelService: IModelService;
    protected readonly textModelService: ITextModelService;
    protected readonly contextMenuService: IContextMenuService;
    protected readonly keybindingService: IKeybindingService;
    protected readonly notificationService: INotificationService;
    protected readonly menuService: IMenuService;
    protected readonly contextKeyService: IContextKeyService;
    protected readonly configurationService: IConfigurationService;
    protected readonly textConfigurationService: ITextResourceConfigurationService;
    protected readonly _metadataLocalDisposable: DisposableStore;
    protected readonly _outputLocalDisposable: DisposableStore;
    protected _ignoreMetadata: boolean;
    protected _ignoreOutputs: boolean;
    protected _cellHeaderContainer: HTMLElement;
    protected _editorContainer: HTMLElement;
    protected _cellHeader: PropertyHeader;
    protected _metadataHeaderContainer: HTMLElement;
    protected _metadataHeader: PropertyHeader;
    protected _metadataInfoContainer: HTMLElement;
    protected _metadataEditorContainer?: HTMLElement;
    protected readonly _metadataEditorDisposeStore: DisposableStore;
    protected _metadataEditor?: CodeEditorWidget | DiffEditorWidget;
    protected _outputHeaderContainer: HTMLElement;
    protected _outputHeader: PropertyHeader;
    protected _outputInfoContainer: HTMLElement;
    protected _outputEditorContainer?: HTMLElement;
    protected _outputViewContainer?: HTMLElement;
    protected _outputLeftContainer?: HTMLElement;
    protected _outputRightContainer?: HTMLElement;
    protected _outputMetadataContainer?: HTMLElement;
    protected _outputEmptyElement?: HTMLElement;
    protected _outputLeftView?: OutputContainer;
    protected _outputRightView?: OutputContainer;
    protected readonly _outputEditorDisposeStore: DisposableStore;
    protected _outputEditor?: CodeEditorWidget | DiffEditorWidget;
    protected _outputMetadataEditor?: DiffEditorWidget;
    protected _diffEditorContainer: HTMLElement;
    protected _diagonalFill?: HTMLElement;
    protected _isDisposed: boolean;
    constructor(notebookEditor: INotebookTextDiffEditor, cell: DiffElementCellViewModelBase, templateData: CellDiffSingleSideRenderTemplate | CellDiffSideBySideRenderTemplate, style: 'left' | 'right' | 'full', instantiationService: IInstantiationService, languageService: ILanguageService, modelService: IModelService, textModelService: ITextModelService, contextMenuService: IContextMenuService, keybindingService: IKeybindingService, notificationService: INotificationService, menuService: IMenuService, contextKeyService: IContextKeyService, configurationService: IConfigurationService, textConfigurationService: ITextResourceConfigurationService);
    abstract init(): void;
    abstract styleContainer(container: HTMLElement): void;
    abstract _buildOutput(): void;
    abstract _disposeOutput(): void;
    abstract _buildMetadata(): void;
    abstract _disposeMetadata(): void;
    buildBody(): void;
    updateMetadataRendering(): void;
    updateOutputRendering(renderRichOutput: boolean): void;
    private _buildOutputRawContainer;
    private _showOutputsRaw;
    private _showOutputsEmptyView;
    protected _hideOutputsRaw(): void;
    protected _hideOutputsEmptyView(): void;
    abstract _buildOutputRendererContainer(): void;
    abstract _hideOutputsRenderer(): void;
    abstract _showOutputsRenderer(): void;
    private _applySanitizedMetadataChanges;
    private _buildMetadataEditor;
    private _buildOutputEditor;
    protected layoutNotebookCell(): void;
    updateBorders(): void;
    dispose(): void;
    abstract updateSourceEditor(): void;
    abstract layout(state: IDiffElementLayoutState): void;
}
declare abstract class SingleSideDiffElement extends AbstractElementRenderer {
    protected _editor: CodeEditorWidget;
    readonly cell: SingleSideDiffElementViewModel;
    readonly templateData: CellDiffSingleSideRenderTemplate;
    abstract get nestedCellViewModel(): DiffNestedCellViewModel;
    abstract get readonly(): boolean;
    constructor(notebookEditor: INotebookTextDiffEditor, cell: SingleSideDiffElementViewModel, templateData: CellDiffSingleSideRenderTemplate, style: 'left' | 'right' | 'full', instantiationService: IInstantiationService, languageService: ILanguageService, modelService: IModelService, textModelService: ITextModelService, contextMenuService: IContextMenuService, keybindingService: IKeybindingService, notificationService: INotificationService, menuService: IMenuService, contextKeyService: IContextKeyService, configurationService: IConfigurationService, textConfigurationService: ITextResourceConfigurationService);
    init(): void;
    buildBody(): void;
    updateSourceEditor(): void;
    protected calculateDiagonalFillHeight(): number;
    private _initializeSourceDiffEditor;
    _disposeMetadata(): void;
    _buildMetadata(): void;
    _buildOutput(): void;
    _disposeOutput(): void;
}
export declare class DeletedElement extends SingleSideDiffElement {
    constructor(notebookEditor: INotebookTextDiffEditor, cell: SingleSideDiffElementViewModel, templateData: CellDiffSingleSideRenderTemplate, languageService: ILanguageService, modelService: IModelService, textModelService: ITextModelService, instantiationService: IInstantiationService, contextMenuService: IContextMenuService, keybindingService: IKeybindingService, notificationService: INotificationService, menuService: IMenuService, contextKeyService: IContextKeyService, configurationService: IConfigurationService, textConfigurationService: ITextResourceConfigurationService);
    get nestedCellViewModel(): DiffNestedCellViewModel;
    get readonly(): boolean;
    styleContainer(container: HTMLElement): void;
    layout(state: IDiffElementLayoutState): void;
    _buildOutputRendererContainer(): void;
    _decorate(): void;
    _showOutputsRenderer(): void;
    _hideOutputsRenderer(): void;
    dispose(): void;
}
export declare class InsertElement extends SingleSideDiffElement {
    constructor(notebookEditor: INotebookTextDiffEditor, cell: SingleSideDiffElementViewModel, templateData: CellDiffSingleSideRenderTemplate, instantiationService: IInstantiationService, languageService: ILanguageService, modelService: IModelService, textModelService: ITextModelService, contextMenuService: IContextMenuService, keybindingService: IKeybindingService, notificationService: INotificationService, menuService: IMenuService, contextKeyService: IContextKeyService, configurationService: IConfigurationService, textConfigurationService: ITextResourceConfigurationService);
    get nestedCellViewModel(): DiffNestedCellViewModel;
    get readonly(): boolean;
    styleContainer(container: HTMLElement): void;
    _buildOutputRendererContainer(): void;
    _decorate(): void;
    _showOutputsRenderer(): void;
    _hideOutputsRenderer(): void;
    layout(state: IDiffElementLayoutState): void;
    dispose(): void;
}
export declare class ModifiedElement extends AbstractElementRenderer {
    private _editor?;
    private _editorViewStateChanged;
    protected _toolbar: ToolBar;
    protected _menu: IMenu;
    readonly cell: SideBySideDiffElementViewModel;
    readonly templateData: CellDiffSideBySideRenderTemplate;
    constructor(notebookEditor: INotebookTextDiffEditor, cell: SideBySideDiffElementViewModel, templateData: CellDiffSideBySideRenderTemplate, instantiationService: IInstantiationService, languageService: ILanguageService, modelService: IModelService, textModelService: ITextModelService, contextMenuService: IContextMenuService, keybindingService: IKeybindingService, notificationService: INotificationService, menuService: IMenuService, contextKeyService: IContextKeyService, configurationService: IConfigurationService, textConfigurationService: ITextResourceConfigurationService);
    init(): void;
    styleContainer(container: HTMLElement): void;
    buildBody(): void;
    _disposeMetadata(): void;
    _buildMetadata(): void;
    _disposeOutput(): void;
    _buildOutput(): void;
    _buildOutputRendererContainer(): void;
    _decorate(): void;
    _showOutputsRenderer(): void;
    _hideOutputsRenderer(): void;
    updateSourceEditor(): void;
    private _initializeSourceDiffEditor;
    private updateEditorOptionsForWhitespace;
    layout(state: IDiffElementLayoutState): void;
    dispose(): void;
}
export declare class CollapsedCellOverlayWidget extends Disposable implements IDiffCellMarginOverlay {
    private readonly container;
    private readonly _nodes;
    private readonly _action;
    readonly onAction: import("../../../../../base/common/event.js").Event<void>;
    constructor(container: HTMLElement);
    show(): void;
    hide(): void;
    dispose(): void;
}
export declare class UnchangedCellOverlayWidget extends Disposable implements IDiffCellMarginOverlay {
    private readonly container;
    private readonly _nodes;
    private readonly _action;
    readonly onAction: import("../../../../../base/common/event.js").Event<void>;
    constructor(container: HTMLElement);
    show(): void;
    hide(): void;
    dispose(): void;
}
export {};
