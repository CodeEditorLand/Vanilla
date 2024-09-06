import { DisposableStore } from "vs/base/common/lifecycle";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IStorageService } from "vs/platform/storage/common/storage";
import { IThemeService } from "vs/platform/theme/common/themeService";
import { IEditorGroupView, IEditorPartsView } from "vs/workbench/browser/parts/editor/editor";
import { EditorPart, IEditorPartUIState } from "vs/workbench/browser/parts/editor/editorPart";
import { IAuxiliaryWindowOpenOptions, IAuxiliaryWindowService } from "vs/workbench/services/auxiliaryWindow/browser/auxiliaryWindowService";
import { IAuxiliaryEditorPart } from "vs/workbench/services/editor/common/editorGroupsService";
import { IEditorService } from "vs/workbench/services/editor/common/editorService";
import { IHostService } from "vs/workbench/services/host/browser/host";
import { IWorkbenchLayoutService } from "vs/workbench/services/layout/browser/layoutService";
import { ILifecycleService } from "vs/workbench/services/lifecycle/common/lifecycle";
import { IStatusbarService } from "vs/workbench/services/statusbar/browser/statusbar";
import { ITitleService } from "vs/workbench/services/title/browser/titleService";
export interface IAuxiliaryEditorPartOpenOptions extends IAuxiliaryWindowOpenOptions {
    readonly state?: IEditorPartUIState;
}
export interface ICreateAuxiliaryEditorPartResult {
    readonly part: AuxiliaryEditorPartImpl;
    readonly instantiationService: IInstantiationService;
    readonly disposables: DisposableStore;
}
export declare class AuxiliaryEditorPart {
    private readonly editorPartsView;
    private readonly instantiationService;
    private readonly auxiliaryWindowService;
    private readonly lifecycleService;
    private readonly configurationService;
    private readonly statusbarService;
    private readonly titleService;
    private readonly editorService;
    private readonly layoutService;
    private static STATUS_BAR_VISIBILITY;
    constructor(editorPartsView: IEditorPartsView, instantiationService: IInstantiationService, auxiliaryWindowService: IAuxiliaryWindowService, lifecycleService: ILifecycleService, configurationService: IConfigurationService, statusbarService: IStatusbarService, titleService: ITitleService, editorService: IEditorService, layoutService: IWorkbenchLayoutService);
    create(label: string, options?: IAuxiliaryEditorPartOpenOptions): Promise<ICreateAuxiliaryEditorPartResult>;
}
declare class AuxiliaryEditorPartImpl extends EditorPart implements IAuxiliaryEditorPart {
    private readonly state;
    private static COUNTER;
    private readonly _onWillClose;
    readonly onWillClose: any;
    constructor(windowId: number, editorPartsView: IEditorPartsView, state: IEditorPartUIState | undefined, groupsLabel: string, instantiationService: IInstantiationService, themeService: IThemeService, configurationService: IConfigurationService, storageService: IStorageService, layoutService: IWorkbenchLayoutService, hostService: IHostService, contextKeyService: IContextKeyService);
    removeGroup(group: number | IEditorGroupView, preserveFocus?: boolean): void;
    private doRemoveLastGroup;
    protected loadState(): IEditorPartUIState | undefined;
    protected saveState(): void;
    close(): boolean;
    private doClose;
    private mergeGroupsToMainPart;
}
export {};
