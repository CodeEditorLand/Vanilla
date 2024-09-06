import "vs/css!./iconSelectBox";
import * as dom from "vs/base/browser/dom";
import { IInputBoxStyles, InputBox } from "vs/base/browser/ui/inputbox/inputBox";
import { Disposable } from "vs/base/common/lifecycle";
import { ThemeIcon } from "vs/base/common/themables";
export interface IIconSelectBoxOptions {
    readonly icons: ThemeIcon[];
    readonly inputBoxStyles: IInputBoxStyles;
    readonly showIconInfo?: boolean;
}
export declare class IconSelectBox extends Disposable {
    private readonly options;
    private static InstanceCount;
    readonly domId: string;
    readonly domNode: HTMLElement;
    private _onDidSelect;
    readonly onDidSelect: any;
    private renderedIcons;
    private focusedItemIndex;
    private numberOfElementsPerRow;
    protected inputBox: InputBox | undefined;
    private scrollableElement;
    private iconsContainer;
    private iconIdElement;
    private readonly iconContainerWidth;
    private readonly iconContainerHeight;
    constructor(options: IIconSelectBoxOptions);
    private create;
    private renderIcons;
    private focusIcon;
    private reveal;
    private matchesContiguous;
    layout(dimension: dom.Dimension): void;
    getFocus(): number[];
    setSelection(index: number): void;
    clearInput(): void;
    focus(): void;
    focusNext(): void;
    focusPrevious(): void;
    focusNextRow(): void;
    focusPreviousRow(): void;
    getFocusedIcon(): ThemeIcon;
}
