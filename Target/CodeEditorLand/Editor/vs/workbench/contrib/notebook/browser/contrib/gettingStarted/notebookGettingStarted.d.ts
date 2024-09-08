import { Disposable } from "../../../../../../base/common/lifecycle.js";
import { ICommandService } from "../../../../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../../../../platform/configuration/common/configuration.js";
import { IContextKeyService } from "../../../../../../platform/contextkey/common/contextkey.js";
import { IStorageService } from "../../../../../../platform/storage/common/storage.js";
import { type IWorkbenchContribution } from "../../../../../common/contributions.js";
import { IEditorService } from "../../../../../services/editor/common/editorService.js";
/**
 * Sets a context key when a notebook has ever been opened by the user
 */
export declare class NotebookGettingStarted extends Disposable implements IWorkbenchContribution {
    constructor(_editorService: IEditorService, _storageService: IStorageService, _contextKeyService: IContextKeyService, _commandService: ICommandService, _configurationService: IConfigurationService);
}
