import type * as DOM from "../../../../../base/browser/dom.js";
import { type CancellationToken } from "../../../../../base/common/cancellation.js";
import type { URI } from "../../../../../base/common/uri.js";
import type { IMultiDiffEditorOptions } from "../../../../../editor/browser/widget/multiDiffEditor/multiDiffEditorWidgetImpl.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { IStorageService } from "../../../../../platform/storage/common/storage.js";
import { ITelemetryService } from "../../../../../platform/telemetry/common/telemetry.js";
import { IThemeService } from "../../../../../platform/theme/common/themeService.js";
import { EditorPane } from "../../../../browser/parts/editor/editorPane.js";
import type { IEditorOpenContext } from "../../../../common/editor.js";
import type { IEditorGroup } from "../../../../services/editor/common/editorGroupsService.js";
import { INotebookService } from "../../common/notebookService.js";
import { INotebookEditorWorkerService } from "../../common/services/notebookWorkerService.js";
import { NotebookOptions } from "../notebookOptions.js";
import type { IDiffElementViewModelBase } from "./diffElementViewModel.js";
import { type NotebookMultiDiffEditorInput } from "./notebookMultiDiffEditorInput.js";
export declare class NotebookMultiTextDiffEditor extends EditorPane {
    private readonly instantiationService;
    private readonly _parentContextKeyService;
    private readonly notebookEditorWorkerService;
    private readonly configurationService;
    private readonly notebookService;
    private _multiDiffEditorWidget?;
    static readonly ID: string;
    private _fontInfo;
    protected _scopeContextKeyService: IContextKeyService;
    private readonly modelSpecificResources;
    private _model?;
    private viewModel?;
    private widgetViewModel?;
    get textModel(): import("../../common/model/notebookTextModel.js").NotebookTextModel | undefined;
    private _notebookOptions;
    get notebookOptions(): NotebookOptions;
    private readonly ctxAllCollapsed;
    private readonly ctxHasUnchangedCells;
    private readonly ctxHiddenUnchangedCells;
    constructor(group: IEditorGroup, instantiationService: IInstantiationService, themeService: IThemeService, _parentContextKeyService: IContextKeyService, notebookEditorWorkerService: INotebookEditorWorkerService, configurationService: IConfigurationService, telemetryService: ITelemetryService, storageService: IStorageService, notebookService: INotebookService);
    private get fontInfo();
    layout(dimension: DOM.Dimension, position?: DOM.IDomPosition): void;
    private createFontInfo;
    protected createEditor(parent: HTMLElement): void;
    setInput(input: NotebookMultiDiffEditorInput, options: IMultiDiffEditorOptions | undefined, context: IEditorOpenContext, token: CancellationToken): Promise<void>;
    private _detachModel;
    _generateFontFamily(): string;
    setOptions(options: IMultiDiffEditorOptions | undefined): void;
    getControl(): import("../../../../../editor/browser/widget/diffEditor/diffEditorWidget.js").DiffEditorWidget | undefined;
    focus(): void;
    hasFocus(): boolean;
    clearInput(): void;
    expandAll(): void;
    collapseAll(): void;
    hideUnchanged(): void;
    showUnchanged(): void;
    getDiffElementViewModel(uri: URI): IDiffElementViewModelBase | undefined;
}
