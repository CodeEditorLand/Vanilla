import { Disposable } from "vs/base/common/lifecycle";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IStorageService } from "vs/platform/storage/common/storage";
import { IWorkspaceContextService } from "vs/platform/workspace/common/workspace";
import { IViewDescriptor } from "vs/workbench/common/views";
import { IWorkbenchEnvironmentService } from "vs/workbench/services/environment/common/environmentService";
import { IRemoteExplorerService } from "vs/workbench/services/remote/common/remoteExplorerService";
export declare const SELECTED_REMOTE_IN_EXPLORER: any;
export declare class SwitchRemoteViewItem extends Disposable {
    private readonly contextKeyService;
    private remoteExplorerService;
    private environmentService;
    private readonly storageService;
    private readonly workspaceContextService;
    private switchRemoteMenu;
    private completedRemotes;
    private readonly selectedRemoteContext;
    constructor(contextKeyService: IContextKeyService, remoteExplorerService: IRemoteExplorerService, environmentService: IWorkbenchEnvironmentService, storageService: IStorageService, workspaceContextService: IWorkspaceContextService);
    setSelectionForConnection(): boolean;
    private select;
    private getAuthorityForExplorerType;
    removeOptionItems(views: IViewDescriptor[]): void;
    createOptionItems(views: IViewDescriptor[]): void;
}
