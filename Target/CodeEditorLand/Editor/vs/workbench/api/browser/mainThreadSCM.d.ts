import { IMarkdownString } from "vs/base/common/htmlContent";
import { UriComponents } from "vs/base/common/uri";
import { ILanguageService } from "vs/editor/common/languages/language";
import { IModelService } from "vs/editor/common/services/model";
import { ITextModelService } from "vs/editor/common/services/resolverService";
import { IUriIdentityService } from "vs/platform/uriIdentity/common/uriIdentity";
import { IWorkspaceContextService } from "vs/platform/workspace/common/workspace";
import { IQuickDiffService } from "vs/workbench/contrib/scm/common/quickDiff";
import { InputValidationType, ISCMService, ISCMViewService } from "vs/workbench/contrib/scm/common/scm";
import { IExtHostContext } from "vs/workbench/services/extensions/common/extHostCustomers";
import { MainThreadSCMShape, SCMGroupFeatures, SCMHistoryItemGroupDto, SCMProviderFeatures, SCMRawResourceSplices } from "../common/extHost.protocol";
export declare class MainThreadSCM implements MainThreadSCMShape {
    private readonly scmService;
    private readonly scmViewService;
    private readonly languageService;
    private readonly modelService;
    private readonly textModelService;
    private readonly quickDiffService;
    private readonly _uriIdentService;
    private readonly workspaceContextService;
    private readonly _proxy;
    private _repositories;
    private _repositoryBarriers;
    private _repositoryDisposables;
    private readonly _disposables;
    constructor(extHostContext: IExtHostContext, scmService: ISCMService, scmViewService: ISCMViewService, languageService: ILanguageService, modelService: IModelService, textModelService: ITextModelService, quickDiffService: IQuickDiffService, _uriIdentService: IUriIdentityService, workspaceContextService: IWorkspaceContextService);
    dispose(): void;
    $registerSourceControl(handle: number, id: string, label: string, rootUri: UriComponents | undefined, inputBoxDocumentUri: UriComponents): Promise<void>;
    $updateSourceControl(handle: number, features: SCMProviderFeatures): Promise<void>;
    $unregisterSourceControl(handle: number): Promise<void>;
    $registerGroups(sourceControlHandle: number, groups: [
        number,
        string,
        string,
        SCMGroupFeatures,
        boolean
    ][], splices: SCMRawResourceSplices[]): Promise<void>;
    $updateGroup(sourceControlHandle: number, groupHandle: number, features: SCMGroupFeatures): Promise<void>;
    $updateGroupLabel(sourceControlHandle: number, groupHandle: number, label: string): Promise<void>;
    $spliceResourceStates(sourceControlHandle: number, splices: SCMRawResourceSplices[]): Promise<void>;
    $unregisterGroup(sourceControlHandle: number, handle: number): Promise<void>;
    $setInputBoxValue(sourceControlHandle: number, value: string): Promise<void>;
    $setInputBoxPlaceholder(sourceControlHandle: number, placeholder: string): Promise<void>;
    $setInputBoxEnablement(sourceControlHandle: number, enabled: boolean): Promise<void>;
    $setInputBoxVisibility(sourceControlHandle: number, visible: boolean): Promise<void>;
    $showValidationMessage(sourceControlHandle: number, message: string | IMarkdownString, type: InputValidationType): Promise<void>;
    $setValidationProviderIsEnabled(sourceControlHandle: number, enabled: boolean): Promise<void>;
    $onDidChangeHistoryProviderCurrentHistoryItemGroup(sourceControlHandle: number, historyItemGroup: SCMHistoryItemGroupDto | undefined): Promise<void>;
}
