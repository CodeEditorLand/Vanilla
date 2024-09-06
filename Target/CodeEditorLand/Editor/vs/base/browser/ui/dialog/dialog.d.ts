import { StandardKeyboardEvent } from "vs/base/browser/keyboardEvent";
import { IButtonStyles } from "vs/base/browser/ui/button/button";
import { IInputBoxStyles } from "vs/base/browser/ui/inputbox/inputBox";
import { ICheckboxStyles } from "vs/base/browser/ui/toggle/toggle";
import { Disposable } from "vs/base/common/lifecycle";
import { ThemeIcon } from "vs/base/common/themables";
import "vs/css!./dialog";
export interface IDialogInputOptions {
    readonly placeholder?: string;
    readonly type?: "text" | "password";
    readonly value?: string;
}
export interface IDialogOptions {
    readonly cancelId?: number;
    readonly detail?: string;
    readonly checkboxLabel?: string;
    readonly checkboxChecked?: boolean;
    readonly type?: "none" | "info" | "error" | "question" | "warning" | "pending";
    readonly inputs?: IDialogInputOptions[];
    readonly keyEventProcessor?: (event: StandardKeyboardEvent) => void;
    readonly renderBody?: (container: HTMLElement) => void;
    readonly icon?: ThemeIcon;
    readonly buttonDetails?: string[];
    readonly disableCloseAction?: boolean;
    readonly disableDefaultAction?: boolean;
    readonly buttonStyles: IButtonStyles;
    readonly checkboxStyles: ICheckboxStyles;
    readonly inputBoxStyles: IInputBoxStyles;
    readonly dialogStyles: IDialogStyles;
}
export interface IDialogResult {
    readonly button: number;
    readonly checkboxChecked?: boolean;
    readonly values?: string[];
}
export interface IDialogStyles {
    readonly dialogForeground: string | undefined;
    readonly dialogBackground: string | undefined;
    readonly dialogShadow: string | undefined;
    readonly dialogBorder: string | undefined;
    readonly errorIconForeground: string | undefined;
    readonly warningIconForeground: string | undefined;
    readonly infoIconForeground: string | undefined;
    readonly textLinkForeground: string | undefined;
}
export declare class Dialog extends Disposable {
    private container;
    private message;
    private readonly options;
    private readonly element;
    private readonly shadowElement;
    private modalElement;
    private readonly buttonsContainer;
    private readonly messageDetailElement;
    private readonly messageContainer;
    private readonly iconElement;
    private readonly checkbox;
    private readonly toolbarContainer;
    private buttonBar;
    private focusToReturn;
    private readonly inputs;
    private readonly buttons;
    private readonly buttonStyles;
    constructor(container: HTMLElement, message: string, buttons: string[] | undefined, options: IDialogOptions);
    private getIconAriaLabel;
    updateMessage(message: string): void;
    show(): Promise<IDialogResult>;
    private applyStyles;
    dispose(): void;
    private rearrangeButtons;
}
