import type { IMarkdownString } from "../../../base/common/htmlContent.js";
import { type UriComponents } from "../../../base/common/uri.js";
import { ILanguageService } from "../../../editor/common/languages/language.js";
import { IModelService } from "../../../editor/common/services/model.js";
import { ITextModelService } from "../../../editor/common/services/resolverService.js";
import { IUriIdentityService } from "../../../platform/uriIdentity/common/uriIdentity.js";
import { IWorkspaceContextService } from "../../../platform/workspace/common/workspace.js";
import { IQuickDiffService } from "../../contrib/scm/common/quickDiff.js";
import { ISCMService, ISCMViewService, type InputValidationType } from "../../contrib/scm/common/scm.js";
import { type IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { type MainThreadSCMShape, type SCMGroupFeatures, type SCMHistoryItemGroupDto, type SCMProviderFeatures, type SCMRawResourceSplices } from "../common/extHost.protocol.js";
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
