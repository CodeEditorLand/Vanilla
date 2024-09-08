import { Disposable } from "../../../../base/common/lifecycle.js";
import type { ICodeEditor } from "../../../../editor/browser/editorBrowser.js";
import type { IEditorContribution } from "../../../../editor/common/editorCommon.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { INotificationService } from "../../../../platform/notification/common/notification.js";
/**
 * Shows a message when opening a large file which has been memory optimized (and features disabled).
 */
export declare class LargeFileOptimizationsWarner extends Disposable implements IEditorContribution {
    private readonly _editor;
    private readonly _notificationService;
    private readonly _configurationService;
    static readonly ID = "editor.contrib.largeFileOptimizationsWarner";
    constructor(_editor: ICodeEditor, _notificationService: INotificationService, _configurationService: IConfigurationService);
    private _update;
}
