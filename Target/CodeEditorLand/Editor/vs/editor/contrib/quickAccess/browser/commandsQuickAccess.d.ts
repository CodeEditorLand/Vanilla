import type { ICommandService } from "../../../../platform/commands/common/commands.js";
import type { IDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import type { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import type { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { AbstractCommandsQuickAccessProvider, type ICommandQuickPick, type ICommandsQuickAccessOptions } from "../../../../platform/quickinput/browser/commandsQuickAccess.js";
import type { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import type { IEditor } from "../../../common/editorCommon.js";
export declare abstract class AbstractEditorCommandsQuickAccessProvider extends AbstractCommandsQuickAccessProvider {
    constructor(options: ICommandsQuickAccessOptions, instantiationService: IInstantiationService, keybindingService: IKeybindingService, commandService: ICommandService, telemetryService: ITelemetryService, dialogService: IDialogService);
    /**
     * Subclasses to provide the current active editor control.
     */
    protected abstract activeTextEditorControl: IEditor | undefined;
    protected getCodeEditorCommandPicks(): ICommandQuickPick[];
}
