import { CancellationToken } from "vs/base/common/cancellation";
import { IEditor } from "vs/editor/common/editorCommon";
import { AbstractEditorCommandsQuickAccessProvider } from "vs/editor/contrib/quickAccess/browser/commandsQuickAccess";
import { Action2, IMenuService } from "vs/platform/actions/common/actions";
import { ICommandService } from "vs/platform/commands/common/commands";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IDialogService } from "vs/platform/dialogs/common/dialogs";
import { IInstantiationService, ServicesAccessor } from "vs/platform/instantiation/common/instantiation";
import { IKeybindingService } from "vs/platform/keybinding/common/keybinding";
import { IProductService } from "vs/platform/product/common/productService";
import { ICommandQuickPick } from "vs/platform/quickinput/browser/commandsQuickAccess";
import { DefaultQuickAccessFilterValue } from "vs/platform/quickinput/common/quickAccess";
import { IQuickPickSeparator } from "vs/platform/quickinput/common/quickInput";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
import { IChatAgentService } from "vs/workbench/contrib/chat/common/chatAgents";
import { IAiRelatedInformationService } from "vs/workbench/services/aiRelatedInformation/common/aiRelatedInformation";
import { IEditorGroupsService } from "vs/workbench/services/editor/common/editorGroupsService";
import { IEditorService } from "vs/workbench/services/editor/common/editorService";
import { IExtensionService } from "vs/workbench/services/extensions/common/extensions";
import { IPreferencesService } from "vs/workbench/services/preferences/common/preferences";
export declare class CommandsQuickAccessProvider extends AbstractEditorCommandsQuickAccessProvider {
    private readonly editorService;
    private readonly menuService;
    private readonly extensionService;
    private readonly configurationService;
    private readonly editorGroupService;
    private readonly preferencesService;
    private readonly productService;
    private readonly aiRelatedInformationService;
    private readonly chatAgentService;
    private static AI_RELATED_INFORMATION_MAX_PICKS;
    private static AI_RELATED_INFORMATION_THRESHOLD;
    private static AI_RELATED_INFORMATION_DEBOUNCE;
    private readonly extensionRegistrationRace;
    private useAiRelatedInfo;
    protected get activeTextEditorControl(): IEditor | undefined;
    get defaultFilterValue(): DefaultQuickAccessFilterValue | undefined;
    constructor(editorService: IEditorService, menuService: IMenuService, extensionService: IExtensionService, instantiationService: IInstantiationService, keybindingService: IKeybindingService, commandService: ICommandService, telemetryService: ITelemetryService, dialogService: IDialogService, configurationService: IConfigurationService, editorGroupService: IEditorGroupsService, preferencesService: IPreferencesService, productService: IProductService, aiRelatedInformationService: IAiRelatedInformationService, chatAgentService: IChatAgentService);
    private get configuration();
    private updateOptions;
    protected getCommandPicks(token: CancellationToken): Promise<Array<ICommandQuickPick>>;
    protected hasAdditionalCommandPicks(filter: string, token: CancellationToken): boolean;
    protected getAdditionalCommandPicks(allPicks: ICommandQuickPick[], picksSoFar: ICommandQuickPick[], filter: string, token: CancellationToken): Promise<Array<ICommandQuickPick | IQuickPickSeparator>>;
    private getRelatedInformationPicks;
    private getGlobalCommandPicks;
}
export declare class ShowAllCommandsAction extends Action2 {
    static readonly ID = "workbench.action.showCommands";
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class ClearCommandHistoryAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
