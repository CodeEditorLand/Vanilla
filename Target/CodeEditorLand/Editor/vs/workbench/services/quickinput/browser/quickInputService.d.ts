import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IKeybindingService } from "vs/platform/keybinding/common/keybinding";
import { ILayoutService } from "vs/platform/layout/browser/layoutService";
import { QuickInputController } from "vs/platform/quickinput/browser/quickInputController";
import { QuickInputService as BaseQuickInputService } from "vs/platform/quickinput/browser/quickInputService";
import { IThemeService } from "vs/platform/theme/common/themeService";
export declare class QuickInputService extends BaseQuickInputService {
    private readonly keybindingService;
    private readonly inQuickInputContext;
    constructor(configurationService: IConfigurationService, instantiationService: IInstantiationService, keybindingService: IKeybindingService, contextKeyService: IContextKeyService, themeService: IThemeService, layoutService: ILayoutService);
    private registerListeners;
    protected createController(): QuickInputController;
}
