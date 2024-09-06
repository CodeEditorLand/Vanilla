import { ILogService } from "vs/platform/log/common/log";
import { IWorkbenchContribution } from "vs/workbench/common/contributions";
import { ILanguageModelToolsService } from "vs/workbench/contrib/chat/common/languageModelToolsService";
export declare class LanguageModelToolsExtensionPointHandler implements IWorkbenchContribution {
    static readonly ID = "workbench.contrib.toolsExtensionPointHandler";
    private _registrationDisposables;
    constructor(languageModelToolsService: ILanguageModelToolsService, logService: ILogService);
}
