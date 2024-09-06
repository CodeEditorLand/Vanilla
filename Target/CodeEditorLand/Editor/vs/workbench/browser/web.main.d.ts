import { Disposable } from "vs/base/common/lifecycle";
import { IWorkbench, IWorkbenchConstructionOptions } from "vs/workbench/browser/web.api";
export declare class BrowserMain extends Disposable {
    private readonly domElement;
    private readonly configuration;
    private readonly onWillShutdownDisposables;
    private readonly indexedDBFileSystemProviders;
    constructor(domElement: HTMLElement, configuration: IWorkbenchConstructionOptions);
    private init;
    open(): Promise<IWorkbench>;
    private registerListeners;
    private initServices;
    private initializeUserData;
    private registerIndexedDBFileSystemProviders;
    private registerDeveloperActions;
    private createStorageService;
    private createWorkspaceService;
    private getCurrentProfile;
    private resolveWorkspace;
}
