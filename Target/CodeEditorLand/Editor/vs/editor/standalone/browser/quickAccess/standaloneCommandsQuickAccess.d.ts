import { EditorAction } from "vs/editor/browser/editorExtensions";
import { ICodeEditorService } from "vs/editor/browser/services/codeEditorService";
import { IEditor } from "vs/editor/common/editorCommon";
import { AbstractEditorCommandsQuickAccessProvider } from "vs/editor/contrib/quickAccess/browser/commandsQuickAccess";
import { ICommandService } from "vs/platform/commands/common/commands";
import { IDialogService } from "vs/platform/dialogs/common/dialogs";
import { IInstantiationService, ServicesAccessor } from "vs/platform/instantiation/common/instantiation";
import { IKeybindingService } from "vs/platform/keybinding/common/keybinding";
import { ICommandQuickPick } from "vs/platform/quickinput/browser/commandsQuickAccess";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
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
