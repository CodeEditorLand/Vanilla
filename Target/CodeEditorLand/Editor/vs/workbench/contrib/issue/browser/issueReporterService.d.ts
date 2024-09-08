import type { IProductConfiguration } from "../../../../base/common/product.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { IIssueFormService, type IssueReporterData } from "../common/issue.js";
import { BaseIssueReporterService } from "./baseIssueReporterService.js";
export declare class IssueWebReporter extends BaseIssueReporterService {
    constructor(disableExtensions: boolean, data: IssueReporterData, os: {
        type: string;
        arch: string;
        release: string;
    }, product: IProductConfiguration, window: Window, issueFormService: IIssueFormService, themeService: IThemeService);
    setEventHandlers(): void;
}