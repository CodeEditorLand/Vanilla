import "vs/css!./media/scm";
import { IActionRunner } from "vs/base/common/actions";
import { ICommandService } from "vs/platform/commands/common/commands";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IContextMenuService } from "vs/platform/contextview/browser/contextView";
import { IHoverService } from "vs/platform/hover/browser/hover";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IKeybindingService } from "vs/platform/keybinding/common/keybinding";
import { IOpenerService } from "vs/platform/opener/common/opener";
import { IProgressService } from "vs/platform/progress/common/progress";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
import { IThemeService } from "vs/platform/theme/common/themeService";
import { IViewPaneOptions, ViewPane } from "vs/workbench/browser/parts/views/viewPane";
import { IViewDescriptorService } from "vs/workbench/common/views";
import { ISCMRepository, ISCMViewService } from "vs/workbench/contrib/scm/common/scm";
export declare class SCMHistoryViewPane extends ViewPane {
    private readonly _commandService;
    private readonly _scmViewService;
    private readonly _progressService;
    private _treeContainer;
    private _tree;
    private _treeDataSource;
    private _treeIdentityProvider;
    private _repositoryDescription;
    private _repositoryLoadMore;
    private readonly _actionRunner;
    private readonly _repositories;
    private readonly _visibilityDisposables;
    private readonly _treeOperationSequencer;
    private readonly _updateChildrenThrottler;
    private readonly _scmHistoryItemGroupHasRemoteContextKey;
    private readonly _providerCountBadgeConfig;
    constructor(options: IViewPaneOptions, _commandService: ICommandService, _scmViewService: ISCMViewService, _progressService: IProgressService, configurationService: IConfigurationService, contextMenuService: IContextMenuService, keybindingService: IKeybindingService, instantiationService: IInstantiationService, viewDescriptorService: IViewDescriptorService, contextKeyService: IContextKeyService, openerService: IOpenerService, themeService: IThemeService, telemetryService: ITelemetryService, hoverService: IHoverService);
    protected layoutBody(height: number, width: number): void;
    protected renderBody(container: HTMLElement): void;
    getActionRunner(): IActionRunner | undefined;
    refresh(repository?: ISCMRepository): Promise<void>;
    private _createTree;
    private _onDidOpen;
    private _onContextMenu;
    private _onDidChangeVisibleRepositories;
    private _getSelectedRepositories;
    private _getSelectedHistoryItems;
    private _getLoadMore;
    private _loadMoreCallback;
    private _getRepositoryDescription;
    private _setRepositoryDescription;
    private _isRepositoryNodeVisible;
    private _updateChildren;
    dispose(): void;
}