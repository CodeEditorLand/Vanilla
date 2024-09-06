import { Disposable } from "../../../../base/common/lifecycle.js";
import { IWorkbenchContribution } from "../../../common/contributions.js";
import { IEditorResolverService } from "../../../services/editor/common/editorResolverService.js";
import { IWorkbenchEnvironmentService } from "../../../services/environment/common/environmentService.js";
import { IExtensionService } from "../../../services/extensions/common/extensions.js";
export declare class DynamicEditorConfigurations extends Disposable implements IWorkbenchContribution {
    private readonly editorResolverService;
    private readonly environmentService;
    static readonly ID = "workbench.contrib.dynamicEditorConfigurations";
    private static readonly AUTO_LOCK_DEFAULT_ENABLED;
    private static readonly AUTO_LOCK_EXTRA_EDITORS;
    private static readonly AUTO_LOCK_REMOVE_EDITORS;
    private readonly configurationRegistry;
    private autoLockConfigurationNode;
    private defaultBinaryEditorConfigurationNode;
    private editorAssociationsConfigurationNode;
    private editorLargeFileConfirmationConfigurationNode;
    constructor(editorResolverService: IEditorResolverService, extensionService: IExtensionService, environmentService: IWorkbenchEnvironmentService);
    private registerListeners;
    private updateDynamicEditorConfigurations;
}
