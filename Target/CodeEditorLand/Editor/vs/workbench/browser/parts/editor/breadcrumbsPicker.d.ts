import { Event } from "vs/base/common/event";
import { FuzzyScore } from "vs/base/common/filters";
import { IDisposable } from "vs/base/common/lifecycle";
import { URI } from "vs/base/common/uri";
import "vs/css!./media/breadcrumbscontrol";
import { ITreeSorter } from "vs/base/browser/ui/tree/tree";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IEditorOptions } from "vs/platform/editor/common/editor";
import { IFileStat } from "vs/platform/files/common/files";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { WorkbenchAsyncDataTree, WorkbenchDataTree } from "vs/platform/list/browser/listService";
import { IThemeService } from "vs/platform/theme/common/themeService";
import { IWorkspace, IWorkspaceContextService, IWorkspaceFolder } from "vs/platform/workspace/common/workspace";
import { FileElement, OutlineElement2 } from "vs/workbench/browser/parts/editor/breadcrumbsModel";
import { IEditorService } from "vs/workbench/services/editor/common/editorService";
import { IOutline } from "vs/workbench/services/outline/browser/outline";
interface ILayoutInfo {
    maxHeight: number;
    width: number;
    arrowSize: number;
    arrowOffset: number;
    inputHeight: number;
}
type Tree<I, E> = WorkbenchDataTree<I, E, FuzzyScore> | WorkbenchAsyncDataTree<I, E, FuzzyScore>;
export interface SelectEvent {
    target: any;
    browserEvent: UIEvent;
}
export declare abstract class BreadcrumbsPicker {
    protected resource: URI;
    protected readonly _instantiationService: IInstantiationService;
    protected readonly _themeService: IThemeService;
    protected readonly _configurationService: IConfigurationService;
    protected readonly _disposables: any;
    protected readonly _domNode: HTMLDivElement;
    protected _arrow: HTMLDivElement;
    protected _treeContainer: HTMLDivElement;
    protected _tree: Tree<any, any>;
    protected _fakeEvent: any;
    protected _layoutInfo: ILayoutInfo;
    protected readonly _onWillPickElement: any;
    readonly onWillPickElement: Event<void>;
    private readonly _previewDispoables;
    constructor(parent: HTMLElement, resource: URI, _instantiationService: IInstantiationService, _themeService: IThemeService, _configurationService: IConfigurationService);
    dispose(): void;
    show(input: any, maxHeight: number, width: number, arrowSize: number, arrowOffset: number): Promise<void>;
    protected _layout(): void;
    restoreViewState(): void;
    protected abstract _setInput(element: FileElement | OutlineElement2): Promise<void>;
    protected abstract _createTree(container: HTMLElement, input: any): Tree<any, any>;
    protected abstract _previewElement(element: any): IDisposable;
    protected abstract _revealElement(element: any, options: IEditorOptions, sideBySide: boolean): Promise<boolean>;
}
export declare class FileSorter implements ITreeSorter<IFileStat | IWorkspaceFolder> {
    compare(a: IFileStat | IWorkspaceFolder, b: IFileStat | IWorkspaceFolder): number;
}
export declare class BreadcrumbsFilePicker extends BreadcrumbsPicker {
    private readonly _workspaceService;
    private readonly _editorService;
    constructor(parent: HTMLElement, resource: URI, instantiationService: IInstantiationService, themeService: IThemeService, configService: IConfigurationService, _workspaceService: IWorkspaceContextService, _editorService: IEditorService);
    protected _createTree(container: HTMLElement): WorkbenchAsyncDataTree<IWorkspace | URI, IWorkspaceFolder | IFileStat, FuzzyScore>;
    protected _setInput(element: FileElement | OutlineElement2): Promise<void>;
    protected _previewElement(_element: any): IDisposable;
    protected _revealElement(element: IFileStat | IWorkspaceFolder, options: IEditorOptions, sideBySide: boolean): Promise<boolean>;
}
export declare class BreadcrumbsOutlinePicker extends BreadcrumbsPicker {
    protected _createTree(container: HTMLElement, input: OutlineElement2): WorkbenchDataTree<IOutline<any>, any, FuzzyScore>;
    protected _setInput(input: OutlineElement2): Promise<void>;
    protected _previewElement(element: any): IDisposable;
    protected _revealElement(element: any, options: IEditorOptions, sideBySide: boolean): Promise<boolean>;
}
export {};
