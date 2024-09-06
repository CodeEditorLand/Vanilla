import { IContextViewProvider } from "vs/base/browser/ui/contextview/contextview";
import { IInputBoxStyles } from "vs/base/browser/ui/inputbox/inputBox";
import { IListRenderer, IListVirtualDelegate } from "vs/base/browser/ui/list/list";
import { IListOptions, IListStyles, List, MouseController, TypeNavigationMode } from "vs/base/browser/ui/list/listWidget";
import { IToggleStyles, Toggle } from "vs/base/browser/ui/toggle/toggle";
import { ICollapseStateChangeEvent, ITreeContextMenuEvent, ITreeDragAndDrop, ITreeEvent, ITreeFilter, ITreeModel, ITreeModelSpliceEvent, ITreeMouseEvent, ITreeNavigator, ITreeNode, ITreeRenderer, TreeVisibility } from "vs/base/browser/ui/tree/tree";
import { Event } from "vs/base/common/event";
import { FuzzyScore } from "vs/base/common/filters";
import { Disposable, IDisposable } from "vs/base/common/lifecycle";
import { SetMap } from "vs/base/common/map";
import { ScrollEvent } from "vs/base/common/scrollable";
import { ISpliceable } from "vs/base/common/sequence";
import "vs/css!./media/tree";
import { IHoverDelegate } from "vs/base/browser/ui/hover/hoverDelegate";
export declare class ComposedTreeDelegate<T, N extends {
    element: T;
}> implements IListVirtualDelegate<N> {
    private delegate;
    constructor(delegate: IListVirtualDelegate<T>);
    getHeight(element: N): number;
    getTemplateId(element: N): string;
    hasDynamicHeight(element: N): boolean;
    setDynamicHeight(element: N, height: number): void;
}
interface ITreeListTemplateData<T> {
    readonly container: HTMLElement;
    readonly indent: HTMLElement;
    readonly twistie: HTMLElement;
    indentGuidesDisposable: IDisposable;
    readonly templateData: T;
}
export interface IAbstractTreeViewState {
    readonly focus: Iterable<string>;
    readonly selection: Iterable<string>;
    readonly expanded: {
        [id: string]: 1 | 0;
    };
    readonly scrollTop: number;
}
export declare class AbstractTreeViewState implements IAbstractTreeViewState {
    readonly focus: Set<string>;
    readonly selection: Set<string>;
    readonly expanded: {
        [id: string]: 1 | 0;
    };
    scrollTop: number;
    static lift(state: IAbstractTreeViewState): AbstractTreeViewState;
    static empty(scrollTop?: number): AbstractTreeViewState;
    protected constructor(state: IAbstractTreeViewState);
    toJSON(): IAbstractTreeViewState;
}
export declare enum RenderIndentGuides {
    None = "none",
    OnHover = "onHover",
    Always = "always"
}
interface ITreeRendererOptions {
    readonly indent?: number;
    readonly renderIndentGuides?: RenderIndentGuides;
    readonly hideTwistiesOfChildlessElements?: boolean;
}
interface Collection<T> {
    readonly elements: T[];
    readonly onDidChange: Event<T[]>;
}
export declare class TreeRenderer<T, TFilterData, TRef, TTemplateData> implements IListRenderer<ITreeNode<T, TFilterData>, ITreeListTemplateData<TTemplateData>> {
    private renderer;
    private modelProvider;
    private activeNodes;
    private renderedIndentGuides;
    private static readonly DefaultIndent;
    readonly templateId: string;
    private renderedElements;
    private renderedNodes;
    private indent;
    private hideTwistiesOfChildlessElements;
    private shouldRenderIndentGuides;
    private activeIndentNodes;
    private indentGuidesDisposable;
    private readonly disposables;
    constructor(renderer: ITreeRenderer<T, TFilterData, TTemplateData>, modelProvider: () => ITreeModel<T, TFilterData, TRef>, onDidChangeCollapseState: Event<ICollapseStateChangeEvent<T, TFilterData>>, activeNodes: Collection<ITreeNode<T, TFilterData>>, renderedIndentGuides: SetMap<ITreeNode<T, TFilterData>, HTMLDivElement>, options?: ITreeRendererOptions);
    updateOptions(options?: ITreeRendererOptions): void;
    renderTemplate(container: HTMLElement): ITreeListTemplateData<TTemplateData>;
    renderElement(node: ITreeNode<T, TFilterData>, index: number, templateData: ITreeListTemplateData<TTemplateData>, height: number | undefined): void;
    disposeElement(node: ITreeNode<T, TFilterData>, index: number, templateData: ITreeListTemplateData<TTemplateData>, height: number | undefined): void;
    disposeTemplate(templateData: ITreeListTemplateData<TTemplateData>): void;
    private onDidChangeTwistieState;
    private onDidChangeNodeTwistieState;
    private renderTreeElement;
    private _renderIndentGuides;
    private _onDidChangeActiveNodes;
    dispose(): void;
}
export type LabelFuzzyScore = {
    label: string;
    score: FuzzyScore;
};
export interface ITreeFindToggleOpts {
    readonly isChecked: boolean;
    readonly inputActiveOptionBorder: string | undefined;
    readonly inputActiveOptionForeground: string | undefined;
    readonly inputActiveOptionBackground: string | undefined;
    readonly hoverDelegate?: IHoverDelegate;
}
export declare class ModeToggle extends Toggle {
    constructor(opts: ITreeFindToggleOpts);
}
export declare class FuzzyToggle extends Toggle {
    constructor(opts: ITreeFindToggleOpts);
}
export interface IFindWidgetStyles {
    listFilterWidgetBackground: string | undefined;
    listFilterWidgetOutline: string | undefined;
    listFilterWidgetNoMatchesOutline: string | undefined;
    listFilterWidgetShadow: string | undefined;
    readonly toggleStyles: IToggleStyles;
    readonly inputBoxStyles: IInputBoxStyles;
}
export interface IFindWidgetOptions {
    readonly history?: string[];
    readonly styles?: IFindWidgetStyles;
}
export declare enum TreeFindMode {
    Highlight = 0,
    Filter = 1
}
export declare enum TreeFindMatchType {
    Fuzzy = 0,
    Contiguous = 1
}
export interface StickyScrollNode<T, TFilterData> {
    readonly node: ITreeNode<T, TFilterData>;
    readonly startIndex: number;
    readonly endIndex: number;
    readonly height: number;
    readonly position: number;
}
export interface IStickyScrollDelegate<T, TFilterData> {
    constrainStickyScrollNodes(stickyNodes: StickyScrollNode<T, TFilterData>[], stickyScrollMaxItemCount: number, maxWidgetHeight: number): StickyScrollNode<T, TFilterData>[];
}
declare class StickyScrollController<T, TFilterData, TRef> extends Disposable {
    private readonly tree;
    private readonly model;
    private readonly view;
    private readonly treeDelegate;
    readonly onDidChangeHasFocus: Event<boolean>;
    readonly onContextMenu: Event<ITreeContextMenuEvent<T>>;
    private readonly stickyScrollDelegate;
    private stickyScrollMaxItemCount;
    private readonly maxWidgetViewRatio;
    private readonly _widget;
    constructor(tree: AbstractTree<T, TFilterData, TRef>, model: ITreeModel<T, TFilterData, TRef>, view: List<ITreeNode<T, TFilterData>>, renderers: TreeRenderer<T, TFilterData, TRef, any>[], treeDelegate: IListVirtualDelegate<ITreeNode<T, TFilterData>>, options?: IAbstractTreeOptions<T, TFilterData>);
    get height(): number;
    get count(): number;
    getNode(node: ITreeNode<T, TFilterData>): StickyScrollNode<T, TFilterData> | undefined;
    private getNodeAtHeight;
    private update;
    private findStickyState;
    private getNextVisibleNode;
    private getNextStickyNode;
    private nodeTopAlignsWithStickyNodesBottom;
    private createStickyScrollNode;
    private getAncestorUnderPrevious;
    private calculateStickyNodePosition;
    private constrainStickyNodes;
    private getParentNode;
    private nodeIsUncollapsedParent;
    private getNodeIndex;
    private getNodeRange;
    nodePositionTopBelowWidget(node: ITreeNode<T, TFilterData>): number;
    getFocus(): T | undefined;
    domFocus(): void;
    focusedLast(): boolean;
    updateOptions(optionsUpdate?: IAbstractTreeOptionsUpdate): void;
    validateStickySettings(options: IAbstractTreeOptionsUpdate): {
        stickyScrollMaxItemCount: number;
    };
}
export interface IAbstractTreeOptionsUpdate extends ITreeRendererOptions {
    readonly multipleSelectionSupport?: boolean;
    readonly typeNavigationEnabled?: boolean;
    readonly typeNavigationMode?: TypeNavigationMode;
    readonly defaultFindMode?: TreeFindMode;
    readonly defaultFindMatchType?: TreeFindMatchType;
    readonly showNotFoundMessage?: boolean;
    readonly smoothScrolling?: boolean;
    readonly horizontalScrolling?: boolean;
    readonly scrollByPage?: boolean;
    readonly mouseWheelScrollSensitivity?: number;
    readonly fastScrollSensitivity?: number;
    readonly expandOnDoubleClick?: boolean;
    readonly expandOnlyOnTwistieClick?: boolean | ((e: any) => boolean);
    readonly enableStickyScroll?: boolean;
    readonly stickyScrollMaxItemCount?: number;
}
export interface IAbstractTreeOptions<T, TFilterData = void> extends IAbstractTreeOptionsUpdate, IListOptions<T> {
    readonly contextViewProvider?: IContextViewProvider;
    readonly collapseByDefault?: boolean;
    readonly allowNonCollapsibleParents?: boolean;
    readonly filter?: ITreeFilter<T, TFilterData>;
    readonly dnd?: ITreeDragAndDrop<T>;
    readonly paddingBottom?: number;
    readonly findWidgetEnabled?: boolean;
    readonly findWidgetStyles?: IFindWidgetStyles;
    readonly defaultFindVisibility?: TreeVisibility | ((e: T) => TreeVisibility);
    readonly stickyScrollDelegate?: IStickyScrollDelegate<any, TFilterData>;
}
/**
 * The trait concept needs to exist at the tree level, because collapsed
 * tree nodes will not be known by the list.
 */
declare class Trait<T> {
    private getFirstViewElementWithTrait;
    private identityProvider?;
    private nodes;
    private elements;
    private readonly _onDidChange;
    readonly onDidChange: any;
    private _nodeSet;
    private get nodeSet();
    constructor(getFirstViewElementWithTrait: () => ITreeNode<T, any> | undefined, identityProvider?: any);
    set(nodes: ITreeNode<T, any>[], browserEvent?: UIEvent): void;
    private _set;
    get(): T[];
    getNodes(): readonly ITreeNode<T, any>[];
    has(node: ITreeNode<T, any>): boolean;
    onDidModelSplice({ insertedNodes, deletedNodes, }: ITreeModelSpliceEvent<T, any>): void;
    private createNodeSet;
}
interface ITreeNodeListOptions<T, TFilterData, TRef> extends IListOptions<ITreeNode<T, TFilterData>> {
    readonly tree: AbstractTree<T, TFilterData, TRef>;
    readonly stickyScrollProvider: () => StickyScrollController<T, TFilterData, TRef> | undefined;
}
/**
 * We use this List subclass to restore selection and focus as nodes
 * get rendered in the list, possibly due to a node expand() call.
 */
declare class TreeNodeList<T, TFilterData, TRef> extends List<ITreeNode<T, TFilterData>> {
    private focusTrait;
    private selectionTrait;
    private anchorTrait;
    constructor(user: string, container: HTMLElement, virtualDelegate: IListVirtualDelegate<ITreeNode<T, TFilterData>>, renderers: IListRenderer<any, any>[], focusTrait: Trait<T>, selectionTrait: Trait<T>, anchorTrait: Trait<T>, options: ITreeNodeListOptions<T, TFilterData, TRef>);
    protected createMouseController(options: ITreeNodeListOptions<T, TFilterData, TRef>): MouseController<ITreeNode<T, TFilterData>>;
    splice(start: number, deleteCount: number, elements?: readonly ITreeNode<T, TFilterData>[]): void;
    setFocus(indexes: number[], browserEvent?: UIEvent, fromAPI?: boolean): void;
    setSelection(indexes: number[], browserEvent?: UIEvent, fromAPI?: boolean): void;
    setAnchor(index: number | undefined, fromAPI?: boolean): void;
}
export declare const enum AbstractTreePart {
    Tree = 0,
    StickyScroll = 1
}
export declare abstract class AbstractTree<T, TFilterData, TRef> implements IDisposable {
    private readonly _user;
    private _options;
    protected view: TreeNodeList<T, TFilterData, TRef>;
    private renderers;
    protected model: ITreeModel<T, TFilterData, TRef>;
    private treeDelegate;
    private focus;
    private selection;
    private anchor;
    private eventBufferer;
    private findController?;
    readonly onDidChangeFindOpenState: Event<boolean>;
    onDidChangeStickyScrollFocused: Event<boolean>;
    private focusNavigationFilter;
    private stickyScrollController?;
    private styleElement;
    protected readonly disposables: any;
    get onDidScroll(): Event<ScrollEvent>;
    get onDidChangeFocus(): Event<ITreeEvent<T>>;
    get onDidChangeSelection(): Event<ITreeEvent<T>>;
    get onMouseClick(): Event<ITreeMouseEvent<T>>;
    get onMouseDblClick(): Event<ITreeMouseEvent<T>>;
    get onMouseOver(): Event<ITreeMouseEvent<T>>;
    get onMouseOut(): Event<ITreeMouseEvent<T>>;
    get onContextMenu(): Event<ITreeContextMenuEvent<T>>;
    get onTap(): Event<ITreeMouseEvent<T>>;
    get onPointer(): Event<ITreeMouseEvent<T>>;
    get onKeyDown(): Event<KeyboardEvent>;
    get onKeyUp(): Event<KeyboardEvent>;
    get onKeyPress(): Event<KeyboardEvent>;
    get onDidFocus(): Event<void>;
    get onDidBlur(): Event<void>;
    get onDidChangeModel(): Event<void>;
    get onDidChangeCollapseState(): Event<ICollapseStateChangeEvent<T, TFilterData>>;
    get onDidChangeRenderNodeCount(): Event<ITreeNode<T, TFilterData>>;
    private readonly _onWillRefilter;
    readonly onWillRefilter: Event<void>;
    get findMode(): TreeFindMode;
    set findMode(findMode: TreeFindMode);
    readonly onDidChangeFindMode: Event<TreeFindMode>;
    get findMatchType(): TreeFindMatchType;
    set findMatchType(findFuzzy: TreeFindMatchType);
    readonly onDidChangeFindMatchType: Event<TreeFindMatchType>;
    get onDidChangeFindPattern(): Event<string>;
    get expandOnDoubleClick(): boolean;
    get expandOnlyOnTwistieClick(): boolean | ((e: T) => boolean);
    private readonly _onDidUpdateOptions;
    readonly onDidUpdateOptions: Event<IAbstractTreeOptions<T, TFilterData>>;
    get onDidDispose(): Event<void>;
    constructor(_user: string, container: HTMLElement, delegate: IListVirtualDelegate<T>, renderers: ITreeRenderer<T, TFilterData, any>[], _options?: IAbstractTreeOptions<T, TFilterData>);
    updateOptions(optionsUpdate?: IAbstractTreeOptionsUpdate): void;
    get options(): IAbstractTreeOptions<T, TFilterData>;
    private updateStickyScroll;
    updateWidth(element: TRef): void;
    getHTMLElement(): HTMLElement;
    get contentHeight(): number;
    get contentWidth(): number;
    get onDidChangeContentHeight(): Event<number>;
    get onDidChangeContentWidth(): Event<number>;
    get scrollTop(): number;
    set scrollTop(scrollTop: number);
    get scrollLeft(): number;
    set scrollLeft(scrollLeft: number);
    get scrollHeight(): number;
    get renderHeight(): number;
    get firstVisibleElement(): T | undefined;
    get lastVisibleElement(): T;
    get ariaLabel(): string;
    set ariaLabel(value: string);
    get selectionSize(): number;
    domFocus(): void;
    isDOMFocused(): boolean;
    layout(height?: number, width?: number): void;
    style(styles: IListStyles): void;
    getParentElement(location: TRef): T;
    getFirstElementChild(location: TRef): T | undefined;
    getNode(location?: TRef): ITreeNode<T, TFilterData>;
    getNodeLocation(node: ITreeNode<T, TFilterData>): TRef;
    collapse(location: TRef, recursive?: boolean): boolean;
    expand(location: TRef, recursive?: boolean): boolean;
    toggleCollapsed(location: TRef, recursive?: boolean): boolean;
    expandAll(): void;
    collapseAll(): void;
    isCollapsible(location: TRef): boolean;
    setCollapsible(location: TRef, collapsible?: boolean): boolean;
    isCollapsed(location: TRef): boolean;
    expandTo(location: TRef): void;
    triggerTypeNavigation(): void;
    openFind(): void;
    closeFind(): void;
    refilter(): void;
    setAnchor(element: TRef | undefined): void;
    getAnchor(): T | undefined;
    setSelection(elements: TRef[], browserEvent?: UIEvent): void;
    getSelection(): T[];
    setFocus(elements: TRef[], browserEvent?: UIEvent): void;
    focusNext(n?: number, loop?: boolean, browserEvent?: UIEvent, filter?: ((node: ITreeNode<T, TFilterData>) => boolean) | undefined): void;
    focusPrevious(n?: number, loop?: boolean, browserEvent?: UIEvent, filter?: ((node: ITreeNode<T, TFilterData>) => boolean) | undefined): void;
    focusNextPage(browserEvent?: UIEvent, filter?: ((node: ITreeNode<T, TFilterData>) => boolean) | undefined): Promise<void>;
    focusPreviousPage(browserEvent?: UIEvent, filter?: ((node: ITreeNode<T, TFilterData>) => boolean) | undefined): Promise<void>;
    focusLast(browserEvent?: UIEvent, filter?: ((node: ITreeNode<T, TFilterData>) => boolean) | undefined): void;
    focusFirst(browserEvent?: UIEvent, filter?: ((node: ITreeNode<T, TFilterData>) => boolean) | undefined): void;
    getFocus(): T[];
    getStickyScrollFocus(): T[];
    getFocusedPart(): AbstractTreePart;
    reveal(location: TRef, relativeTop?: number): void;
    /**
     * Returns the relative position of an element rendered in the list.
     * Returns `null` if the element isn't *entirely* in the visible viewport.
     */
    getRelativeTop(location: TRef): number | null;
    getViewState(identityProvider?: any): AbstractTreeViewState;
    private onLeftArrow;
    private onRightArrow;
    private onSpace;
    protected abstract createModel(user: string, view: ISpliceable<ITreeNode<T, TFilterData>>, options: IAbstractTreeOptions<T, TFilterData>): ITreeModel<T, TFilterData, TRef>;
    navigate(start?: TRef): ITreeNavigator<T>;
    dispose(): void;
}
export {};
