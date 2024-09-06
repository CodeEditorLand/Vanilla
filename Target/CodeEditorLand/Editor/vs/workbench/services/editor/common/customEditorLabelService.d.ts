import { Event } from "vs/base/common/event";
import { Disposable } from "vs/base/common/lifecycle";
import { URI } from "vs/base/common/uri";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IWorkspaceContextService } from "vs/platform/workspace/common/workspace";
export declare class CustomEditorLabelService extends Disposable implements ICustomEditorLabelService {
    private readonly configurationService;
    private readonly workspaceContextService;
    readonly _serviceBrand: undefined;
    static readonly SETTING_ID_PATTERNS = "workbench.editor.customLabels.patterns";
    static readonly SETTING_ID_ENABLED = "workbench.editor.customLabels.enabled";
    private readonly _onDidChange;
    readonly onDidChange: any;
    private patterns;
    private enabled;
    private cache;
    constructor(configurationService: IConfigurationService, workspaceContextService: IWorkspaceContextService);
    private registerListeners;
    private storeEnablementState;
    private _templateRegexValidation;
    private storeCustomPatterns;
    private patternWeight;
    getName(resource: URI): string | undefined;
    private applyPatterns;
    private readonly _parsedTemplateExpression;
    private readonly _filenameCaptureExpression;
    private applyTemplate;
    private removeLeadingDot;
    private getNthDirname;
    private getExtnames;
    private getNthExtname;
    private getNthFragment;
}
export declare const ICustomEditorLabelService: any;
export interface ICustomEditorLabelService {
    readonly _serviceBrand: undefined;
    readonly onDidChange: Event<void>;
    getName(resource: URI): string | undefined;
}
