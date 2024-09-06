import { Disposable } from "vs/base/common/lifecycle";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IStorageService } from "vs/platform/storage/common/storage";
import { IWorkbenchContribution } from "vs/workbench/common/contributions";
import { ISCMService } from "vs/workbench/contrib/scm/common/scm";
import { IEditorGroupsService } from "vs/workbench/services/editor/common/editorGroupsService";
import { IWorkbenchLayoutService } from "vs/workbench/services/layout/browser/layoutService";
export declare class SCMWorkingSetController extends Disposable implements IWorkbenchContribution {
    private readonly configurationService;
    private readonly editorGroupsService;
    private readonly scmService;
    private readonly storageService;
    private readonly layoutService;
    static readonly ID = "workbench.contrib.scmWorkingSets";
    private _workingSets;
    private _enabledConfig;
    private readonly _repositoryDisposables;
    constructor(configurationService: IConfigurationService, editorGroupsService: IEditorGroupsService, scmService: ISCMService, storageService: IStorageService, layoutService: IWorkbenchLayoutService);
    private _onDidAddRepository;
    private _onDidRemoveRepository;
    private _loadWorkingSets;
    private _saveWorkingSet;
    private _restoreWorkingSet;
    dispose(): void;
}
