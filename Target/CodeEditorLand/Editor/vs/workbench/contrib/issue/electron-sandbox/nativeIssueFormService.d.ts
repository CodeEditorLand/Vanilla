import "vs/css!./media/newIssueReporter";
import { IMenuService } from "vs/platform/actions/common/actions";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IDialogService } from "vs/platform/dialogs/common/dialogs";
import { INativeEnvironmentService } from "vs/platform/environment/common/environment";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { ILogService } from "vs/platform/log/common/log";
import { INativeHostService } from "vs/platform/native/common/native";
import { IssueFormService } from "vs/workbench/contrib/issue/browser/issueFormService";
import { IIssueFormService, IssueReporterData } from "vs/workbench/contrib/issue/common/issue";
import { IAuxiliaryWindowService } from "vs/workbench/services/auxiliaryWindow/browser/auxiliaryWindowService";
import { IHostService } from "vs/workbench/services/host/browser/host";
export declare class NativeIssueFormService extends IssueFormService implements IIssueFormService {
    private readonly nativeHostService;
    private readonly environmentService;
    constructor(instantiationService: IInstantiationService, auxiliaryWindowService: IAuxiliaryWindowService, logService: ILogService, dialogService: IDialogService, menuService: IMenuService, contextKeyService: IContextKeyService, hostService: IHostService, nativeHostService: INativeHostService, environmentService: INativeEnvironmentService);
    openReporter(data: IssueReporterData): Promise<void>;
}
