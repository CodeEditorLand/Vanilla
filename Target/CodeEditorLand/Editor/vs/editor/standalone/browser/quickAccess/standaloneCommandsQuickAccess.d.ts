import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { IDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import { IInstantiationService, type ServicesAccessor } from "../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import type { ICommandQuickPick } from "../../../../platform/quickinput/browser/commandsQuickAccess.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { EditorAction } from "../../../browser/editorExtensions.js";
import { ICodeEditorService } from "../../../browser/services/codeEditorService.js";
import type { IEditor } from "../../../common/editorCommon.js";
import { AbstractEditorCommandsQuickAccessProvider } from "../../../contrib/quickAccess/browser/commandsQuickAccess.js";
export declare class StandaloneCommandsQuickAccessProvider extends AbstractEditorCommandsQuickAccessProvider {
    private readonly codeEditorService;
    protected get activeTextEditorControl(): IEditor | undefined;
    constructor(instantiationService: IInstantiationService, codeEditorService: ICodeEditorService, keybindingService: IKeybindingService, commandService: ICommandService, telemetryService: ITelemetryService, dialogService: IDialogService);
    protected getCommandPicks(): Promise<Array<ICommandQuickPick>>;
    protected hasAdditionalCommandPicks(): boolean;
    protected getAdditionalCommandPicks(): Promise<ICommandQuickPick[]>;
}
export declare class GotoLineAction extends EditorAction {
    static readonly ID = "editor.action.quickCommand";
    constructor();
    run(accessor: ServicesAccessor): void;
}
