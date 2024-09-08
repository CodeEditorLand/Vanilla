import type { UriComponents } from "../../../base/common/uri.js";
import type { ISandboxConfiguration } from "../../../base/parts/sandbox/common/sandboxTypes.js";
import type { PerformanceInfo, SystemInfo } from "../../diagnostics/common/diagnostics.js";
export interface WindowStyles {
    backgroundColor?: string;
    color?: string;
}
export interface WindowData {
    styles: WindowStyles;
    zoomLevel: number;
}
export declare enum OldIssueType {
    Bug = 0,
    PerformanceIssue = 1,
    FeatureRequest = 2
}
export declare enum IssueSource {
    VSCode = "vscode",
    Extension = "extension",
    Marketplace = "marketplace"
}
export interface OldIssueReporterStyles extends WindowStyles {
    textLinkColor?: string;
    textLinkActiveForeground?: string;
    inputBackground?: string;
    inputForeground?: string;
    inputBorder?: string;
    inputErrorBorder?: string;
    inputErrorBackground?: string;
    inputErrorForeground?: string;
    inputActiveBorder?: string;
    buttonBackground?: string;
    buttonForeground?: string;
    buttonHoverBackground?: string;
    sliderBackgroundColor?: string;
    sliderHoverColor?: string;
    sliderActiveColor?: string;
}
export interface OldIssueReporterExtensionData {
    name: string;
    publisher: string | undefined;
    version: string;
    id: string;
    isTheme: boolean;
    isBuiltin: boolean;
    displayName: string | undefined;
    repositoryUrl: string | undefined;
    bugsUrl: string | undefined;
    extensionData?: string;
    extensionTemplate?: string;
    data?: string;
    uri?: UriComponents;
}
export interface OldIssueReporterData extends WindowData {
    styles: OldIssueReporterStyles;
    enabledExtensions: OldIssueReporterExtensionData[];
    issueType?: OldIssueType;
    issueSource?: IssueSource;
    extensionId?: string;
    experiments?: string;
    restrictedMode: boolean;
    isUnsupported: boolean;
    githubAccessToken: string;
    issueTitle?: string;
    issueBody?: string;
    data?: string;
    uri?: UriComponents;
}
export interface ISettingSearchResult {
    extensionId: string;
    key: string;
    score: number;
}
export interface ProcessExplorerStyles extends WindowStyles {
    listHoverBackground?: string;
    listHoverForeground?: string;
    listFocusBackground?: string;
    listFocusForeground?: string;
    listFocusOutline?: string;
    listActiveSelectionBackground?: string;
    listActiveSelectionForeground?: string;
    listHoverOutline?: string;
    scrollbarShadowColor?: string;
    scrollbarSliderBackgroundColor?: string;
    scrollbarSliderHoverBackgroundColor?: string;
    scrollbarSliderActiveBackgroundColor?: string;
}
export interface ProcessExplorerData extends WindowData {
    pid: number;
    styles: ProcessExplorerStyles;
    platform: string;
    applicationName: string;
}
export interface OldIssueReporterWindowConfiguration extends ISandboxConfiguration {
    disableExtensions: boolean;
    data: OldIssueReporterData;
    os: {
        type: string;
        arch: string;
        release: string;
    };
}
export interface ProcessExplorerWindowConfiguration extends ISandboxConfiguration {
    data: ProcessExplorerData;
}
export declare const IIssueMainService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IIssueMainService>;
export interface IIssueMainService {
    readonly _serviceBrand: undefined;
    openReporter(data: OldIssueReporterData): Promise<void>;
    $reloadWithExtensionsDisabled(): Promise<void>;
    $showConfirmCloseDialog(): Promise<void>;
    $showClipboardDialog(): Promise<boolean>;
    $sendReporterMenu(extensionId: string, extensionName: string): Promise<OldIssueReporterData | undefined>;
    $closeReporter(): Promise<void>;
}
export declare const IProcessMainService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IProcessMainService>;
export interface IProcessMainService {
    readonly _serviceBrand: undefined;
    getSystemStatus(): Promise<string>;
    stopTracing(): Promise<void>;
    openProcessExplorer(data: ProcessExplorerData): Promise<void>;
    $getSystemInfo(): Promise<SystemInfo>;
    $getPerformanceInfo(): Promise<PerformanceInfo>;
}
