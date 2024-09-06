import { IProductConfiguration } from "vs/base/common/product";
import { IThemeService } from "vs/platform/theme/common/themeService";
import { BaseIssueReporterService } from "vs/workbench/contrib/issue/browser/baseIssueReporterService";
import { IIssueFormService, IssueReporterData } from "vs/workbench/contrib/issue/common/issue";
export declare class IssueWebReporter extends BaseIssueReporterService {
    constructor(disableExtensions: boolean, data: IssueReporterData, os: {
        type: string;
        arch: string;
        release: string;
    }, product: IProductConfiguration, window: Window, issueFormService: IIssueFormService, themeService: IThemeService);
    setEventHandlers(): void;
}
