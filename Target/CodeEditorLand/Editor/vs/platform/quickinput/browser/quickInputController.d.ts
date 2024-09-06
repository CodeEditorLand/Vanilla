import * as dom from "vs/base/browser/dom";
import { CancellationToken } from "vs/base/common/cancellation";
import { Disposable } from "vs/base/common/lifecycle";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { ILayoutService } from "vs/platform/layout/browser/layoutService";
import { IQuickInputOptions, IQuickInputStyles } from "vs/platform/quickinput/browser/quickInput";
import { IInputBox, IInputOptions, IKeyMods, IPickOptions, IQuickNavigateConfiguration, IQuickPick, IQuickPickItem, IQuickWidget, QuickInputHideReason, QuickPickInput } from "vs/platform/quickinput/common/quickInput";
import "vs/platform/quickinput/browser/quickInputActions";
export declare class QuickInputController extends Disposable {
    private options;
    private readonly layoutService;
    private readonly instantiationService;
    private readonly contextKeyService;
    private static readonly MAX_WIDTH;
    private idPrefix;
    private ui;
    private dimension?;
    private titleBarOffset?;
    private enabled;
    private readonly onDidAcceptEmitter;
    private readonly onDidCustomEmitter;
    private readonly onDidTriggerButtonEmitter;
    private keyMods;
    private controller;
    get currentQuickInput(): any;
    private _container;
    get container(): HTMLElement;
    private styles;
    private onShowEmitter;
    readonly onShow: any;
    private onHideEmitter;
    readonly onHide: any;
    private previousFocusElement?;
    private readonly inQuickInputContext;
    private readonly quickInputTypeContext;
    private readonly endOfQuickInputBoxContext;
    constructor(options: IQuickInputOptions, layoutService: ILayoutService, instantiationService: IInstantiationService, contextKeyService: IContextKeyService);
    private registerKeyModsListeners;
    private getUI;
    private reparentUI;
    pick<T extends IQuickPickItem, O extends IPickOptions<T>>(picks: Promise<QuickPickInput<T>[]> | QuickPickInput<T>[], options?: IPickOptions<T>, token?: CancellationToken): Promise<(O extends {
        canPickMany: true;
    } ? T[] : T) | undefined>;
    private setValidationOnInput;
    input(options?: IInputOptions, token?: CancellationToken): Promise<string | undefined>;
    backButton: any;
    createQuickPick<T extends IQuickPickItem>(options: {
        useSeparators: true;
    }): IQuickPick<T, {
        useSeparators: true;
    }>;
    createQuickPick<T extends IQuickPickItem>(options?: {
        useSeparators: boolean;
    }): IQuickPick<T, {
        useSeparators: false;
    }>;
    createInputBox(): IInputBox;
    createQuickWidget(): IQuickWidget;
    private show;
    isVisible(): boolean;
    private setVisibilities;
    private setEnabled;
    hide(reason?: QuickInputHideReason): void;
    focus(): void;
    toggle(): void;
    navigate(next: boolean, quickNavigate?: IQuickNavigateConfiguration): void;
    accept(keyMods?: IKeyMods): Promise<void>;
    back(): Promise<void>;
    cancel(): Promise<void>;
    layout(dimension: dom.IDimension, titleBarOffset: number): void;
    private updateLayout;
    applyStyles(styles: IQuickInputStyles): void;
    private updateStyles;
}
export interface IQuickInputControllerHost extends ILayoutService {
}
