import { Disposable } from "vs/base/common/lifecycle";
import { ILanguageFeaturesService } from "vs/editor/common/services/languageFeatures";
import { IExtensionManagementService } from "vs/platform/extensionManagement/common/extensionManagement";
import { IWorkbenchContribution } from "vs/workbench/common/contributions";
export declare class ExtensionsCompletionItemsProvider extends Disposable implements IWorkbenchContribution {
    private readonly extensionManagementService;
    constructor(extensionManagementService: IExtensionManagementService, languageFeaturesService: ILanguageFeaturesService);
    private provideSupportUntrustedWorkspacesExtensionProposals;
}
