import { ICommandService } from "vs/platform/commands/common/commands";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { ILabelService } from "vs/platform/label/common/label";
import { IQuickInputService } from "vs/platform/quickinput/common/quickInput";
import { IStorageService } from "vs/platform/storage/common/storage";
import { IWorkspaceContextService } from "vs/platform/workspace/common/workspace";
import { BaseConfigurationResolverService } from "vs/workbench/services/configurationResolver/browser/baseConfigurationResolverService";
import { IEditorService } from "vs/workbench/services/editor/common/editorService";
import { INativeWorkbenchEnvironmentService } from "vs/workbench/services/environment/electron-sandbox/environmentService";
import { IShellEnvironmentService } from "vs/workbench/services/environment/electron-sandbox/shellEnvironmentService";
import { IExtensionService } from "vs/workbench/services/extensions/common/extensions";
import { IPathService } from "vs/workbench/services/path/common/pathService";
export declare class ConfigurationResolverService extends BaseConfigurationResolverService {
    constructor(editorService: IEditorService, environmentService: INativeWorkbenchEnvironmentService, configurationService: IConfigurationService, commandService: ICommandService, workspaceContextService: IWorkspaceContextService, quickInputService: IQuickInputService, labelService: ILabelService, shellEnvironmentService: IShellEnvironmentService, pathService: IPathService, extensionService: IExtensionService, storageService: IStorageService);
}
