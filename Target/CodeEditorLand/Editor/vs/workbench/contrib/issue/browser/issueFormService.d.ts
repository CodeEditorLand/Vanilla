import "vs/css!./media/issueReporter";
import { IMenuService } from "vs/platform/actions/common/actions";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IDialogService } from "vs/platform/dialogs/common/dialogs";
import { ExtensionIdentifierSet } from "vs/platform/extensions/common/extensions";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { ILogService } from "vs/platform/log/common/log";
import { IRectangle } from "vs/platform/window/common/window";
import { IIssueFormService, IssueReporterData } from "vs/workbench/contrib/issue/common/issue";
import { IAuxiliaryWindowService } from "vs/workbench/services/auxiliaryWindow/browser/auxiliaryWindowService";
import { IHostService } from "vs/workbench/services/host/browser/host";
export interface IssuePassData {
    issueTitle: string;
    issueBody: string;
}
export declare class IssueFormService implements IIssueFormService {
    protected readonly instantiationService: IInstantiationService;
    protected readonly auxiliaryWindowService: IAuxiliaryWindowService;
    protected readonly menuService: IMenuService;
    protected readonly contextKeyService: IContextKeyService;
    protected readonly logService: ILogService;
    protected readonly dialogService: IDialogService;
    protected readonly hostService: IHostService;
    readonly _serviceBrand: undefined;
    protected currentData: IssueReporterData | undefined;
    protected issueReporterWindow: Window | null;
    protected extensionIdentifierSet: ExtensionIdentifierSet;
    protected arch: string;
    protected release: string;
    protected type: string;
    constructor(instantiationService: IInstantiationService, auxiliaryWindowService: IAuxiliaryWindowService, menuService: IMenuService, contextKeyService: IContextKeyService, logService: ILogService, dialogService: IDialogService, hostService: IHostService);
    openReporter(data: IssueReporterData): Promise<void>;
    openAuxIssueReporter(data: IssueReporterData, bounds?: IRectangle): Promise<void>;
    sendReporterMenu(extensionId: string): Promise<IssueReporterData | undefined>;
    closeReporter(): Promise<void>;
    reloadWithExtensionsDisabled(): Promise<void>;
    showConfirmCloseDialog(): Promise<void>;
    showClipboardDialog(): Promise<boolean>;
    hasToReload(data: IssueReporterData): boolean;
}
