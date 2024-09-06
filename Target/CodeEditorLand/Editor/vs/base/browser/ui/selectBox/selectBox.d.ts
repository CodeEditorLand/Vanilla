import { IContentActionHandler } from "vs/base/browser/formattedTextRenderer";
import { IContextViewProvider } from "vs/base/browser/ui/contextview/contextview";
import { IListStyles } from "vs/base/browser/ui/list/listWidget";
import { Widget } from "vs/base/browser/ui/widget";
import { Event } from "vs/base/common/event";
import { IDisposable } from "vs/base/common/lifecycle";
import "vs/css!./selectBox";
export interface ISelectBoxDelegate extends IDisposable {
    readonly onDidSelect: Event<ISelectData>;
    setOptions(options: ISelectOptionItem[], selected?: number): void;
    select(index: number): void;
    setAriaLabel(label: string): void;
    focus(): void;
    blur(): void;
    setFocusable(focus: boolean): void;
    setEnabled(enabled: boolean): void;
    render(container: HTMLElement): void;
}
export interface ISelectBoxOptions {
    useCustomDrawn?: boolean;
    ariaLabel?: string;
    ariaDescription?: string;
    minBottomMargin?: number;
    optionsAsChildren?: boolean;
}
export interface ISelectOptionItem {
    text: string;
    detail?: string;
    decoratorRight?: string;
    description?: string;
    descriptionIsMarkdown?: boolean;
    descriptionMarkdownActionHandler?: IContentActionHandler;
    isDisabled?: boolean;
}
export interface ISelectBoxStyles extends IListStyles {
    readonly selectBackground: string | undefined;
    readonly selectListBackground: string | undefined;
    readonly selectForeground: string | undefined;
    readonly decoratorRightForeground: string | undefined;
    readonly selectBorder: string | undefined;
    readonly selectListBorder: string | undefined;
    readonly focusBorder: string | undefined;
}
export declare const unthemedSelectBoxStyles: ISelectBoxStyles;
export interface ISelectData {
    selected: string;
    index: number;
}
export declare class SelectBox extends Widget implements ISelectBoxDelegate {
    private selectBoxDelegate;
    constructor(options: ISelectOptionItem[], selected: number, contextViewProvider: IContextViewProvider, styles: ISelectBoxStyles, selectBoxOptions?: ISelectBoxOptions);
    get onDidSelect(): Event<ISelectData>;
    setOptions(options: ISelectOptionItem[], selected?: number): void;
    select(index: number): void;
    setAriaLabel(label: string): void;
    focus(): void;
    blur(): void;
    setFocusable(focusable: boolean): void;
    setEnabled(enabled: boolean): void;
    render(container: HTMLElement): void;
}
