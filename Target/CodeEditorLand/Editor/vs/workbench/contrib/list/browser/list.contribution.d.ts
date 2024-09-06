import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IWorkbenchContribution } from "vs/workbench/common/contributions";
export declare class ListContext implements IWorkbenchContribution {
    static readonly ID = "workbench.contrib.listContext";
    constructor(contextKeyService: IContextKeyService);
}
