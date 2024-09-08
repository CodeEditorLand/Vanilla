import { Disposable } from "../../../../base/common/lifecycle.js";
import { ILanguageFeaturesService } from "../../../../editor/common/services/languageFeatures.js";
import { IExtensionManagementService } from "../../../../platform/extensionManagement/common/extensionManagement.js";
import type { IWorkbenchContribution } from "../../../common/contributions.js";
export declare class ExtensionsCompletionItemsProvider extends Disposable implements IWorkbenchContribution {
    private readonly extensionManagementService;
    constructor(extensionManagementService: IExtensionManagementService, languageFeaturesService: ILanguageFeaturesService);
    private provideSupportUntrustedWorkspacesExtensionProposals;
}
