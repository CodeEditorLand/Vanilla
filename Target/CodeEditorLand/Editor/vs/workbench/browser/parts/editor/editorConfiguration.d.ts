import { Disposable } from "vs/base/common/lifecycle";
import { IWorkbenchContribution } from "vs/workbench/common/contributions";
import { IEditorResolverService } from "vs/workbench/services/editor/common/editorResolverService";
import { IWorkbenchEnvironmentService } from "vs/workbench/services/environment/common/environmentService";
import { IExtensionService } from "vs/workbench/services/extensions/common/extensions";
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
