import { StandardKeyboardEvent } from "vs/base/browser/keyboardEvent";
import { IHoverDelegate } from "vs/base/browser/ui/hover/hoverDelegate";
import { IListStyles } from "vs/base/browser/ui/list/listWidget";
import { Event } from "vs/base/common/event";
import { Disposable } from "vs/base/common/lifecycle";
import { IAccessibilityService } from "vs/platform/accessibility/common/accessibility";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IQuickPickItem, QuickPickFocus, QuickPickItem } from "vs/platform/quickinput/common/quickInput";
export declare class QuickInputTree extends Disposable {
    private parent;
    private hoverDelegate;
    private linkOpenerDelegate;
    private readonly accessibilityService;
    private readonly _onKeyDown;
    /**
     * Event that is fired when the tree receives a keydown.
     */
    readonly onKeyDown: Event<StandardKeyboardEvent>;
    private readonly _onLeave;
    /**
     * Event that is fired when the tree would no longer have focus.
     */
    readonly onLeave: Event<void>;
    private readonly _visibleCountObservable;
    onChangedVisibleCount: Event<number>;
    private readonly _allVisibleCheckedObservable;
    onChangedAllVisibleChecked: Event<boolean>;
    private readonly _checkedCountObservable;
    onChangedCheckedCount: Event<number>;
    private readonly _checkedElementsObservable;
    onChangedCheckedElements: Event<IQuickPickItem[]>;
    private readonly _onButtonTriggered;
    onButtonTriggered: any;
    private readonly _onSeparatorButtonTriggered;
    onSeparatorButtonTriggered: any;
    private readonly _elementChecked;
    private readonly _elementCheckedEventBufferer;
    private _hasCheckboxes;
    private readonly _container;
    private readonly _tree;
    private readonly _separatorRenderer;
    private readonly _itemRenderer;
    private _inputElements;
    private _elementTree;
    private _itemElements;
    private readonly _elementDisposable;
    private _lastHover;
    private _lastQueryString;
    constructor(parent: HTMLElement, hoverDelegate: IHoverDelegate, linkOpenerDelegate: (content: string) => void, id: string, instantiationService: IInstantiationService, accessibilityService: IAccessibilityService);
    get onDidChangeFocus(): any;
    get onDidChangeSelection(): any;
    get displayed(): boolean;
    set displayed(value: boolean);
    get scrollTop(): number;
    set scrollTop(scrollTop: number);
    get ariaLabel(): string | null;
    set ariaLabel(label: string | null);
    set enabled(value: boolean);
    private _matchOnDescription;
    get matchOnDescription(): boolean;
    set matchOnDescription(value: boolean);
    private _matchOnDetail;
    get matchOnDetail(): boolean;
    set matchOnDetail(value: boolean);
    private _matchOnLabel;
    get matchOnLabel(): boolean;
    set matchOnLabel(value: boolean);
    private _matchOnLabelMode;
    get matchOnLabelMode(): "fuzzy" | "contiguous";
    set matchOnLabelMode(value: "fuzzy" | "contiguous");
    private _matchOnMeta;
    get matchOnMeta(): boolean;
    set matchOnMeta(value: boolean);
    private _sortByLabel;
    get sortByLabel(): boolean;
    set sortByLabel(value: boolean);
    private _shouldLoop;
    get shouldLoop(): boolean;
    set shouldLoop(value: boolean);
    private _registerListeners;
    private _registerOnKeyDown;
    private _registerOnContainerClick;
    private _registerOnMouseMiddleClick;
    private _registerOnTreeModelChanged;
    private _registerOnElementChecked;
    private _registerOnContextMenu;
    private _registerHoverListeners;
    /**
     * Register's focus change and mouse events so that we can track when items inside of a
     * separator's section are focused or hovered so that we can display the separator's actions
     */
    private _registerSeparatorActionShowingListeners;
    private _registerSelectionChangeListener;
    setAllVisibleChecked(checked: boolean): void;
    setElements(inputElements: QuickPickItem[]): void;
    setFocusedElements(items: IQuickPickItem[]): void;
    getActiveDescendant(): any;
    setSelectedElements(items: IQuickPickItem[]): void;
    getCheckedElements(): IQuickPickItem[];
    setCheckedElements(items: IQuickPickItem[]): void;
    focus(what: QuickPickFocus): void;
    clearFocus(): void;
    domFocus(): void;
    layout(maxHeight?: number): void;
    filter(query: string): boolean;
    toggleCheckbox(): void;
    style(styles: IListStyles): void;
    toggleHover(): void;
    private _setElementsToTree;
    private _allVisibleChecked;
    private _updateCheckedObservables;
    /**
     * Disposes of the hover and shows a new one for the given index if it has a tooltip.
     * @param element The element to show the hover for
     */
    private showHover;
}
