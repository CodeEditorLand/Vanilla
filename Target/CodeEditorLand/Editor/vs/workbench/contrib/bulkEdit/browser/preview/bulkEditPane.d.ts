import { CancellationToken } from "vs/base/common/cancellation";
import "vs/css!./bulkEdit";
import { ResourceEdit } from "vs/editor/browser/services/bulkEditService";
import { ITextModelService } from "vs/editor/common/services/resolverService";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IContextMenuService } from "vs/platform/contextview/browser/contextView";
import { IDialogService } from "vs/platform/dialogs/common/dialogs";
import { IHoverService } from "vs/platform/hover/browser/hover";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IKeybindingService } from "vs/platform/keybinding/common/keybinding";
import { ILabelService } from "vs/platform/label/common/label";
import { IOpenerService } from "vs/platform/opener/common/opener";
import { IStorageService } from "vs/platform/storage/common/storage";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
import { IThemeService } from "vs/platform/theme/common/themeService";
import { ViewPane } from "vs/workbench/browser/parts/views/viewPane";
import { IViewletViewOptions } from "vs/workbench/browser/parts/views/viewsViewlet";
import { IViewDescriptorService } from "vs/workbench/common/views";
import { IEditorService } from "vs/workbench/services/editor/common/editorService";
export declare class BulkEditPane extends ViewPane {
    private readonly _instaService;
    private readonly _editorService;
    private readonly _labelService;
    private readonly _textModelService;
    private readonly _dialogService;
    private readonly _contextMenuService;
    private readonly _storageService;
    static readonly ID = "refactorPreview";
    static readonly Schema = "vscode-bulkeditpreview-multieditor";
    static readonly ctxHasCategories: any;
    static readonly ctxGroupByFile: any;
    static readonly ctxHasCheckedChanges: any;
    private static readonly _memGroupByFile;
    private _tree;
    private _treeDataSource;
    private _treeViewStates;
    private _message;
    private readonly _ctxHasCategories;
    private readonly _ctxGroupByFile;
    private readonly _ctxHasCheckedChanges;
    private readonly _disposables;
    private readonly _sessionDisposables;
    private _currentResolve?;
    private _currentInput?;
    private _currentProvider?;
    constructor(options: IViewletViewOptions, _instaService: IInstantiationService, _editorService: IEditorService, _labelService: ILabelService, _textModelService: ITextModelService, _dialogService: IDialogService, _contextMenuService: IContextMenuService, _storageService: IStorageService, contextKeyService: IContextKeyService, viewDescriptorService: IViewDescriptorService, keybindingService: IKeybindingService, contextMenuService: IContextMenuService, configurationService: IConfigurationService, openerService: IOpenerService, themeService: IThemeService, telemetryService: ITelemetryService, hoverService: IHoverService);
    dispose(): void;
    protected renderBody(parent: HTMLElement): void;
    protected layoutBody(height: number, width: number): void;
    private _setState;
    setInput(edit: ResourceEdit[], token: CancellationToken): Promise<ResourceEdit[] | undefined>;
    hasInput(): boolean;
    private _setTreeInput;
    accept(): void;
    discard(): void;
    private _done;
    toggleChecked(): void;
    groupByFile(): void;
    groupByType(): void;
    toggleGrouping(): void;
    private _openElementInMultiDiffEditor;
    private readonly _computeResourceDiffEditorInputs;
    private _onContextMenu;
}
