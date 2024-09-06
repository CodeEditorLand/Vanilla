import { Disposable } from "vs/base/common/lifecycle";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IUriIdentityService } from "vs/platform/uriIdentity/common/uriIdentity";
import { IWorkbenchContribution } from "vs/workbench/common/contributions";
import { ISCMService, ISCMViewService } from "vs/workbench/contrib/scm/common/scm";
import { IActivityService } from "vs/workbench/services/activity/common/activity";
import { IEditorGroupsService } from "vs/workbench/services/editor/common/editorGroupsService";
import { IEditorService } from "vs/workbench/services/editor/common/editorService";
import { IStatusbarService } from "vs/workbench/services/statusbar/browser/statusbar";
import { ITitleService } from "vs/workbench/services/title/browser/titleService";
export declare class SCMActiveRepositoryController extends Disposable implements IWorkbenchContribution {
    private readonly activityService;
    private readonly configurationService;
    private readonly contextKeyService;
    private readonly editorService;
    private readonly scmService;
    private readonly scmViewService;
    private readonly statusbarService;
    private readonly titleService;
    private readonly _countBadgeConfig;
    private readonly _repositories;
    private readonly _focusedRepository;
    private readonly _activeEditor;
    private readonly _activeEditorRepository;
    /**
     * The focused repository takes precedence over the active editor repository when the observable
     * values are updated in the same transaction (or during the initial read of the observable value).
     */
    private readonly _activeRepository;
    private readonly _countBadgeRepositories;
    private readonly _countBadge;
    private _activeRepositoryNameContextKey;
    private _activeRepositoryBranchNameContextKey;
    constructor(activityService: IActivityService, configurationService: IConfigurationService, contextKeyService: IContextKeyService, editorService: IEditorService, scmService: ISCMService, scmViewService: ISCMViewService, statusbarService: IStatusbarService, titleService: ITitleService);
    private _getRepositoryResourceCount;
    private _updateActivityCountBadge;
    private _updateStatusBar;
    private _updateActiveRepositoryContextKeys;
}
export declare class SCMActiveResourceContextKeyController extends Disposable implements IWorkbenchContribution {
    private readonly scmService;
    private readonly uriIdentityService;
    private readonly _repositories;
    private readonly _onDidRepositoryChange;
    constructor(editorGroupsService: IEditorGroupsService, scmService: ISCMService, uriIdentityService: IUriIdentityService);
    private _getEditorHasChanges;
    private _getEditorRepositoryId;
    dispose(): void;
}
