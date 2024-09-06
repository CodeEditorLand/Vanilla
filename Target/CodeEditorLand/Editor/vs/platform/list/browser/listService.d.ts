import { IListRenderer, IListVirtualDelegate } from "vs/base/browser/ui/list/list";
import { IPagedListOptions, IPagedRenderer, PagedList } from "vs/base/browser/ui/list/listPaging";
import { IListAccessibilityProvider, IListOptions, IListOptionsUpdate, IListStyles, List } from "vs/base/browser/ui/list/listWidget";
import { ITableColumn, ITableRenderer, ITableVirtualDelegate } from "vs/base/browser/ui/table/table";
import { ITableOptions, ITableOptionsUpdate, Table } from "vs/base/browser/ui/table/tableWidget";
import { IAbstractTreeOptionsUpdate } from "vs/base/browser/ui/tree/abstractTree";
import { AsyncDataTree, CompressibleAsyncDataTree, IAsyncDataTreeOptions, IAsyncDataTreeOptionsUpdate, ICompressibleAsyncDataTreeOptions, ICompressibleAsyncDataTreeOptionsUpdate, ITreeCompressionDelegate } from "vs/base/browser/ui/tree/asyncDataTree";
import { DataTree, IDataTreeOptions } from "vs/base/browser/ui/tree/dataTree";
import { CompressibleObjectTree, ICompressibleObjectTreeOptions, ICompressibleObjectTreeOptionsUpdate, ICompressibleTreeRenderer, IObjectTreeOptions, ObjectTree } from "vs/base/browser/ui/tree/objectTree";
import { IAsyncDataSource, IDataSource, ITreeRenderer } from "vs/base/browser/ui/tree/tree";
import { Event } from "vs/base/common/event";
import { IDisposable } from "vs/base/common/lifecycle";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IContextKey, IContextKeyService, IScopedContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IEditorOptions } from "vs/platform/editor/common/editor";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IStyleOverride } from "vs/platform/theme/browser/defaultStyles";
export type ListWidget = List<any> | PagedList<any> | ObjectTree<any, any> | DataTree<any, any, any> | AsyncDataTree<any, any, any> | Table<any>;
export type WorkbenchListWidget = WorkbenchList<any> | WorkbenchPagedList<any> | WorkbenchObjectTree<any, any> | WorkbenchCompressibleObjectTree<any, any> | WorkbenchDataTree<any, any, any> | WorkbenchAsyncDataTree<any, any, any> | WorkbenchCompressibleAsyncDataTree<any, any, any> | WorkbenchTable<any>;
export declare const IListService: any;
export interface IListService {
    readonly _serviceBrand: undefined;
    /**
     * Returns the currently focused list widget if any.
     */
    readonly lastFocusedList: WorkbenchListWidget | undefined;
}
export declare class ListService implements IListService {
    readonly _serviceBrand: undefined;
    private readonly disposables;
    private lists;
    private _lastFocusedWidget;
    private _hasCreatedStyleController;
    get lastFocusedList(): WorkbenchListWidget | undefined;
    constructor();
    private setLastFocusedList;
    register(widget: WorkbenchListWidget, extraContextKeys?: IContextKey<boolean>[]): IDisposable;
    dispose(): void;
}
export declare const RawWorkbenchListScrollAtBoundaryContextKey: any;
export declare const WorkbenchListScrollAtTopContextKey: any;
export declare const WorkbenchListScrollAtBottomContextKey: any;
export declare const RawWorkbenchListFocusContextKey: any;
export declare const WorkbenchTreeStickyScrollFocused: any;
export declare const WorkbenchListSupportsMultiSelectContextKey: any;
export declare const WorkbenchListFocusContextKey: any;
export declare const WorkbenchListHasSelectionOrFocus: any;
export declare const WorkbenchListDoubleSelection: any;
export declare const WorkbenchListMultiSelection: any;
export declare const WorkbenchListSelectionNavigation: any;
export declare const WorkbenchListSupportsFind: any;
export declare const WorkbenchTreeElementCanCollapse: any;
export declare const WorkbenchTreeElementHasParent: any;
export declare const WorkbenchTreeElementCanExpand: any;
export declare const WorkbenchTreeElementHasChild: any;
export declare const WorkbenchTreeFindOpen: any;
export interface IWorkbenchListOptionsUpdate extends IListOptionsUpdate {
    readonly overrideStyles?: IStyleOverride<IListStyles>;
}
export interface IWorkbenchListOptions<T> extends IWorkbenchListOptionsUpdate, IResourceNavigatorOptions, IListOptions<T> {
    readonly selectionNavigation?: boolean;
}
export declare class WorkbenchList<T> extends List<T> {
    readonly contextKeyService: IScopedContextKeyService;
    private listSupportsMultiSelect;
    private listHasSelectionOrFocus;
    private listDoubleSelection;
    private listMultiSelection;
    private horizontalScrolling;
    private _useAltAsMultipleSelectionModifier;
    private navigator;
    get onDidOpen(): Event<IOpenEvent<T | undefined>>;
    constructor(user: string, container: HTMLElement, delegate: IListVirtualDelegate<T>, renderers: IListRenderer<T, any>[], options: IWorkbenchListOptions<T>, contextKeyService: IContextKeyService, listService: IListService, configurationService: IConfigurationService, instantiationService: IInstantiationService);
    updateOptions(options: IWorkbenchListOptionsUpdate): void;
    private updateStyles;
    get useAltAsMultipleSelectionModifier(): boolean;
}
export interface IWorkbenchPagedListOptions<T> extends IWorkbenchListOptionsUpdate, IResourceNavigatorOptions, IPagedListOptions<T> {
    readonly selectionNavigation?: boolean;
}
export declare class WorkbenchPagedList<T> extends PagedList<T> {
    readonly contextKeyService: IScopedContextKeyService;
    private readonly disposables;
    private listSupportsMultiSelect;
    private _useAltAsMultipleSelectionModifier;
    private horizontalScrolling;
    private navigator;
    get onDidOpen(): Event<IOpenEvent<T | undefined>>;
    constructor(user: string, container: HTMLElement, delegate: IListVirtualDelegate<number>, renderers: IPagedRenderer<T, any>[], options: IWorkbenchPagedListOptions<T>, contextKeyService: IContextKeyService, listService: IListService, configurationService: IConfigurationService, instantiationService: IInstantiationService);
    updateOptions(options: IWorkbenchListOptionsUpdate): void;
    private updateStyles;
    get useAltAsMultipleSelectionModifier(): boolean;
    dispose(): void;
}
export interface IWorkbenchTableOptionsUpdate extends ITableOptionsUpdate {
    readonly overrideStyles?: IStyleOverride<IListStyles>;
}
export interface IWorkbenchTableOptions<T> extends IWorkbenchTableOptionsUpdate, IResourceNavigatorOptions, ITableOptions<T> {
    readonly selectionNavigation?: boolean;
}
export declare class WorkbenchTable<TRow> extends Table<TRow> {
    readonly contextKeyService: IScopedContextKeyService;
    private listSupportsMultiSelect;
    private listHasSelectionOrFocus;
    private listDoubleSelection;
    private listMultiSelection;
    private horizontalScrolling;
    private _useAltAsMultipleSelectionModifier;
    private navigator;
    get onDidOpen(): Event<IOpenEvent<TRow | undefined>>;
    constructor(user: string, container: HTMLElement, delegate: ITableVirtualDelegate<TRow>, columns: ITableColumn<TRow, any>[], renderers: ITableRenderer<TRow, any>[], options: IWorkbenchTableOptions<TRow>, contextKeyService: IContextKeyService, listService: IListService, configurationService: IConfigurationService, instantiationService: IInstantiationService);
    updateOptions(options: IWorkbenchTableOptionsUpdate): void;
    private updateStyles;
    get useAltAsMultipleSelectionModifier(): boolean;
    dispose(): void;
}
export interface IOpenResourceOptions {
    editorOptions: IEditorOptions;
    sideBySide: boolean;
    element: any;
    payload: any;
}
export interface IOpenEvent<T> {
    editorOptions: IEditorOptions;
    sideBySide: boolean;
    element: T;
    browserEvent?: UIEvent;
}
export interface IResourceNavigatorOptions {
    readonly configurationService?: IConfigurationService;
    readonly openOnSingleClick?: boolean;
}
export interface SelectionKeyboardEvent extends KeyboardEvent {
    preserveFocus?: boolean;
    pinned?: boolean;
    __forceEvent?: boolean;
}
export declare function getSelectionKeyboardEvent(typeArg?: string, preserveFocus?: boolean, pinned?: boolean): SelectionKeyboardEvent;
export interface IWorkbenchObjectTreeOptions<T, TFilterData> extends IObjectTreeOptions<T, TFilterData>, IResourceNavigatorOptions {
    readonly accessibilityProvider: IListAccessibilityProvider<T>;
    readonly overrideStyles?: IStyleOverride<IListStyles>;
    readonly selectionNavigation?: boolean;
}
export declare class WorkbenchObjectTree<T extends NonNullable<any>, TFilterData = void> extends ObjectTree<T, TFilterData> {
    private internals;
    get contextKeyService(): IContextKeyService;
    get useAltAsMultipleSelectionModifier(): boolean;
    get onDidOpen(): Event<IOpenEvent<T | undefined>>;
    constructor(user: string, container: HTMLElement, delegate: IListVirtualDelegate<T>, renderers: ITreeRenderer<T, TFilterData, any>[], options: IWorkbenchObjectTreeOptions<T, TFilterData>, instantiationService: IInstantiationService, contextKeyService: IContextKeyService, listService: IListService, configurationService: IConfigurationService);
    updateOptions(options: IAbstractTreeOptionsUpdate): void;
}
export interface IWorkbenchCompressibleObjectTreeOptionsUpdate extends ICompressibleObjectTreeOptionsUpdate {
    readonly overrideStyles?: IStyleOverride<IListStyles>;
}
export interface IWorkbenchCompressibleObjectTreeOptions<T, TFilterData> extends IWorkbenchCompressibleObjectTreeOptionsUpdate, ICompressibleObjectTreeOptions<T, TFilterData>, IResourceNavigatorOptions {
    readonly accessibilityProvider: IListAccessibilityProvider<T>;
    readonly selectionNavigation?: boolean;
}
export declare class WorkbenchCompressibleObjectTree<T extends NonNullable<any>, TFilterData = void> extends CompressibleObjectTree<T, TFilterData> {
    private internals;
    get contextKeyService(): IContextKeyService;
    get useAltAsMultipleSelectionModifier(): boolean;
    get onDidOpen(): Event<IOpenEvent<T | undefined>>;
    constructor(user: string, container: HTMLElement, delegate: IListVirtualDelegate<T>, renderers: ICompressibleTreeRenderer<T, TFilterData, any>[], options: IWorkbenchCompressibleObjectTreeOptions<T, TFilterData>, instantiationService: IInstantiationService, contextKeyService: IContextKeyService, listService: IListService, configurationService: IConfigurationService);
    updateOptions(options?: IWorkbenchCompressibleObjectTreeOptionsUpdate): void;
}
export interface IWorkbenchDataTreeOptionsUpdate extends IAbstractTreeOptionsUpdate {
    readonly overrideStyles?: IStyleOverride<IListStyles>;
}
export interface IWorkbenchDataTreeOptions<T, TFilterData> extends IWorkbenchDataTreeOptionsUpdate, IDataTreeOptions<T, TFilterData>, IResourceNavigatorOptions {
    readonly accessibilityProvider: IListAccessibilityProvider<T>;
    readonly selectionNavigation?: boolean;
}
export declare class WorkbenchDataTree<TInput, T, TFilterData = void> extends DataTree<TInput, T, TFilterData> {
    private internals;
    get contextKeyService(): IContextKeyService;
    get useAltAsMultipleSelectionModifier(): boolean;
    get onDidOpen(): Event<IOpenEvent<T | undefined>>;
    constructor(user: string, container: HTMLElement, delegate: IListVirtualDelegate<T>, renderers: ITreeRenderer<T, TFilterData, any>[], dataSource: IDataSource<TInput, T>, options: IWorkbenchDataTreeOptions<T, TFilterData>, instantiationService: IInstantiationService, contextKeyService: IContextKeyService, listService: IListService, configurationService: IConfigurationService);
    updateOptions(options?: IWorkbenchDataTreeOptionsUpdate): void;
}
export interface IWorkbenchAsyncDataTreeOptionsUpdate extends IAsyncDataTreeOptionsUpdate {
    readonly overrideStyles?: IStyleOverride<IListStyles>;
}
export interface IWorkbenchAsyncDataTreeOptions<T, TFilterData> extends IWorkbenchAsyncDataTreeOptionsUpdate, IAsyncDataTreeOptions<T, TFilterData>, IResourceNavigatorOptions {
    readonly accessibilityProvider: IListAccessibilityProvider<T>;
    readonly selectionNavigation?: boolean;
}
export declare class WorkbenchAsyncDataTree<TInput, T, TFilterData = void> extends AsyncDataTree<TInput, T, TFilterData> {
    private internals;
    get contextKeyService(): IContextKeyService;
    get useAltAsMultipleSelectionModifier(): boolean;
    get onDidOpen(): Event<IOpenEvent<T | undefined>>;
    constructor(user: string, container: HTMLElement, delegate: IListVirtualDelegate<T>, renderers: ITreeRenderer<T, TFilterData, any>[], dataSource: IAsyncDataSource<TInput, T>, options: IWorkbenchAsyncDataTreeOptions<T, TFilterData>, instantiationService: IInstantiationService, contextKeyService: IContextKeyService, listService: IListService, configurationService: IConfigurationService);
    updateOptions(options?: IWorkbenchAsyncDataTreeOptionsUpdate): void;
}
export interface IWorkbenchCompressibleAsyncDataTreeOptions<T, TFilterData> extends ICompressibleAsyncDataTreeOptions<T, TFilterData>, IResourceNavigatorOptions {
    readonly accessibilityProvider: IListAccessibilityProvider<T>;
    readonly overrideStyles?: IStyleOverride<IListStyles>;
    readonly selectionNavigation?: boolean;
}
export declare class WorkbenchCompressibleAsyncDataTree<TInput, T, TFilterData = void> extends CompressibleAsyncDataTree<TInput, T, TFilterData> {
    private internals;
    get contextKeyService(): IContextKeyService;
    get useAltAsMultipleSelectionModifier(): boolean;
    get onDidOpen(): Event<IOpenEvent<T | undefined>>;
    constructor(user: string, container: HTMLElement, virtualDelegate: IListVirtualDelegate<T>, compressionDelegate: ITreeCompressionDelegate<T>, renderers: ICompressibleTreeRenderer<T, TFilterData, any>[], dataSource: IAsyncDataSource<TInput, T>, options: IWorkbenchCompressibleAsyncDataTreeOptions<T, TFilterData>, instantiationService: IInstantiationService, contextKeyService: IContextKeyService, listService: IListService, configurationService: IConfigurationService);
    updateOptions(options: ICompressibleAsyncDataTreeOptionsUpdate): void;
}
