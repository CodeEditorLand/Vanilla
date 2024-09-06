import { CancellationToken } from "vs/base/common/cancellation";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { ILayoutService } from "vs/platform/layout/browser/layoutService";
import { IQuickInputControllerHost, QuickInputController } from "vs/platform/quickinput/browser/quickInputController";
import { IQuickAccessController } from "vs/platform/quickinput/common/quickAccess";
import { IInputBox, IInputOptions, IKeyMods, IPickOptions, IQuickInputButton, IQuickInputService, IQuickNavigateConfiguration, IQuickPick, IQuickPickItem, IQuickWidget, QuickPickInput } from "vs/platform/quickinput/common/quickInput";
import { IThemeService, Themable } from "vs/platform/theme/common/themeService";
import { IQuickInputOptions } from "./quickInput";
export declare class QuickInputService extends Themable implements IQuickInputService {
    private readonly instantiationService;
    protected readonly contextKeyService: IContextKeyService;
    protected readonly layoutService: ILayoutService;
    protected readonly configurationService: IConfigurationService;
    readonly _serviceBrand: undefined;
    get backButton(): IQuickInputButton;
    private readonly _onShow;
    readonly onShow: any;
    private readonly _onHide;
    readonly onHide: any;
    private _controller;
    private get controller();
    private get hasController();
    get currentQuickInput(): any;
    private _quickAccess;
    get quickAccess(): IQuickAccessController;
    private readonly contexts;
    constructor(instantiationService: IInstantiationService, contextKeyService: IContextKeyService, themeService: IThemeService, layoutService: ILayoutService, configurationService: IConfigurationService);
    protected createController(host?: IQuickInputControllerHost, options?: Partial<IQuickInputOptions>): QuickInputController;
    private setContextKey;
    private resetContextKeys;
    pick<T extends IQuickPickItem, O extends IPickOptions<T>>(picks: Promise<QuickPickInput<T>[]> | QuickPickInput<T>[], options?: O, token?: CancellationToken): Promise<(O extends {
        canPickMany: true;
    } ? T[] : T) | undefined>;
    input(options?: IInputOptions, token?: CancellationToken): Promise<string | undefined>;
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
    focus(): void;
    toggle(): void;
    navigate(next: boolean, quickNavigate?: IQuickNavigateConfiguration): void;
    accept(keyMods?: IKeyMods): any;
    back(): any;
    cancel(): any;
    updateStyles(): void;
    private computeStyles;
}
