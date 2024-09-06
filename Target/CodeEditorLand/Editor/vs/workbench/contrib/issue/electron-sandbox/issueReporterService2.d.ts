import { IProductConfiguration } from "vs/base/common/product";
import { IProcessMainService } from "vs/platform/issue/common/issue";
import { INativeHostService } from "vs/platform/native/common/native";
import { IThemeService } from "vs/platform/theme/common/themeService";
import { BaseIssueReporterService } from "vs/workbench/contrib/issue/browser/baseIssueReporterService";
import { IIssueFormService, IssueReporterData } from "vs/workbench/contrib/issue/common/issue";
export declare class IssueReporter2 extends BaseIssueReporterService {
    private readonly nativeHostService;
    private readonly processMainService;
    constructor(disableExtensions: boolean, data: IssueReporterData, os: {
        type: string;
        arch: string;
        release: string;
    }, product: IProductConfiguration, window: Window, nativeHostService: INativeHostService, issueFormService: IIssueFormService, processMainService: IProcessMainService, themeService: IThemeService);
    setEventHandlers(): void;
    submitToGitHub(issueTitle: string, issueBody: string, gitHubDetails: {
        owner: string;
        repositoryName: string;
    }): Promise<boolean>;
    createIssue(): Promise<boolean>;
    writeToClipboard(baseUrl: string, issueBody: string): Promise<string>;
    private updateSystemInfo;
    private updateRestrictedMode;
    private updateUnsupportedMode;
    private updateExperimentsInfo;
}
