import { Disposable } from "vs/base/common/lifecycle";
import { IKeybindingService } from "vs/platform/keybinding/common/keybinding";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
import { IWorkspaceContextService } from "vs/platform/workspace/common/workspace";
import { IWorkbenchContribution } from "vs/workbench/common/contributions";
import { IEditorService } from "vs/workbench/services/editor/common/editorService";
import { IWorkbenchEnvironmentService } from "vs/workbench/services/environment/common/environmentService";
import { ILifecycleService } from "vs/workbench/services/lifecycle/common/lifecycle";
import { IPaneCompositePartService } from "vs/workbench/services/panecomposite/browser/panecomposite";
import { ITextFileService } from "vs/workbench/services/textfile/common/textfiles";
import { IWorkbenchThemeService } from "vs/workbench/services/themes/common/workbenchThemeService";
import { IUserDataProfileService } from "vs/workbench/services/userDataProfile/common/userDataProfile";
export declare class TelemetryContribution extends Disposable implements IWorkbenchContribution {
    private readonly telemetryService;
    private readonly contextService;
    private readonly userDataProfileService;
    private static ALLOWLIST_JSON;
    private static ALLOWLIST_WORKSPACE_JSON;
    constructor(telemetryService: ITelemetryService, contextService: IWorkspaceContextService, lifecycleService: ILifecycleService, editorService: IEditorService, keybindingsService: IKeybindingService, themeService: IWorkbenchThemeService, environmentService: IWorkbenchEnvironmentService, userDataProfileService: IUserDataProfileService, paneCompositeService: IPaneCompositePartService, textFileService: ITextFileService);
    private onTextFileModelResolved;
    private onTextFileModelSaved;
    private getTypeIfSettings;
    private getTelemetryData;
}
