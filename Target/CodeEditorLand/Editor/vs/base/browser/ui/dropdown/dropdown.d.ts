import { IContextMenuProvider } from "vs/base/browser/contextmenu";
import { IMenuOptions } from "vs/base/browser/ui/menu/menu";
import { ActionRunner, IAction } from "vs/base/common/actions";
import { IDisposable } from "vs/base/common/lifecycle";
import "vs/css!./dropdown";
export interface ILabelRenderer {
    (container: HTMLElement): IDisposable | null;
}
interface IBaseDropdownOptions {
    label?: string;
    labelRenderer?: ILabelRenderer;
}
declare class BaseDropdown extends ActionRunner {
    private _element;
    private boxContainer?;
    private _label?;
    private contents?;
    private visible;
    private _onDidChangeVisibility;
    readonly onDidChangeVisibility: any;
    private hover;
    constructor(container: HTMLElement, options: IBaseDropdownOptions);
    get element(): HTMLElement;
    get label(): any;
    set tooltip(tooltip: string);
    show(): void;
    hide(): void;
    isVisible(): boolean;
    protected onEvent(_e: Event, activeElement: HTMLElement): void;
    dispose(): void;
}
export interface IActionProvider {
    getActions(): readonly IAction[];
}
export interface IDropdownMenuOptions extends IBaseDropdownOptions {
    contextMenuProvider: IContextMenuProvider;
    readonly actions?: IAction[];
    readonly actionProvider?: IActionProvider;
    menuClassName?: string;
    menuAsChild?: boolean;
    readonly skipTelemetry?: boolean;
}
export declare class DropdownMenu extends BaseDropdown {
    private readonly _options;
    private _menuOptions;
    private _actions;
    constructor(container: HTMLElement, _options: IDropdownMenuOptions);
    set menuOptions(options: IMenuOptions | undefined);
    get menuOptions(): IMenuOptions | undefined;
    private get actions();
    private set actions(value);
    show(): void;
    hide(): void;
    private onHide;
}
export {};
