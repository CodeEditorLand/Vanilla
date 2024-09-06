import "vs/css!./notebookDiff";
import { IMouseWheelEvent } from "vs/base/browser/mouseEvent";
import { IListMouseEvent, IListRenderer, IListVirtualDelegate } from "vs/base/browser/ui/list/list";
import { IListOptions, IListStyles, IStyleController, MouseController } from "vs/base/browser/ui/list/listWidget";
import { IDisposable } from "vs/base/common/lifecycle";
import { IAccessibilityService } from "vs/platform/accessibility/common/accessibility";
import { IMenuService } from "vs/platform/actions/common/actions";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IContextMenuService } from "vs/platform/contextview/browser/contextView";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IKeybindingService } from "vs/platform/keybinding/common/keybinding";
import { IListService, IWorkbenchListOptions, WorkbenchList } from "vs/platform/list/browser/listService";
import { INotificationService } from "vs/platform/notification/common/notification";
import { IThemeService } from "vs/platform/theme/common/themeService";
import { DiffElementPlaceholderViewModel, IDiffElementViewModelBase, SideBySideDiffElementViewModel, SingleSideDiffElementViewModel } from "vs/workbench/contrib/notebook/browser/diff/diffElementViewModel";
import { CellDiffPlaceholderRenderTemplate, CellDiffSideBySideRenderTemplate, CellDiffSingleSideRenderTemplate, INotebookTextDiffEditor } from "vs/workbench/contrib/notebook/browser/diff/notebookDiffEditorBrowser";
export declare class NotebookCellTextDiffListDelegate implements IListVirtualDelegate<IDiffElementViewModelBase> {
    private readonly configurationService;
    private readonly lineHeight;
    constructor(targetWindow: Window, configurationService: IConfigurationService);
    getHeight(element: IDiffElementViewModelBase): number;
    hasDynamicHeight(element: IDiffElementViewModelBase): boolean;
    getTemplateId(element: IDiffElementViewModelBase): string;
}
export declare class CellDiffPlaceholderRenderer implements IListRenderer<DiffElementPlaceholderViewModel, CellDiffPlaceholderRenderTemplate> {
    readonly notebookEditor: INotebookTextDiffEditor;
    protected readonly instantiationService: IInstantiationService;
    static readonly TEMPLATE_ID = "cell_diff_placeholder";
    constructor(notebookEditor: INotebookTextDiffEditor, instantiationService: IInstantiationService);
    get templateId(): string;
    renderTemplate(container: HTMLElement): CellDiffPlaceholderRenderTemplate;
    renderElement(element: DiffElementPlaceholderViewModel, index: number, templateData: CellDiffPlaceholderRenderTemplate, height: number | undefined): void;
    disposeTemplate(templateData: CellDiffPlaceholderRenderTemplate): void;
    disposeElement(element: DiffElementPlaceholderViewModel, index: number, templateData: CellDiffPlaceholderRenderTemplate): void;
}
export declare class CellDiffSingleSideRenderer implements IListRenderer<SingleSideDiffElementViewModel, CellDiffSingleSideRenderTemplate | CellDiffSideBySideRenderTemplate> {
    readonly notebookEditor: INotebookTextDiffEditor;
    protected readonly instantiationService: IInstantiationService;
    static readonly TEMPLATE_ID = "cell_diff_single";
    constructor(notebookEditor: INotebookTextDiffEditor, instantiationService: IInstantiationService);
    get templateId(): string;
    renderTemplate(container: HTMLElement): CellDiffSingleSideRenderTemplate;
    private _buildSourceEditor;
    renderElement(element: SingleSideDiffElementViewModel, index: number, templateData: CellDiffSingleSideRenderTemplate, height: number | undefined): void;
    disposeTemplate(templateData: CellDiffSingleSideRenderTemplate): void;
    disposeElement(element: SingleSideDiffElementViewModel, index: number, templateData: CellDiffSingleSideRenderTemplate): void;
}
export declare class CellDiffSideBySideRenderer implements IListRenderer<SideBySideDiffElementViewModel, CellDiffSideBySideRenderTemplate> {
    readonly notebookEditor: INotebookTextDiffEditor;
    protected readonly instantiationService: IInstantiationService;
    protected readonly contextMenuService: IContextMenuService;
    protected readonly keybindingService: IKeybindingService;
    protected readonly menuService: IMenuService;
    protected readonly contextKeyService: IContextKeyService;
    protected readonly notificationService: INotificationService;
    protected readonly themeService: IThemeService;
    protected readonly accessibilityService: IAccessibilityService;
    static readonly TEMPLATE_ID = "cell_diff_side_by_side";
    constructor(notebookEditor: INotebookTextDiffEditor, instantiationService: IInstantiationService, contextMenuService: IContextMenuService, keybindingService: IKeybindingService, menuService: IMenuService, contextKeyService: IContextKeyService, notificationService: INotificationService, themeService: IThemeService, accessibilityService: IAccessibilityService);
    get templateId(): string;
    renderTemplate(container: HTMLElement): CellDiffSideBySideRenderTemplate;
    private _buildSourceEditor;
    renderElement(element: SideBySideDiffElementViewModel, index: number, templateData: CellDiffSideBySideRenderTemplate, height: number | undefined): void;
    disposeTemplate(templateData: CellDiffSideBySideRenderTemplate): void;
    disposeElement(element: SideBySideDiffElementViewModel, index: number, templateData: CellDiffSideBySideRenderTemplate): void;
}
export declare class NotebookMouseController<T> extends MouseController<T> {
    protected onViewPointer(e: IListMouseEvent<T>): void;
}
export declare class NotebookTextDiffList extends WorkbenchList<IDiffElementViewModelBase> implements IDisposable, IStyleController {
    private styleElement?;
    get rowsContainer(): HTMLElement;
    constructor(listUser: string, container: HTMLElement, delegate: IListVirtualDelegate<IDiffElementViewModelBase>, renderers: IListRenderer<IDiffElementViewModelBase, CellDiffSingleSideRenderTemplate | CellDiffSideBySideRenderTemplate | CellDiffPlaceholderRenderTemplate>[], contextKeyService: IContextKeyService, options: IWorkbenchListOptions<IDiffElementViewModelBase>, listService: IListService, configurationService: IConfigurationService, instantiationService: IInstantiationService);
    protected createMouseController(options: IListOptions<IDiffElementViewModelBase>): MouseController<IDiffElementViewModelBase>;
    getCellViewScrollTop(element: IDiffElementViewModelBase): number;
    getScrollHeight(): any;
    triggerScrollFromMouseWheelEvent(browserEvent: IMouseWheelEvent): void;
    delegateVerticalScrollbarPointerDown(browserEvent: PointerEvent): void;
    clear(): void;
    updateElementHeight2(element: IDiffElementViewModelBase, size: number): void;
    style(styles: IListStyles): void;
}
