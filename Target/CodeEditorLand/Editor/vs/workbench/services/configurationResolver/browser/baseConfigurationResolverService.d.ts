import type { IStringDictionary } from "../../../../base/common/collections.js";
import type { IProcessEnvironment } from "../../../../base/common/platform.js";
import type { ICommandService } from "../../../../platform/commands/common/commands.js";
import { ConfigurationTarget, type IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import type { ILabelService } from "../../../../platform/label/common/label.js";
import type { IQuickInputService } from "../../../../platform/quickinput/common/quickInput.js";
import { type IStorageService } from "../../../../platform/storage/common/storage.js";
import { type IWorkspaceContextService, type IWorkspaceFolder } from "../../../../platform/workspace/common/workspace.js";
import type { IEditorService } from "../../editor/common/editorService.js";
import type { IExtensionService } from "../../extensions/common/extensions.js";
import type { IPathService } from "../../path/common/pathService.js";
import { AbstractVariableResolverService } from "../common/variableResolver.js";
export declare abstract class BaseConfigurationResolverService extends AbstractVariableResolverService {
    private readonly configurationService;
    private readonly commandService;
    private readonly workspaceContextService;
    private readonly quickInputService;
    private readonly labelService;
    private readonly pathService;
    private readonly storageService;
    static readonly INPUT_OR_COMMAND_VARIABLES_PATTERN: RegExp;
    private userInputAccessQueue;
    constructor(context: {
        getAppRoot: () => string | undefined;
        getExecPath: () => string | undefined;
    }, envVariablesPromise: Promise<IProcessEnvironment>, editorService: IEditorService, configurationService: IConfigurationService, commandService: ICommandService, workspaceContextService: IWorkspaceContextService, quickInputService: IQuickInputService, labelService: ILabelService, pathService: IPathService, extensionService: IExtensionService, storageService: IStorageService);
    resolveWithInteractionReplace(folder: IWorkspaceFolder | undefined, config: any, section?: string, variables?: IStringDictionary<string>, target?: ConfigurationTarget): Promise<any>;
    resolveWithInteraction(folder: IWorkspaceFolder | undefined, config: any, section?: string, variables?: IStringDictionary<string>, target?: ConfigurationTarget): Promise<Map<string, string> | undefined>;
    /**
     * Add all items from newMapping to fullMapping. Returns false if newMapping is undefined.
     */
    private updateMapping;
    /**
     * Finds and executes all input and command variables in the given configuration and returns their values as a dictionary.
     * Please note: this method does not substitute the input or command variables (so the configuration is not modified).
     * The returned dictionary can be passed to "resolvePlatform" for the actual substitution.
     * See #6569.
     *
     * @param variableToCommandMap Aliases for commands
     */
    private resolveWithInputAndCommands;
    /**
     * Recursively finds all command or input variables in object and pushes them into variables.
     * @param object object is searched for variables.
     * @param variables All found variables are returned in variables.
     */
    private findVariables;
    /**
     * Takes the provided input info and shows the quick pick so the user can provide the value for the input
     * @param variable Name of the input variable.
     * @param inputInfos Information about each possible input variable.
     */
    private showUserInput;
    private storeInputLru;
    private readInputLru;
}
