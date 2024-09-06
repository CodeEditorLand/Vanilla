import { Disposable } from "vs/base/common/lifecycle";
import { IAccessibilityService } from "vs/platform/accessibility/common/accessibility";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IWorkbenchContribution } from "vs/workbench/common/contributions";
import { IEditorService } from "vs/workbench/services/editor/common/editorService";
export declare class DiffEditorActiveAnnouncementContribution extends Disposable implements IWorkbenchContribution {
    private readonly _editorService;
    private readonly _accessibilityService;
    private readonly _configurationService;
    static readonly ID = "workbench.contrib.diffEditorActiveAnnouncement";
    private _onDidActiveEditorChangeListener?;
    constructor(_editorService: IEditorService, _accessibilityService: IAccessibilityService, _configurationService: IConfigurationService);
    private _updateListener;
}
