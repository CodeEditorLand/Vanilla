import { IContextMenuProvider } from "vs/base/browser/contextmenu";
import { ActionBar, ActionsOrientation, IActionViewItemProvider } from "vs/base/browser/ui/actionbar/actionbar";
import { AnchorAlignment } from "vs/base/browser/ui/contextview/contextview";
import { Action, IAction, IActionRunner } from "vs/base/common/actions";
import { ResolvedKeybinding } from "vs/base/common/keybindings";
import { Disposable } from "vs/base/common/lifecycle";
import { ThemeIcon } from "vs/base/common/themables";
import "vs/css!./toolbar";
import { IHoverDelegate } from "vs/base/browser/ui/hover/hoverDelegate";
export interface IToolBarOptions {
    orientation?: ActionsOrientation;
    actionViewItemProvider?: IActionViewItemProvider;
    ariaLabel?: string;
    getKeyBinding?: (action: IAction) => ResolvedKeybinding | undefined;
    actionRunner?: IActionRunner;
    toggleMenuTitle?: string;
    anchorAlignmentProvider?: () => AnchorAlignment;
    renderDropdownAsChildElement?: boolean;
    moreIcon?: ThemeIcon;
    allowContextMenu?: boolean;
    skipTelemetry?: boolean;
    hoverDelegate?: IHoverDelegate;
    /**
     * If true, toggled primary items are highlighted with a background color.
     */
    highlightToggledItems?: boolean;
    /**
     * Render action with icons (default: `true`)
     */
    icon?: boolean;
    /**
     * Render action with label (default: `false`)
     */
    label?: boolean;
}
/**
 * A widget that combines an action bar for primary actions and a dropdown for secondary actions.
 */
export declare class ToolBar extends Disposable {
    private options;
    protected readonly actionBar: ActionBar;
    private toggleMenuAction;
    private toggleMenuActionViewItem;
    private submenuActionViewItems;
    private hasSecondaryActions;
    private readonly element;
    private _onDidChangeDropdownVisibility;
    readonly onDidChangeDropdownVisibility: any;
    private readonly disposables;
    constructor(container: HTMLElement, contextMenuProvider: IContextMenuProvider, options?: IToolBarOptions);
    set actionRunner(actionRunner: IActionRunner);
    get actionRunner(): IActionRunner;
    set context(context: unknown);
    getElement(): HTMLElement;
    focus(): void;
    getItemsWidth(): number;
    getItemAction(indexOrElement: number | HTMLElement): any;
    getItemWidth(index: number): number;
    getItemsLength(): number;
    setAriaLabel(label: string): void;
    setActions(primaryActions: ReadonlyArray<IAction>, secondaryActions?: ReadonlyArray<IAction>): void;
    isEmpty(): boolean;
    private getKeybindingLabel;
    private clear;
    dispose(): void;
}
export declare class ToggleMenuAction extends Action {
    static readonly ID = "toolbar.toggle.more";
    private _menuActions;
    private toggleDropdownMenu;
    constructor(toggleDropdownMenu: () => void, title?: string);
    run(): Promise<void>;
    get menuActions(): ReadonlyArray<IAction>;
    set menuActions(actions: ReadonlyArray<IAction>);
}
